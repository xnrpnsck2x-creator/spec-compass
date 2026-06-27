import { GoogleGenAI, type GoogleGenAIOptions } from "@google/genai";
import { ScanReport, AnalogyResponse, type Locale } from "@spec-compass/shared";
import * as path from "path";
import * as dotenv from "dotenv";

// Load API-local env before reading process.env. This works when npm starts the
// workspace from the repo root and when tsx runs from apps/api during dev.
if (process.env.NODE_ENV !== "test") {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
  dotenv.config();
}

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const cloudProject = process.env.GOOGLE_CLOUD_PROJECT || "";
const cloudLocation = process.env.GOOGLE_CLOUD_LOCATION || "global";
const useEnterprise = process.env.GOOGLE_GENAI_USE_ENTERPRISE === "true";
const hasKey = apiKey.trim().length > 0;
const hasCloudConfig = useEnterprise && cloudProject.trim().length > 0 && cloudLocation.trim().length > 0;

let ai: GoogleGenAI | null = null;
if (hasCloudConfig) {
  const options: GoogleGenAIOptions = {
    enterprise: true,
    project: cloudProject,
    location: cloudLocation,
  };
  ai = new GoogleGenAI(options);
} else if (hasKey) {
  ai = new GoogleGenAI({ apiKey });
}

const GLOSSARY = {
  framework: { en: "framework", ja: "フレームワーク", "zh-CN": "框架" },
  launchPacket: { en: "Launch Packet", ja: "ローンチパケット", "zh-CN": "启动包" },
  frontend: { en: "frontend", ja: "フロントエンド", "zh-CN": "前端" },
  backend: { en: "backend", ja: "バックエンド", "zh-CN": "后端" },
  API: { en: "API", ja: "API", "zh-CN": "API" },
  scanner: { en: "scanner", ja: "スキャナー", "zh-CN": "扫描器" },
  evidence: { en: "evidence", ja: "証拠", "zh-CN": "证据" },
  "Gemini API": { en: "Gemini API", ja: "Gemini API", "zh-CN": "Gemini API" },
  "Cloud Run": { en: "Cloud Run", ja: "Cloud Run", "zh-CN": "Cloud Run" },
  "Agent Runtime": { en: "Agent Runtime", ja: "Agent Runtime", "zh-CN": "Agent Runtime" },
  TypeScript: { en: "TypeScript", ja: "TypeScript", "zh-CN": "TypeScript" },
  React: { en: "React", ja: "React", "zh-CN": "React" },
  MUI: { en: "MUI", ja: "MUI", "zh-CN": "MUI" },
  "Node.js": { en: "Node.js", ja: "Node.js", "zh-CN": "Node.js" },
  Fastify: { en: "Fastify", ja: "Fastify", "zh-CN": "Fastify" },
  Zod: { en: "Zod", ja: "Zod", "zh-CN": "Zod" },
  tests: { en: "tests", ja: "テスト", "zh-CN": "测试" },
  Git: { en: "Git", ja: "Git", "zh-CN": "Git" }
};

const ANALOGY_LABELS: Record<
  Locale,
  {
    claim: string;
    analogy: string;
    evidence: string;
    benefit: string;
    limitation: string;
    nextAction: string;
  }
> = {
  en: {
    claim: "Claim",
    analogy: "Analogy",
    evidence: "Evidence",
    benefit: "Benefit",
    limitation: "Limitation",
    nextAction: "Next action",
  },
  ja: {
    claim: "主張",
    analogy: "比喩",
    evidence: "根拠",
    benefit: "利点",
    limitation: "制限",
    nextAction: "次のアクション",
  },
  "zh-CN": {
    claim: "主张",
    analogy: "类比",
    evidence: "证据",
    benefit: "优点",
    limitation: "限制",
    nextAction: "下一步",
  },
};

const OUTPUT_LANGUAGE: Record<Locale, string> = {
  en: "English",
  ja: "Japanese",
  "zh-CN": "Simplified Chinese",
};

