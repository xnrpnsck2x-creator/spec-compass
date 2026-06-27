import * as os from "os";
import * as path from "path";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import { runScan } from "./scanner.js";

const tempRoots: string[] = [];
const gitMetadataEnvKeys = ["SPEC_COMPASS_GIT_BRANCH", "SPEC_COMPASS_GIT_COMMIT", "SPEC_COMPASS_GIT_REPOSITORY"];

async function createFixtureProject(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "spec-compass-scan-"));
  tempRoots.push(root);

  await mkdir(path.join(root, "apps/web/src"), { recursive: true });
  await mkdir(path.join(root, "apps/api/src"), { recursive: true });
  await mkdir(path.join(root, "packages/shared/src"), { recursive: true });

  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify(
      {
        dependencies: {
          "@google/genai": "^2.10.0",
          "@mui/icons-material": "^5.15.20",
          "@mui/material": "^5.15.20",
          fastify: "^4.28.1",
          i18next: "^23.11.5",
          react: "^18.3.1",
          zod: "^3.23.8",
        },
        devDependencies: {
          vitest: "^2.1.9",
        },
      },
      null,
      2,
    ),
  );

  await writeFile(path.join(root, "apps/web/src/App.tsx"), "export function App() { return null; }\n");
  await writeFile(path.join(root, "apps/api/src/index.ts"), "export const api = true;\n");
  await writeFile(path.join(root, "packages/shared/src/index.ts"), "export const schema = true;\n");
  await writeFile(path.join(root, "Dockerfile"), "FROM node:22-slim\n");

  return root;
}

afterEach(async () => {
  for (const key of gitMetadataEnvKeys) {
    delete process.env[key];
  }
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("runScan", () => {
  it("detects stack, tests, and deployment artifacts from repository files", async () => {
    const root = await createFixtureProject();

    const report = await runScan(root);

    expect(report.detectedStack.frontend).toEqual(expect.arrayContaining(["React", "Material UI (MUI)", "React TSX", "i18next"]));
    expect(report.detectedStack.backend).toEqual(expect.arrayContaining(["Fastify", "Node.js Service"]));
    expect(report.detectedStack.data).toEqual(expect.arrayContaining(["Zod Schema", "Gemini GenAI SDK"]));
    expect(report.detectedStack.deploy).toContain("Docker");
    expect(report.deployment.environment).toBe("local");
    expect(report.deployment.verified).toBe(false);
    expect(report.source).toMatchObject({
      type: "localPath",
      path: root,
    });
    expect(report.detectedStack.test).toContain("Vitest");
    expect(report.areas.find((area) => area.name === "Cloud Run Readiness")?.status).toBe("partial");
    expect(report.areas.find((area) => area.name === "Engineering Monitor")?.evidence.join("\n")).toContain("Measured");
  });

  it("keeps completion claims below verified when Gemini and Git evidence are missing", async () => {
    const root = await createFixtureProject();

    const report = await runScan(root);

    expect(report.completion.product).toBeLessThan(100);
    expect(report.completion.engineering).toBeLessThan(100);
    expect(report.completion.evidenceConfidence).toBeLessThan(100);
    expect(report.areas.find((area) => area.name === "Quality Assurance (Tests)")?.status).toBe("verified");
    expect(report.areas.find((area) => area.name === "Backend API Workspace")?.gaps).toContain(
      "Gemini API integration is running in fallback mode",
    );
    expect(report.drift).toEqual([]);
  });

  it("uses deployment git metadata when .git is not available in the runtime source copy", async () => {
    const root = await createFixtureProject();
    process.env.SPEC_COMPASS_GIT_BRANCH = "main";
    process.env.SPEC_COMPASS_GIT_COMMIT = "48a4303";
    process.env.SPEC_COMPASS_GIT_REPOSITORY = "https://github.com/xnrpnsck2x-creator/spec-compass";

    const report = await runScan(root);
    const gitArea = report.areas.find((area) => area.name === "Git Version Control");

    expect(report.git).toMatchObject({
      isRepository: true,
      branch: "main",
      hasCommits: true,
      latestCommit: "48a4303",
      isDirty: false,
      untrackedCount: 0,
    });
    expect(report.git.evidence.join("\n")).toContain("Git metadata source: deployment environment");
    expect(gitArea?.score).toBe(100);
    expect(gitArea?.status).toBe("verified");
    expect(gitArea?.evidence.join("\n")).toContain("Git baseline detected from deployment metadata");
    expect(gitArea?.nextActions).toContain("Keep deploy Git metadata updated");
  });
});
