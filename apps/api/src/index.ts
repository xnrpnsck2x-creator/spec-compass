import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { runScan } from "./scanner.js";
import { generateExplanation, translateCopy, isGeminiConfigured } from "./gemini.js";
import { getDeploymentInfo } from "./deployment.js";
import { prepareGitHubSource } from "./source-loader.js";

// Load local environment variables if available
dotenv.config();

const PORT = Number(process.env.PORT) || 3001;
const frontendDistPath = path.join(__dirname, "../../web/dist");
const defaultScanPath = process.env.SPEC_COMPASS_SCAN_PATH
  ? path.resolve(process.env.SPEC_COMPASS_SCAN_PATH)
  : path.resolve(__dirname, "../../..");

export interface CreateServerOptions {
  logger?: boolean;
  defaultScanPath?: string;
}

export function createServer(options: CreateServerOptions = {}) {
  const server = fastify({ logger: options.logger ?? true });
  const scanFallbackPath = options.defaultScanPath || defaultScanPath;

  // CORS setup since we are doing dev on 5173 proxying to 3001.
  server.addHook("onRequest", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type");
    if (request.method === "OPTIONS") {
      reply.status(200).send();
    }
  });

  // Serve frontend assets in production.
  if (fs.existsSync(frontendDistPath)) {
    server.register(fastifyStatic, {
      root: frontendDistPath,
      prefix: "/",
    });
  }

  server.get("/api/health", async () => {
    return {
      status: "ok",
      geminiConfigured: isGeminiConfigured(),
      deployment: getDeploymentInfo(scanFallbackPath),
      time: new Date().toISOString(),
    };
  });

  server.post("/api/scan", async (request, reply) => {
    const body = (request.body || {}) as { sourceType?: string; path?: string; githubUrl?: string };
    const requestedGithubUrl = body.githubUrl?.trim();
    let cleanup: (() => Promise<void>) | null = null;

    try {
      if (body.sourceType === "githubUrl" || requestedGithubUrl) {
        if (!requestedGithubUrl) {
          reply.status(400).send({ error: "Missing required parameter: githubUrl" });
          return;
        }

        const prepared = await prepareGitHubSource(requestedGithubUrl);
        cleanup = prepared.cleanup;
        const report = await runScan(prepared.targetPath, prepared.sourceInfo);
        return report;
      }

      const targetPath = body.path || scanFallbackPath;
      const report = await runScan(targetPath, {
        type: body.path ? "localPath" : "serverWorkspace",
        label: body.path ? "Local path" : "Server workspace",
        path: targetPath,
        url: null,
        evidence: body.path
          ? [`Local path requested: ${targetPath}`]
          : [`Server workspace scan path selected: ${targetPath}`],
        warnings: [],
      });
      return report;
    } catch (err: any) {
      server.log.error(err);
      const message = err instanceof Error ? err.message : "Scan failed";
      const status = message.includes("GitHub") || message.includes("repository URL") || message.includes("Only public")
        ? 400
        : 500;
      reply.status(status).send({ error: message });
    } finally {
      if (cleanup) {
        await cleanup();
      }
    }
  });

  server.post("/api/generate-explanation", async (request, reply) => {
    const body = (request.body || {}) as {
      report: any;
      identity: "boss" | "designer" | "sales";
      analogy: "bicycle" | "house" | "plant" | "human body";
      locale?: "en" | "ja" | "zh-CN";
    };

    if (!body.report || !body.identity || !body.analogy) {
      reply.status(400).send({ error: "Missing required parameters: report, identity, analogy" });
      return;
    }

    const locale = body.locale || "en";
    if (!["en", "ja", "zh-CN"].includes(locale)) {
      reply.status(400).send({ error: "Invalid locale. Use en, ja, or zh-CN." });
      return;
    }

    try {
      const analogyRes = await generateExplanation(body.report, body.identity, body.analogy, locale);
      return analogyRes;
    } catch (err: any) {
      server.log.error(err);
      reply.status(500).send({ error: err.message });
    }
  });

  server.post("/api/translate-copy", async (request, reply) => {
    const body = (request.body || {}) as {
      locale: "en" | "ja" | "zh-CN";
      strings: Record<string, string>;
    };

    if (!body.locale || !body.strings) {
      reply.status(400).send({ error: "Missing required parameters: locale, strings" });
      return;
    }

    try {
      const translateRes = await translateCopy(body.locale, body.strings);
      return translateRes;
    } catch (err: any) {
      server.log.error(err);
      reply.status(500).send({ error: err.message });
    }
  });

  server.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/api/")) {
      reply.status(404).send({ error: "API Route Not Found" });
    } else if (fs.existsSync(path.join(frontendDistPath, "index.html"))) {
      reply.sendFile("index.html");
    } else {
      reply.status(404).send({ error: "Resource Not Found" });
    }
  });

  return server;
}

export const start = async () => {
  const server = createServer();

  try {
    await server.listen({ port: PORT, host: "0.0.0.0" });
    server.log.info(`Server is running on port ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

if (require.main === module) {
  void start();
}