const VOCABULARY_FALLBACK_COPY: Record<
  Locale,
  {
    claim: (term: string) => string;
    role: string;
    evidence: string;
    benefit: string;
    limitation: string;
    nextAction: string;
  }
> = {
  en: {
    claim: (term) => `${term} is part of the detected project stack.`,
    role: "Unverified analogy role.",
    evidence: "Unverified.",
    benefit: "Explains this technology's job in the system.",
    limitation: "This fallback module is synthesized from vocabulary because Gemini did not return a full explanation string.",
    nextAction: "Regenerate the analogy after the next scan and keep evidence beside each claim.",
  },
  ja: {
    claim: (term) => `${term} は検出済み技術スタックの一部です。`,
    role: "類比上の役割は未検証です。",
    evidence: "未検証です。",
    benefit: "この技術がシステム内で担う仕事を説明します。",
    limitation: "Gemini が完全な説明文を返さなかったため、語彙表から合成したフォールバックです。",
    nextAction: "次回スキャン後に類比を再生成し、各主張の横に根拠を残してください。",
  },
  "zh-CN": {
    claim: (term) => `${term} 是当前项目已检测到的技术栈组成部分。`,
    role: "类比角色未验证。",
    evidence: "未验证。",
    benefit: "说明这项技术在系统里负责什么工作。",
    limitation: "这是根据词汇表合成的兜底说明，因为 Gemini 没有返回完整解释正文。",
    nextAction: "下一次扫描后重新生成类比，并继续把证据放在每个结论旁边。",
  },
};

const EMPTY_EXPLANATION_COPY: Record<Locale, string> = {
  en: "No explanation generated.",
  ja: "説明は生成されませんでした。",
  "zh-CN": "未生成解释。",
};

export function isGeminiConfigured(): boolean {
  return Boolean(ai);
}

