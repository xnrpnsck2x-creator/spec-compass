import { describe, expect, it } from "vitest";
import {
  AnalogyIdentitySchema,
  AnalogyRequestSchema,
  AnalogyStyleSchema,
  ScanReportSchema,
} from "./index.js";

const baseReport = {
  project: {
    name: "demo",
    goal: "Explain a project from scanner evidence",
    targetUsers: ["founders", "engineers"],
  },
  detectedStack: {
    frontend: ["React"],
    backend: ["Fastify"],
    network: ["HTTP/REST APIs"],
    database: ["None / In-Memory"],
    data: ["Zod Schema"],
    deploy: ["Local Execution"],
    test: ["Vitest"],
  },
  git: {
    isRepository: true,
    branch: "main",
    hasCommits: false,
    latestCommit: null,
    isDirty: true,
    untrackedCount: 1,
    statusSummary: ["?? README.md"],
    evidence: ["git status --short"],
  },
  inventory: {
    files: 1,
    lines: 10,
    languages: [{ name: "TypeScript", lines: 10 }],
    keyDirectories: [{ path: "apps/api", purpose: "Fastify API" }],
  },
  completion: {
    product: 40,
    engineering: 50,
    evidenceConfidence: 30,
  },
  source: {
    type: "localPath",
    label: "Local demo project",
    url: null,
    path: "/tmp/demo",
    evidence: ["Local path selected"],
    warnings: [],
  },
  deployment: {
    environment: "local",
    verified: false,
    service: null,
    revision: null,
    region: null,
    url: null,
    sourcePath: "/tmp/demo",
    evidence: ["Cloud Run runtime environment not detected"],
  },
  areas: [
    {
      name: "Quality Assurance (Tests)",
      score: 100,
      status: "verified",
      evidence: ["Testing framework detected: Vitest"],
      gaps: [],
      nextActions: ["Run test suites"],
    },
  ],
  drift: [],
  agentOperatingModel: {
    agents: [],
    routes: [],
    timeline: [],
  },
  launchPacket: "Continue with evidence-backed tasks.",
};

describe("shared schemas", () => {
  it("accept approved analogy identities and styles only", () => {
    expect(AnalogyIdentitySchema.safeParse("boss").success).toBe(true);
    expect(AnalogyIdentitySchema.safeParse("hacker").success).toBe(false);
    expect(AnalogyStyleSchema.safeParse("bicycle").success).toBe(true);
    expect(AnalogyStyleSchema.safeParse("human body").success).toBe(true);
    expect(AnalogyStyleSchema.safeParse("spaceship").success).toBe(false);
  });

  it("validates the scan report contract used by the API and UI", () => {
    expect(ScanReportSchema.parse(baseReport).project.name).toBe("demo");
  });

  it("requires analogy requests to include scanner evidence", () => {
    const result = AnalogyRequestSchema.safeParse({
      report: baseReport,
      identity: "designer",
      analogy: "house",
      locale: "zh-CN",
    });

    expect(result.success).toBe(true);
  });
});
