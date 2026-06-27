import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { ScanReport } from "@spec-compass/shared";
import { getDeploymentInfo } from "./deployment.js";
import { isGeminiConfigured } from "./gemini.js";

interface FileInfo {
  path: string;
  ext: string;
  lines: number;
}

export interface ScanSourceInfo {
  type: "serverWorkspace" | "localPath" | "githubUrl";
  label: string;
  url: string | null;
  path: string;
  evidence: string[];
  warnings: string[];
}

function readOptionalEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function readDeploymentGitMetadata(): {
  branch: string | null;
  latestCommit: string | null;
  repositoryUrl: string | null;
} | null {
  const branch = readOptionalEnv("SPEC_COMPASS_GIT_BRANCH") || readOptionalEnv("BRANCH_NAME");
  const latestCommit = readOptionalEnv("SPEC_COMPASS_GIT_COMMIT") || readOptionalEnv("COMMIT_SHA");
  const repositoryUrl = readOptionalEnv("SPEC_COMPASS_GIT_REPOSITORY") || readOptionalEnv("REPOSITORY_URL");

  if (!branch && !latestCommit && !repositoryUrl) {
    return null;
  }

  return {
    branch,
    latestCommit,
    repositoryUrl,
  };
}

// Helper to recursively walk a directory and collect file info
async function walkDir(dir: string, baseDir: string, filesList: FileInfo[] = []): Promise<FileInfo[]> {
  let files: string[];
  try {
    files = await fs.promises.readdir(dir);
  } catch (err) {
    return filesList;
  }

  for (const file of files) {
    const filePath = path.join(dir, file);
    let stat: fs.Stats;
    try {
      stat = await fs.promises.stat(filePath);
    } catch {
      continue;
    }

    const relPath = path.relative(baseDir, filePath);

    // Ignore common build/dependency artifacts
    if (
      file === "node_modules" ||
      file === ".git" ||
      file === "dist" ||
      file === "build" ||
      file === ".vite" ||
      file === ".idea" ||
      file === ".vscode" ||
      file === "coverage" ||
      relPath.startsWith("node_modules") ||
      relPath.startsWith(".git")
    ) {
      continue;
    }

    if (stat.isDirectory()) {
      await walkDir(filePath, baseDir, filesList);
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      let lines = 0;

      // Only count lines for text files
      const textExtensions = [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".css", ".html", ".gitignore", ".yml", ".yaml"];
      if (textExtensions.includes(ext)) {
        try {
          const content = await fs.promises.readFile(filePath, "utf-8");
          lines = content.split("\n").length;
        } catch {
          // ignore read errors for binary or unreadable files
        }
      }

      filesList.push({
        path: relPath,
        ext,
        lines,
      });
    }
  }

  return filesList;
}

