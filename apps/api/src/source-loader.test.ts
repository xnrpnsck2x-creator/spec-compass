import { describe, expect, it } from "vitest";
import { parseGitHubUrl } from "./source-loader.js";

describe("GitHub source loader", () => {
  it("accepts public GitHub repository URLs", () => {
    expect(parseGitHubUrl("https://github.com/google-gemini/gemini-cli")).toMatchObject({
      owner: "google-gemini",
      repo: "gemini-cli",
      ref: null,
      label: "google-gemini/gemini-cli",
      canonicalUrl: "https://github.com/google-gemini/gemini-cli",
    });
  });

  it("captures a branch from /tree URLs", () => {
    expect(parseGitHubUrl("https://github.com/owner/repo/tree/feature/demo")).toMatchObject({
      owner: "owner",
      repo: "repo",
      ref: "feature/demo",
      label: "owner/repo#feature/demo",
      canonicalUrl: "https://github.com/owner/repo/tree/feature/demo",
    });
  });

  it("rejects non-GitHub URLs", () => {
    expect(() => parseGitHubUrl("https://example.com/owner/repo")).toThrow(
      "Only public https://github.com repository URLs are supported.",
    );
  });
});
