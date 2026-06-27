import { describe, expect, it } from "vitest";
import { normalizeAnalogyResponse } from "./gemini.js";

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
});
