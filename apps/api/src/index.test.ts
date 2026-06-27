import { describe, expect, it } from "vitest";
import { createServer } from "./index.js";

describe("api server", () => {
  it("reports health without requiring a live port", async () => {
    const server = createServer({ logger: false });

    const response = await server.inject({
      method: "GET",
      url: "/api/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      geminiConfigured: false,
      deployment: {
        environment: "local",
        verified: false,
      },
    });

    await server.close();
  });

  it("rejects translation requests missing required payload", async () => {
    const server = createServer({ logger: false });

    const response = await server.inject({
      method: "POST",
      url: "/api/translate-copy",
      payload: { locale: "ja" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "Missing required parameters: locale, strings",
    });

    await server.close();
  });

  it("rejects non-GitHub scan URLs before downloading anything", async () => {
    const server = createServer({ logger: false });

    const response = await server.inject({
      method: "POST",
      url: "/api/scan",
      payload: {
        sourceType: "githubUrl",
        githubUrl: "https://example.com/not/a/repo",
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("Only public https://github.com repository URLs are supported.");

    await server.close();
  });
});
