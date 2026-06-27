import { describe, expect, it } from "vitest";
import type { ScanReport } from "@spec-compass/shared";
import { getFallbackAnalogy, normalizeAnalogyResponse } from "./gemini.js";

const fallbackReport: ScanReport = {
  project: {
    name: "demo",
    goal: "Explain scanner evidence",
    targetUsers: ["founders", "engineers"],
  },
  detectedStack: {
    frontend: ["React", "Material UI (MUI)", "React TSX"],
    backend: ["Fastify", "Node.js Service"],
    network: ["HTTP/REST APIs"],
    database: ["None / In-Memory"],
    data: ["Zod Schema", "Gemini GenAI SDK"],
    deploy: ["Docker", "Cloud Run"],
    test: ["Vitest"],
  },
  git: {
    isRepository: true,
    branch: "main",
    hasCommits: true,
    latestCommit: "abc1234",
    isDirty: false,
    untrackedCount: 0,
    statusSummary: [],
    evidence: ["git status --short"],
  },
  inventory: {
    files: 12,
    lines: 345,
    languages: [{ name: "TypeScript", lines: 345 }],
    keyDirectories: [{ path: "apps/api", purpose: "Fastify API" }],
  },
  completion: {
    product: 90,
    engineering: 95,
    evidenceConfidence: 88,
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
    environment: "cloudRun",
    verified: true,
    service: "spec-compass",
    revision: "spec-compass-00001",
    region: "asia-northeast1",
    url: "https://example.run.app",
    sourcePath: "/workspace",
    evidence: ["Cloud Run environment detected"],
  },
  areas: [],
  drift: [],
  agentOperatingModel: {
    agents: [],
    routes: [],
    timeline: [],
  },
  launchPacket: "Continue with evidence-backed tasks.",
};

describe("normalizeAnalogyResponse", () => {
  it("turns structured Gemini modules into renderable explanation text", () => {
    const normalized = normalizeAnalogyResponse({
      explanation: [
        {
          claim: "React is the visible interface",
          analogy: "Skin and senses for a human body",
          evidence: ["React dependency", "apps/web exists"],
          benefit: "Users can inspect the system visually",
          limitation: "The UI does not prove backend readiness",
          next_action: "Keep evidence beside every claim",
        },
      ],
      diagramCode: "flowchart TD\n  A --> B",
      vocabulary: [
        {
          term: "React",
          job: "Builds browser interfaces",
          role: "Skin",
          evidence: ["package.json dependency"],
        },
      ],
    });

    expect(normalized.explanation).toContain("Claim: React is the visible interface");
    expect(normalized.explanation).toContain("Evidence: React dependency; apps/web exists");
    expect(normalized.explanation).toContain("Next action: Keep evidence beside every claim");
    expect(normalized.diagramCode).toBe("flowchart TD\n  A --> B");
    expect(normalized.vocabulary[0]).toEqual({
      term: "React",
      job: "Builds browser interfaces",
      role: "Skin",
      evidence: "package.json dependency",
    });
  });

  it("uses localized labels when structured modules are returned", () => {
    const normalized = normalizeAnalogyResponse(
      {
        explanation: [
          {
            claim: "React 是用户看到的界面层",
            analogy: "像人体的皮肤和感官",
            evidence: ["检测到 React 依赖", "apps/web 存在"],
            benefit: "普通用户能看到系统状态",
            limitation: "不能单独证明后端已完成",
            next_action: "继续把证据放在每个结论旁边",
          },
        ],
        vocabulary: [],
      },
      "zh-CN"
    );

    expect(normalized.explanation).toContain("主张: React 是用户看到的界面层");
    expect(normalized.explanation).toContain("证据: 检测到 React 依赖; apps/web 存在");
    expect(normalized.explanation).toContain("下一步: 继续把证据放在每个结论旁边");
  });

  it("accepts alternate module fields returned by Gemini", () => {
    const normalized = normalizeAnalogyResponse(
      {
        modules: [
          {
            claim: "Fastify 提供 API 层",
            evidence: "apps/api 使用 Fastify",
          },
        ],
        vocabulary: [],
      },
      "zh-CN"
    );

    expect(normalized.explanation).toContain("主张: Fastify 提供 API 层");
    expect(normalized.explanation).toContain("证据: apps/api 使用 Fastify");
  });

  it("synthesizes a localized explanation from vocabulary when explanation is blank", () => {
    const normalized = normalizeAnalogyResponse(
      {
        explanation: [],
        vocabulary: [
          {
            term: "React",
            job: "负责浏览器界面",
            role: "像人体的皮肤和感官",
            evidence: "检测到 React 依赖",
          },
        ],
      },
      "zh-CN"
    );

    expect(normalized.explanation).toContain("主张: React 是当前项目已检测到的技术栈组成部分。");
    expect(normalized.explanation).toContain("证据: 检测到 React 依赖");
    expect(normalized.explanation).not.toContain("No explanation generated.");
  });

  it("localizes fallback vocabulary job, role, and evidence fields", () => {
    const zh = getFallbackAnalogy(fallbackReport, "boss", "human body", "zh-CN");
    const zhReact = zh.vocabulary.find((row) => row.term === "React");
    expect(zhReact).toMatchObject({
      job: expect.stringContaining("浏览器界面"),
      role: expect.stringContaining("人体"),
      evidence: expect.stringContaining("前端技术栈检测结果"),
    });
    expect(zhReact?.job).not.toContain("Creates interactive");

    const ja = getFallbackAnalogy(fallbackReport, "designer", "house", "ja");
    const jaGit = ja.vocabulary.find((row) => row.term === "Git");
    expect(jaGit).toMatchObject({
      job: expect.stringContaining("ファイル変更"),
      role: expect.stringContaining("家"),
      evidence: expect.stringContaining("コミットあり"),
    });
    expect(jaGit?.evidence).not.toContain("has commits");
  });
});