export async function generateExplanation(
  report: ScanReport,
  identity: "boss" | "designer" | "sales",
  analogy: "bicycle" | "house" | "plant" | "human body",
  locale: Locale = "en"
): Promise<AnalogyResponse> {
  if (!ai) {
    return getFallbackAnalogy(report, identity, analogy, locale);
  }

  const prompt = `You are an expert software architect and communicator. Translate the following project scan report into a user-selected analogy explanation.

User Profession Preset: ${identity}
Selected Basic Object: ${analogy}
Output Language: ${OUTPUT_LANGUAGE[locale]} (${locale})

Here is the deterministic scan report of the project:
${JSON.stringify(report, null, 2)}

Evidence rules:
- Use only measured facts present in the scan report for file paths, counts, packages, Git status, tests, deployment, Gemini status, and translation status.
- If a fact is missing, weak, fallback-only, or unverified, say "Unverified" or name the blocker instead of guessing.
- Do not claim the app is event-ready unless the report proves Gemini is configured, translation review passed, and deployment has a verified URL.
- Write all user-facing explanation, vocabulary job, role, and evidence text in ${OUTPUT_LANGUAGE[locale]}. Keep product names, package names, file paths, commands, JSON keys, and Mermaid syntax unchanged.
- For ${locale}, use these module labels inside the explanation string: ${ANALOGY_LABELS[locale].claim}, ${ANALOGY_LABELS[locale].analogy}, ${ANALOGY_LABELS[locale].evidence}, ${ANALOGY_LABELS[locale].benefit}, ${ANALOGY_LABELS[locale].limitation}, ${ANALOGY_LABELS[locale].nextAction}.

Requirements:
1. Write a comprehensive explanation structured as multiple logical modules. Explain framework, architecture, programming language, tools, benefits, and limitations. For each module, write in this specific format:
   Claim: <what is being explained, e.g. "React UI frontend is partial">
   Analogy: <metaphor description mapping the engineering concept to the ${analogy} object, tailored to the user's profession: ${identity}>
   Evidence: <list scanner facts from the report that prove this claim, e.g. "apps/web/package.json contains react but files counts are low">
   Benefit: <why this technical choice helps>
   Limitation: <what this choice does not solve yet>
   Next action: <the exact engineering steps recommended to move forward, e.g. "Create React component views">

2. Generate Mermaid diagram code (inside a string field "diagramCode") representing the analogy components and how they map to actual technical components. The diagram must include model foundation, frontend, backend/API, schemas/contracts, tests/Git, and Cloud Run/deployment. Do not include markdown code block formatting like "\`\`\`mermaid" inside the JSON string, just the raw Mermaid code (e.g., "flowchart TD\\n  ...").
3. Generate a vocabulary translation list explaining the detected technologies in this format:
   - term: The tech term (e.g. "React")
   - job: Plain-language explanation of what it does
   - role: What role it plays in the selected basic object (${analogy})
   - evidence: Scanner proof detected in this codebase (e.g. "react dependency in package.json")
   Provide definitions for: TypeScript, React, MUI, Node.js, Fastify, Zod, Gemini API, Cloud Run, tests, and Git (if detected in the report).

Return the response in JSON format matching the following structure:
{
  "explanation": "string content with Claim -> Analogy -> Evidence -> Benefit -> Limitation -> Next action modules",
  "diagramCode": "flowchart TD\\n  A[Analogy Term] --> B[Another Term]\\n  ...",
  "vocabulary": [
   { "term": "string", "job": "string", "role": "string", "evidence": "string" }
  ]
}

Return only valid JSON. Do not include markdown fences, commentary, or extra prose outside the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    return normalizeAnalogyResponse(parsed, locale);
  } catch (err: any) {
    console.error("Gemini API error, using fallback:", err);
    return getFallbackAnalogy(report, identity, analogy, locale);
  }
}

export function normalizeAnalogyResponse(parsed: unknown, locale: Locale = "en"): AnalogyResponse {
  const value = isRecord(parsed) ? parsed : {};
  const vocabulary = normalizeVocabulary(value.vocabulary);
  const explanationCandidate =
    value.explanation ??
    value.explanationModules ??
    value.modules ??
    value.sections ??
    value.moduleExplanations ??
    value.analysis ??
    value.summary ??
    value.details;
  let explanation = normalizeExplanation(explanationCandidate, locale);
  if (explanation === EMPTY_EXPLANATION_COPY[locale] && vocabulary.length > 0) {
    explanation = buildExplanationFromVocabulary(vocabulary, locale);
  }

  return {
    explanation,
    diagramCode: typeof value.diagramCode === "string" && value.diagramCode.trim()
      ? value.diagramCode
      : "flowchart TD\n  A[Tech] --> B[Analogy]",
    vocabulary,
  };
}

function normalizeExplanation(value: unknown, locale: Locale): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    const modules = value.map((item) => formatExplanationModule(item, locale)).filter(Boolean);
    return modules.length > 0 ? modules.join("\n\n") : EMPTY_EXPLANATION_COPY[locale];
  }

  if (isRecord(value)) {
    const moduleText = formatExplanationModule(value, locale);
    return moduleText || JSON.stringify(value, null, 2);
  }

  return EMPTY_EXPLANATION_COPY[locale];
}

function formatExplanationModule(value: unknown, locale: Locale): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  const labels = ANALOGY_LABELS[locale];

  const lines = [
    [labels.claim, value.claim],
    [labels.analogy, value.analogy],
    [labels.evidence, value.evidence],
    [labels.benefit, value.benefit],
    [labels.limitation, value.limitation],
    [labels.nextAction, value.next_action ?? value.nextAction],
  ]
    .filter(([, content]) => content !== undefined && content !== null && stringifyContent(content).trim())
    .map(([label, content]) => `${label}: ${stringifyContent(content)}`);

  return lines.join("\n");
}

function normalizeVocabulary(value: unknown): AnalogyResponse["vocabulary"] {
  const rows = Array.isArray(value) ? value : isRecord(value) ? Object.values(value) : [];
  return rows
    .filter(isRecord)
    .map((row) => ({
      term: stringifyContent(row.term),
      job: stringifyContent(row.job),
      role: stringifyContent(row.role),
      evidence: stringifyContent(row.evidence),
    }))
    .filter((row) => row.term || row.job || row.role || row.evidence);
}

function buildExplanationFromVocabulary(vocabulary: AnalogyResponse["vocabulary"], locale: Locale): string {
  const labels = ANALOGY_LABELS[locale];
  const copy = VOCABULARY_FALLBACK_COPY[locale];
  const moduleText = vocabulary
    .slice(0, 6)
    .map((row) => `${labels.claim}: ${copy.claim(row.term)}
${labels.analogy}: ${row.role || copy.role}
${labels.evidence}: ${row.evidence || copy.evidence}
${labels.benefit}: ${row.job || copy.benefit}
${labels.limitation}: ${copy.limitation}
${labels.nextAction}: ${copy.nextAction}`)
    .join("\n\n");

  return moduleText || EMPTY_EXPLANATION_COPY[locale];
}

function stringifyContent(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(stringifyContent).filter(Boolean).join("; ");
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${stringifyContent(item)}`)
      .filter((item) => !item.endsWith(": "))
      .join("; ");
  }
  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function translateCopy(
  locale: "en" | "ja" | "zh-CN",
  strings: Record<string, string>
): Promise<{
  reviewedStrings: Record<string, string>;
  status: "reviewed" | "unverified";
  reviewedBy: string;
  reviewedAt: string;
}> {
  const defaultRes = {
    reviewedStrings: strings,
    status: "unverified" as const,
    reviewedBy: "fallback",
    reviewedAt: new Date().toISOString()
  };

  if (!ai) {
    return defaultRes;
  }

const prompt = `You are a professional localization reviewer. Translate and review the following UI copy dictionary into the target locale. Ensure you use the provided glossary to translate technical terms consistently.

Target Locale: ${locale}

Glossary:
${JSON.stringify(GLOSSARY, null, 2)}

Copy Strings to Translate/Review:
${JSON.stringify(strings, null, 2)}

Instructions:
- Keep the keys exactly the same.
- Translate the values into ${locale}. If the target locale is English, review and normalize the English copy instead of changing product terms.
- Do not translate code identifiers, package names, files, commands, environment variables, or product names (e.g. "TypeScript", "React", "Fastify", "Zod", "Cloud Run" should stay as is, unless the glossary says otherwise).
- Return only a valid JSON dictionary mapping the original keys to the translated/reviewed values.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const reviewedStrings = JSON.parse(text);
    return {
      reviewedStrings,
      status: "reviewed",
      reviewedBy: "gemini",
      reviewedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error("Gemini Translation API error:", err);
    return defaultRes;
  }
}

function getFallbackAnalogy(
  report: ScanReport,
  identity: string,
  analogy: string,
  locale: Locale = "en"
): AnalogyResponse {
  const branch = report.git.branch;
  const labels = ANALOGY_LABELS[locale];
  const metaphor = {
    bicycle: {
      core: "rider power, crank, chain, and wheels",
      ui: "handlebar, seat, brake levers, and visible frame",
      architecture: "frame geometry and cable routing",
      contract: "bike-fit measurements and repair checklist",
      deploy: "road test and riding route",
    },
    house: {
      core: "utility room and power supply",
      ui: "rooms, doors, exterior wall, and switches",
      architecture: "foundation, floor plan, and wiring layout",
      contract: "building measurements and inspection checklist",
      deploy: "address, keys, and move-in route",
    },
    plant: {
      core: "roots and growth energy",
      ui: "leaves, flowers, and visible shape",
      architecture: "stem, branches, and root structure",
      contract: "growth instructions and care log",
      deploy: "soil, sunlight, and outdoor environment",
    },
    "human body": {
      core: "heart and model foundation",
      ui: "skin, senses, and movement",
      architecture: "skeleton plus nervous system",
      contract: "DNA-like instructions and immune checks",
      deploy: "body operating in the real environment",
    },
  }[analogy as "bicycle" | "house" | "plant" | "human body"];

  const explanation = `${labels.claim}: The frontend framework is the part users directly experience.
${labels.analogy}: For a ${identity}, React and MUI are like the ${metaphor.ui} of a ${analogy}: people judge the product through what they can see, touch, and operate.
${labels.evidence}: Frontend stack detected: ${report.detectedStack.frontend.join(", ") || "none"}.
${labels.benefit}: A reusable UI framework lets the team build polished screens quickly.
${labels.limitation}: A good surface does not prove the backend, AI key, translation, or deployment are complete.
${labels.nextAction}: Keep the Analogy View visual, evidence-backed, and responsive on mobile.

${labels.claim}: The backend architecture moves data and decisions through the system.
${labels.analogy}: Fastify and API routes are like the ${metaphor.core}; they receive requests, move information, and make the visible experience work.
${labels.evidence}: Backend stack detected: ${report.detectedStack.backend.join(", ") || "none"}; network stack: ${report.detectedStack.network.join(", ") || "none"}.
${labels.benefit}: A focused API layer is easier for agents to inspect and deploy to Cloud Run.
${labels.limitation}: External AI behavior still depends on valid Google Cloud ADC or GEMINI_API_KEY configuration and verified API responses.
${labels.nextAction}: Verify /api/health, /api/scan, and /api/generate-explanation after every build.

${labels.claim}: TypeScript, Zod, tests, and Git are the supervision layer.
${labels.analogy}: They act like ${metaphor.contract}: they define allowed shapes, catch bad changes, and keep a record of what happened.
${labels.evidence}: Data stack: ${report.detectedStack.data.join(", ") || "none"}; tests: ${report.detectedStack.test.join(", ") || "none"}; branch "${branch}" has commits: ${report.git.hasCommits ? "yes" : "no"}.
${labels.benefit}: The user can demand proof instead of trusting vague agent claims.
${labels.limitation}: No first commit means the current baseline is not sealed yet.
${labels.nextAction}: Make an approved initial commit when the user is ready.

${labels.claim}: Deployment turns the local project into a real product surface.
${labels.analogy}: Cloud Run is like the ${metaphor.deploy}: it proves the system can leave the workshop and run for other people.
${labels.evidence}: Deploy stack detected: ${report.detectedStack.deploy.join(", ") || "none"}.
${labels.benefit}: One Fastify server can serve both API and Vite static assets.
${labels.limitation}: It is not truly deployed until a live URL passes /api/health.
${labels.nextAction}: Deploy only after build, API smoke tests, and static asset checks pass.`;

  const diagramCode = `flowchart TD
  Model[Model foundation / ${metaphor.core}] --> API[Fastify API / tool calls]
  UI[React + MUI / ${metaphor.ui}] --> API
  Shared[Zod + TypeScript / ${metaphor.contract}] --> API
  Shared --> UI
  Checks[Tests + Git evidence] --> Shared
  Deploy[Cloud Run / ${metaphor.deploy}] --> UI
  Deploy --> API`;

  const vocabulary = [
    {
      term: "TypeScript",
      job: "Ensures code variables have strict types to catch programming mistakes early.",
      role: `The blueprint measurements in our ${analogy}.`,
      evidence: "TypeScript compiler and compiler options found."
    },
    {
      term: "React",
      job: "Creates interactive, dynamic user interfaces for browsers.",
      role: `The customer-facing facade of our ${analogy}.`,
      evidence: "React package declared as dependency."
    },
    {
      term: "Material UI (MUI)",
      job: "A Material Design-inspired component library for building polished React interfaces.",
      role: `The standardized furniture and trim in our ${analogy}.`,
      evidence: "MUI packages found in package.json."
    },
    {
      term: "Fastify",
      job: "A highly efficient, low-overhead Node.js backend server framework.",
      role: `The central workflow operator in our ${analogy}.`,
      evidence: "Fastify declared in apps/api dependencies."
    },
    {
      term: "Zod",
      job: "Validates that input data matches the expected schema formats.",
      role: `The inspector checking dimensions in our ${analogy}.`,
      evidence: "Zod schemas configured in packages/shared."
    },
    {
      term: "Git",
      job: "Tracks changes in project files over time, letting teams coordinate code safely.",
      role: `The build registry in our ${analogy}.`,
      evidence: `Git status reports repository present on branch ${branch}.`
    }
  ];

  return {
    explanation,
    diagramCode,
    vocabulary,
  };
}