export async function runScan(targetPath: string, sourceInfo?: Partial<ScanSourceInfo>): Promise<ScanReport> {
  const absolutePath = path.resolve(targetPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Target path does not exist: ${absolutePath}`);
  }

  // 1. Gather files and lines
  const fileInfos = await walkDir(absolutePath, absolutePath);
  const totalFiles = fileInfos.length;
  const totalLines = fileInfos.reduce((sum, f) => sum + f.lines, 0);

  // Group languages
  const languageMap: Record<string, number> = {};
  for (const f of fileInfos) {
    let lang = "Other";
    if (f.ext === ".ts") lang = "TypeScript";
    else if (f.ext === ".tsx") lang = "React TypeScript";
    else if (f.ext === ".js") lang = "JavaScript";
    else if (f.ext === ".jsx") lang = "React JavaScript";
    else if (f.ext === ".json") lang = "JSON";
    else if (f.ext === ".md") lang = "Markdown";
    else if (f.ext === ".css") lang = "CSS";
    else if (f.ext === ".html") lang = "HTML";

    languageMap[lang] = (languageMap[lang] || 0) + f.lines;
  }

  const languages = Object.entries(languageMap)
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => b.lines - a.lines);

  // 2. Scan framework/package signals
  const dependencies: string[] = [];
  const devDependencies: string[] = [];

  // Read root package.json if exists
  const rootPackageJsonPath = path.join(absolutePath, "package.json");
  if (fs.existsSync(rootPackageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(rootPackageJsonPath, "utf-8"));
      if (pkg.dependencies) dependencies.push(...Object.keys(pkg.dependencies));
      if (pkg.devDependencies) devDependencies.push(...Object.keys(pkg.devDependencies));
    } catch {
      // invalid json
    }
  }

  // Search nested package.json files
  for (const f of fileInfos) {
    if (f.path !== "package.json" && f.path.endsWith("package.json")) {
      try {
        const pkgPath = path.join(absolutePath, f.path);
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.dependencies) dependencies.push(...Object.keys(pkg.dependencies));
        if (pkg.devDependencies) devDependencies.push(...Object.keys(pkg.devDependencies));
      } catch {}
    }
  }

  // Deduplicate dependencies
  const allDeps = Array.from(new Set([...dependencies, ...devDependencies]));

  // Detect tech stack parts
  const frontend: string[] = [];
  const backend: string[] = [];
  const network: string[] = [];
  const database: string[] = [];
  const data: string[] = [];
  const deploy: string[] = [];
  const test: string[] = [];

  if (allDeps.includes("react")) frontend.push("React");
  if (allDeps.some(d => d.startsWith("@mui/"))) frontend.push("Material UI (MUI)");
  if (fileInfos.some(f => f.ext === ".tsx")) frontend.push("React TSX");
  if (allDeps.includes("i18next") || allDeps.includes("react-i18next")) frontend.push("i18next");

  if (allDeps.includes("fastify")) backend.push("Fastify");
  if (allDeps.includes("express")) backend.push("Express");
  if (fileInfos.some(f => f.path.includes("apps/api") || f.path.includes("server/"))) backend.push("Node.js Service");

  // API is network
  if (allDeps.includes("fastify") || allDeps.includes("express")) network.push("HTTP/REST APIs");
  if (allDeps.includes("axios") || fileInfos.some(f => f.lines > 0 && f.path.includes("api/"))) network.push("REST Clients");

  if (allDeps.includes("pg") || allDeps.includes("postgres")) database.push("PostgreSQL");
  if (allDeps.includes("mongoose") || allDeps.includes("mongodb")) database.push("MongoDB");
  if (allDeps.includes("sqlite3") || allDeps.includes("better-sqlite3")) database.push("SQLite");

  if (allDeps.includes("zod")) data.push("Zod Schema");
  if (allDeps.includes("@google/genai")) data.push("Gemini GenAI SDK");

  // Deploy
  const hasDockerfile = fs.existsSync(path.join(absolutePath, "Dockerfile")) || fileInfos.some(f => f.path.includes("Dockerfile"));
  const hasCloudRunGuide = fileInfos.some(f => f.path.toLowerCase().includes("cloud-run"));
  const isCloudRunRuntime = Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
  const deployment = getDeploymentInfo(absolutePath);
  const source: ScanSourceInfo = {
    type: sourceInfo?.type || "localPath",
    label: sourceInfo?.label || path.basename(absolutePath) || absolutePath,
    url: sourceInfo?.url ?? null,
    path: sourceInfo?.path || absolutePath,
    evidence: sourceInfo?.evidence || [`Scanning filesystem path: ${absolutePath}`],
    warnings: sourceInfo?.warnings || [],
  };

  if (hasDockerfile) {
    deploy.push("Docker");
  }
  if (hasCloudRunGuide) {
    deploy.push("Cloud Run Deploy Guide");
  }
  if (isCloudRunRuntime) {
    deploy.push("Cloud Run Runtime");
  }
  if (fs.existsSync(path.join(absolutePath, "app.yaml"))) {
    deploy.push("App Engine");
  }
  if (allDeps.includes("firebase-tools")) {
    deploy.push("Firebase Hosting");
  }

  // Test
  if (allDeps.includes("jest")) test.push("Jest");
  if (allDeps.includes("vitest")) test.push("Vitest");
  if (allDeps.includes("mocha")) test.push("Mocha");

  // Defaults if empty
  if (frontend.length === 0 && fileInfos.some(f => f.ext === ".html")) frontend.push("Vanilla HTML");
  if (backend.length === 0 && fileInfos.some(f => f.path.endsWith(".js") && !f.path.includes("web"))) backend.push("Node.js");
  if (deploy.length === 0) deploy.push("Local Execution");
  if (test.length === 0) test.push("None Detected");
  if (database.length === 0) database.push("None / In-Memory");

  // 3. Git Status detection
  let isRepository = false;
  let branch = "unknown";
  let hasCommits = false;
  let latestCommit: string | null = null;
  let isDirty = false;
  let untrackedCount = 0;
  let gitSource: "filesystem" | "deployment" | "missing" = "missing";
  const statusSummary: string[] = [];
  const gitEvidence: string[] = [];

  try {
    isRepository = fs.existsSync(path.join(absolutePath, ".git"));
    if (isRepository) {
      gitSource = "filesystem";
      // Branch name
      const branchBuf = execSync("git branch --show-current", { cwd: absolutePath });
      branch = branchBuf.toString().trim() || "main";
      gitEvidence.push(`git branch --show-current: ${branch}`);

      // Commits check
      try {
        const commitCountBuf = execSync("git rev-list --count HEAD", { cwd: absolutePath, stdio: ["pipe", "pipe", "ignore"] });
        const count = parseInt(commitCountBuf.toString().trim(), 10);
        if (count > 0) {
          hasCommits = true;
          const logBuf = execSync("git log -1 --oneline", { cwd: absolutePath });
          latestCommit = logBuf.toString().trim();
          gitEvidence.push(`git log -1 --oneline: ${latestCommit}`);
        } else {
          gitEvidence.push("git rev-list --count HEAD: 0 (No commits yet)");
        }
      } catch {
        gitEvidence.push("git rev-list check failed: No commits yet on main");
      }

      // Dirty status
      const statusBuf = execSync("git status --short", { cwd: absolutePath });
      const statusStr = statusBuf.toString().trim();
      gitEvidence.push(`git status --short:\n${statusStr || "(clean)"}`);

      if (statusStr) {
        isDirty = true;
        const lines = statusStr.split("\n");
        for (const line of lines) {
          statusSummary.push(line);
          if (line.startsWith("??")) {
            untrackedCount++;
          }
        }
      }
    } else {
      const deploymentGit = readDeploymentGitMetadata();
      if (deploymentGit) {
        gitSource = "deployment";
        isRepository = true;
        branch = deploymentGit.branch || "deployed";
        latestCommit = deploymentGit.latestCommit;
        hasCommits = Boolean(latestCommit);
        gitEvidence.push("Git metadata source: deployment environment");
        gitEvidence.push(`SPEC_COMPASS_GIT_BRANCH: ${deploymentGit.branch || "missing"}`);
        gitEvidence.push(`SPEC_COMPASS_GIT_COMMIT: ${deploymentGit.latestCommit || "missing"}`);
        if (deploymentGit.repositoryUrl) {
          gitEvidence.push(`SPEC_COMPASS_GIT_REPOSITORY: ${deploymentGit.repositoryUrl}`);
        }
        gitEvidence.push("Working tree status unavailable in immutable deployment runtime");
      }
    }
  } catch (err: any) {
    gitEvidence.push(`Git command execution failed: ${err.message}`);
  }

  // 4. Identify key directories
  const keyDirectories: { path: string; purpose: string }[] = [];
  const possibleDirs = [
    { p: "docs", desc: "Project Documentation" },
    { p: "apps", desc: "Monorepo Application Scope" },
    { p: "packages", desc: "Shared Monorepo Packages" },
    { p: "apps/api", desc: "Fastify Backend API Server" },
    { p: "apps/web", desc: "Vite + React UI Client" },
    { p: "packages/shared", desc: "Shared Schemas and Utilities" },
  ];

  for (const d of possibleDirs) {
    if (fs.existsSync(path.join(absolutePath, d.p))) {
      keyDirectories.push({ path: d.p, purpose: d.desc });
    }
  }

  // 5. Completion rates logic based on facts
  let productScore = 100;
  let engineeringScore = 100;
  let evidenceConfidence = 100;

  const gaps: string[] = [];
  const geminiActive = isGeminiConfigured();
  const testsMissing = test.includes("None Detected");
  const localOnlyDeploy = deploy.includes("Local Execution") && deploy.length === 1;
  const deployReady = deploy.some(item => item !== "Local Execution");
  const deploymentUnverified = !deployment.verified;

  // Product score deductions
  if (!geminiActive) {
    productScore -= 20;
    gaps.push("Gemini API is in fallback mode (missing API key)");
    // This is a separate product promise from generation: fallback analogies can
    // still render, but the three-language copy review is not verified.
    productScore -= 15;
    gaps.push("Multilingual translations are unverified (requires Gemini review)");
  }
  if (localOnlyDeploy) {
    productScore -= 15;
    gaps.push("Deployment target is Local Only (no Cloud Run deployment verified)");
  } else if (deploymentUnverified) {
    productScore -= 8;
    gaps.push("Cloud Run deploy artifacts exist, but no live Cloud Run revision has been verified");
  }
  if (!isRepository) {
    productScore -= 20;
    gaps.push("Project is not initialized with Git");
  } else if (!hasCommits) {
    productScore -= 15;
    gaps.push(gitSource === "deployment" ? "Deployment Git metadata does not include a commit hash" : "No commits exist on main branch");
  }
  if (testsMissing) {
    productScore -= 10;
    gaps.push("Quality assurance tests are missing");
  }

  // Engineering score deductions
  if (!geminiActive) {
    engineeringScore -= 10;
  }
  if (testsMissing) {
    engineeringScore -= 25;
  }
  if (localOnlyDeploy) {
    engineeringScore -= 15;
  } else if (deploymentUnverified) {
    engineeringScore -= 5;
  }
  if (!isRepository) {
    engineeringScore -= 20;
  } else if (!hasCommits) {
    engineeringScore -= 15;
  }

  // Evidence Confidence deductions
  if (!geminiActive) {
    evidenceConfidence -= 25;
  }
  if (testsMissing) {
    evidenceConfidence -= 25;
  }
  if (localOnlyDeploy) {
    evidenceConfidence -= 15;
  } else if (deploymentUnverified) {
    evidenceConfidence -= 10;
  }
  if (!isRepository) {
    evidenceConfidence -= 20;
  } else if (!hasCommits) {
    evidenceConfidence -= 15;
  }
  if (isDirty) {
    evidenceConfidence -= 10;
    gaps.push("Workspace has uncommitted changes");
  }

  // Keep bounds in [0, 100]
  productScore = Math.max(0, Math.min(100, productScore));
  engineeringScore = Math.max(0, Math.min(100, engineeringScore));
  evidenceConfidence = Math.max(0, Math.min(100, evidenceConfidence));

  // 6. Define Functional Areas Status
  const webExists = fs.existsSync(path.join(absolutePath, "apps/web"));
  const apiExists = fs.existsSync(path.join(absolutePath, "apps/api"));

  const areas = [
    {
      name: "Frontend UI Workspace",
      score: webExists ? (geminiActive ? 100 : 70) : 0,
      status: (webExists ? (geminiActive ? "verified" : "partial") : "missing") as any,
      evidence: webExists
        ? [`Directory apps/web exists`, `Contains ${fileInfos.filter(f => f.path.startsWith("apps/web")).length} files`, geminiActive ? "Translations reviewed via Gemini" : "Translations unverified"]
        : ["No apps/web directory detected"],
      gaps: webExists ? (geminiActive ? [] : ["Multilingual translations are unverified (missing Gemini API key for review)"]) : ["Create Vite React frontend app"],
      nextActions: webExists ? (geminiActive ? ["Optimize bundle sizes"] : ["Configure Google Cloud ADC or GEMINI_API_KEY to review translations"]) : ["Setup apps/web scaffold"],
    },
    {
      name: "Backend API Workspace",
      score: apiExists ? (geminiActive ? 100 : 80) : 0,
      status: (apiExists ? (geminiActive ? "verified" : "partial") : "missing") as any,
      evidence: apiExists
        ? [`Directory apps/api exists`, `Contains ${fileInfos.filter(f => f.path.startsWith("apps/api")).length} files`, geminiActive ? "Gemini API integration active" : "Gemini API in fallback mode"]
        : ["No apps/api directory detected"],
      gaps: apiExists ? (geminiActive ? [] : ["Gemini API integration is running in fallback mode"]) : ["Create Fastify Node API server"],
      nextActions: apiExists ? (geminiActive ? ["Refine error boundaries"] : ["Configure Google Cloud ADC or GEMINI_API_KEY environment variable"]) : ["Setup apps/api scaffold"],
    },
    {
      name: "Engineering Monitor",
      score: testsMissing ? 65 : 85,
      status: (testsMissing ? "partial" : "usable") as any,
      evidence: [
        `Measured ${totalFiles} files and ${totalLines} total lines`,
        `Detected languages: ${languages.map(language => `${language.name} ${language.lines}`).join(", ") || "none"}`,
        `Detected stack: ${allDeps.length} package signals`,
        testsMissing ? "No benchmark/test framework detected" : `Test framework detected: ${test.join(", ")}`,
      ],
      gaps: [
        "Historical scan snapshots are not persisted yet",
        testsMissing ? "No test framework available for benchmark automation" : "Performance benchmarks are local/browser-only until persisted",
      ].filter(Boolean),
      nextActions: [
        "Persist scan snapshots to compare line growth over time",
        "Add a benchmark script for API latency and frontend bundle size",
        "Warn when new dependencies or large line deltas cross approved thresholds",
      ],
    },
    {
      name: "Cloud Run Readiness",
      score: deployment.verified ? 100 : (deployReady ? 65 : 0),
      status: (deployment.verified ? "verified" : (deployReady ? "partial" : "missing")) as any,
      evidence: deployReady
        ? [`Deploy artifacts detected: ${deploy.join(", ")}`, ...deployment.evidence]
        : ["No Dockerfile or Cloud Run deploy guide detected"],
      gaps: deployment.verified
        ? []
        : (deployReady ? ["No live Cloud Run service URL or runtime revision has been verified"] : ["Add Cloud Run deploy artifacts"]),
      nextActions: deployment.verified
        ? ["Monitor Cloud Run revision logs"]
        : (deployReady ? ["Run gcloud run deploy and capture the service URL"] : ["Add Dockerfile and Cloud Run deploy notes"]),
    },
    {
      name: "Git Version Control",
      score: isRepository ? (hasCommits ? 100 : 50) : 0,
      status: (isRepository ? (hasCommits ? "verified" : "partial") : "missing") as any,
      evidence: isRepository
        ? [
            gitSource === "deployment" ? "Git baseline detected from deployment metadata" : "Git repository detected on filesystem",
            `Current branch is '${branch}'`,
            hasCommits ? `Latest commit: ${latestCommit || "present"}` : "No commit hash present yet",
          ]
        : ["No git history found"],
      gaps: isRepository
        ? (hasCommits ? [] : [gitSource === "deployment" ? "Inject SPEC_COMPASS_GIT_COMMIT during deploy" : "No initial commit has been made yet"])
        : ["Run git init"],
      nextActions: isRepository
        ? (hasCommits ? [gitSource === "deployment" ? "Keep deploy Git metadata updated" : "Keep changes minimal"] : ["Make first git commit on main"])
        : ["Initialize git repository"],
    },
    {
      name: "Quality Assurance (Tests)",
      score: testsMissing ? 0 : 100,
      status: (testsMissing ? "missing" : "verified") as any,
      evidence: testsMissing ? ["No testing framework found in package.json"] : [`Testing framework detected: ${test.join(", ")}`],
      gaps: testsMissing ? ["No unit or integration tests exist"] : [],
      nextActions: testsMissing ? ["Add Vitest or Jest test suite", "Add API health check verification tests"] : ["Run test suites"],
    },
  ];

  // 7. Find Drift
  const drift: any[] = [];

  // Drift: approved UI stack is React + MUI, so only flag unapproved UI frameworks.
  const unapprovedUiDeps = allDeps.filter(d =>
    d.startsWith("tailwind") ||
    d === "bootstrap" ||
    d.startsWith("@chakra-ui/") ||
    d.startsWith("@mantine/") ||
    d.startsWith("antd")
  );
  if (unapprovedUiDeps.length > 0) {
    drift.push({
      severity: "medium",
      claim: "Potential UI Library Drift",
      evidence: [`Detected unapproved UI packages: ${unapprovedUiDeps.join(", ")}`],
      suggestedFix: "Consolidate UI on Material UI (MUI). Avoid introducing TailwindCSS or Bootstrap unless approved.",
    });
  }

  // Drift: Python files detected while approved stack is TS/JS
  const hasPython = fileInfos.some(f => f.ext === ".py");
  if (hasPython) {
    drift.push({
      severity: "high",
      claim: "Unapproved Python Backend Scripting",
      evidence: ["Found files with .py extension in the repository"],
      suggestedFix: "Port Python script logic to Node.js/TypeScript Fastify endpoints as defined by approved stack limits.",
    });
  }

  // 8. Simulated Agent Operating Model Status
  const agentOperatingModel = {
    agents: [
      {
        id: "pm",
        label: "Orchestrator / PM Agent",
        role: "Break work into bounded tasks, route to agents, enforce budget and stop conditions",
        allowedTools: ["filesystem-read", "git-status"],
        preferredCapabilities: ["planning", "context-control"],
        evidenceRequired: ["task-graph", "status-summary"],
        stopCondition: "Stop if tasks cycle repeatedly without making progress",
      },
      {
        id: "scanner",
        label: "Scanner Agent",
        role: "Measure files, languages, frameworks, tests, docs, and deploy evidence",
        allowedTools: ["filesystem", "git", "package-manager"],
        preferredCapabilities: ["cheap-classification"],
        evidenceRequired: ["command-output", "file-reference"],
        stopCondition: "Stop if project input path is inaccessible",
      },
      {
        id: "architect",
        label: "Architect Agent",
        role: "Check stack fit, boundaries, risks, and forbidden drift",
        allowedTools: ["filesystem-read"],
        preferredCapabilities: ["strong-reasoning", "long-context"],
        evidenceRequired: ["architecture-claims-referenced"],
        stopCondition: "Stop if design parameters exceed approved limits",
      },
      {
        id: "analogy",
        label: "Analogy Agent",
        role: "Translate technical evidence into user-selected metaphors and images",
        allowedTools: ["gemini-api"],
        preferredCapabilities: ["multimodal-explanation", "creative-translation"],
        evidenceRequired: ["evidence-backed-analogy"],
        stopCondition: "Stop if Gemini API is unavailable",
      },
      {
        id: "critic",
        label: "Critic Agent",
        role: "Review for hallucination, missing evidence, scope drift, and weak tests",
        allowedTools: ["filesystem-read"],
        preferredCapabilities: ["independent-reasoning"],
        evidenceRequired: ["findings-with-severity"],
        stopCondition: "Stop if review checklist is complete",
      },
    ],
    routes: [
      {
        taskType: "codebase-metrics",
        agentId: "scanner",
        preferredCapabilities: ["cheap-classification"],
        routingReason: "Requires exact, non-hallucinated counts from the filesystem.",
      },
      {
        taskType: "analogy-interpretation",
        agentId: "analogy",
        preferredCapabilities: ["creative-translation", "multimodal-explanation"],
        routingReason: "Requires creative narrative writing and diagram Generation based on scanner data.",
      },
      {
        taskType: "drift-supervision",
        agentId: "architect",
        preferredCapabilities: ["strong-reasoning"],
        routingReason: "Checks file configurations against ADR approved stack constraints.",
      },
    ],
    timeline: [
      {
        agentId: "scanner",
        claim: "Deterministic scan complete",
        evidence: [`Traversed ${totalFiles} files`, `Measured ${totalLines} total lines of code`],
        nextAction: "Pass scan results to Orchestrator to route explanation phase.",
      },
    ],
  };

  // 9. Generate Launch Packet (Markdown String)
  // Fill template as defined in docs/agent/operating-model.md
  const deploymentStatus = deployment.verified
    ? `verified Cloud Run service ${deployment.service || "unknown"} revision ${deployment.revision || "unknown"} at ${deployment.url || "unknown URL"}`
    : deployment.environment === "cloud-run"
      ? "Cloud Run runtime detected, but public URL or revision evidence is incomplete"
      : "local preview only; Cloud Run runtime not detected";
  const deploymentNextTask = deployment.verified
    ? "Keep the verified Cloud Run URL, revision, /api/health, /api/scan, and Gemini checks current in the Launch Packet."
    : "Deploy Fastify backend serving web assets to Cloud Run or Agent Runtime and verify the live URL.";
  const translationNextTask = geminiActive
    ? "Keep English, Japanese, and Chinese UI copy reviewed; rerun Gemini translation review whenever visible copy changes."
    : "Complete i18n extraction and Gemini translation review for English, Japanese, and Chinese, or keep status visibly unverified.";
  const launchPacket = `You are the engineering agent for this project. Follow the project intent and do not drift from the approved stack.

Project goal:
Spec Compass turns a software project into a shared control surface for non-technical users, engineers, and AI agents. It scans the workspace, generates explanatory analogies, and outputs a structured handoff.

Target stack:
- Frontend: Vite + React + TypeScript
- UI system: Material UI (MUI)
- Backend: Node.js + TypeScript + Fastify
- Data: Zod Schema validation
- AI: Gemini API for evidence-backed analogy and translation review
- i18n: i18next + react-i18next for en, ja, zh-CN
- Deploy: Cloud Run or Agent Runtime

Non-negotiable product surfaces:
1. Project Scan: real scanner facts, progress bars, risk red lights, evidence, Git status, and Engineering Monitor.
2. Analogy View: profession/object analogy, diagram, vocabulary layer, benefits, limitations, and module-to-evidence mapping.
3. Launch Packet: copyable agent prompt, supervision rules, next tasks, forbidden drift, completion standards, verification, and current Git state.

Forbidden drift:
- Do not add unapproved frameworks or dependencies (e.g. TailwindCSS, Bootstrap, Python).
- Do not replace the approved data layer (Zod).
- Do not bypass the planned architecture.
- Do not use mock data as proof of completion unless the task is explicitly a prototype.
- Do not claim completion without verification evidence.
- Do not claim Gemini, translation, or deployment readiness from fallback output.

Operating mode:
- One Orchestrator routes all specialist work.
- Specialists must return evidence for every claim.
- Do not start the next phase until the current phase has verification evidence.
- Stop after repeated blockers, budget exhaustion, or missing required input.

Current status:
- Product completion: ${productScore}% with ${100 - productScore}% remaining.
- Engineering completion: ${engineeringScore}% with ${100 - engineeringScore}% remaining.
- Evidence confidence: ${evidenceConfidence}% with ${100 - evidenceConfidence}% remaining.
- Git: branch ${branch}; commits ${hasCommits ? "present" : "not present"}; dirty ${isDirty ? "yes" : "no"}; untracked files ${untrackedCount}.
- Deployment: ${deploymentStatus}.
- Scan source path: ${deployment.sourcePath}.
- User-selected source: ${source.label}${source.url ? ` (${source.url})` : ""}.

Next tasks:
1. ${translationNextTask}
2. Keep Project Scan, Analogy View, Launch Packet, and Engineering Monitor working after each change.
3. ${deploymentNextTask}

Completion standard:
- The change runs locally or in the target environment.
- npm test and npm run build pass, or any failure is reported with exact output.
- /api/health and /api/scan have been checked.
- /api/generate-explanation and /api/translate-copy have been checked when Gemini credentials are configured.
- If deployed, the public URL, service, revision, and scan source path are reported from deterministic deployment evidence.
- The result is reported with exact evidence.
- Any skipped check or uncertainty is named.`;

  return {
    project: {
      name: source.type === "githubUrl" ? source.label : "tui-gui",
      goal: source.type === "githubUrl"
        ? `Explain ${source.label} from scanner evidence, then generate an analogy and Launch Packet.`
        : "Build Spec Compass - an evidence-backed project scanner and translation review app.",
      targetUsers: ["founders", "product managers", "engineers", "AI coding agents"],
    },
    detectedStack: {
      frontend,
      backend,
      network,
      database,
      data,
      deploy,
      test,
    },
    git: {
      isRepository,
      branch,
      hasCommits,
      latestCommit,
      isDirty,
      untrackedCount,
      statusSummary,
      evidence: gitEvidence,
    },
    inventory: {
      files: totalFiles,
      lines: totalLines,
      languages,
      keyDirectories,
    },
    completion: {
      product: productScore,
      engineering: engineeringScore,
      evidenceConfidence,
    },
    source,
    deployment,
    areas,
    drift,
    agentOperatingModel,
    launchPacket,
  };
}
