import AdmZip from "adm-zip";
import * as os from "os";
import * as path from "path";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "fs/promises";
import { ScanSourceInfo } from "./scanner.js";

const MAX_ARCHIVE_BYTES = 25 * 1024 * 1024;
const MAX_EXTRACTED_BYTES = 75 * 1024 * 1024;
const MAX_FILES = 5000;

export interface PreparedScanSource {
  targetPath: string;
  sourceInfo: ScanSourceInfo;
  cleanup: () => Promise<void>;
}

export interface GitHubRepoRef {
  owner: string;
  repo: string;
  ref: string | null;
  label: string;
  canonicalUrl: string;
}

export function parseGitHubUrl(input: string): GitHubRepoRef {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("Enter a valid GitHub repository URL.");
  }

  if (url.protocol !== "https:" || !["github.com", "www.github.com"].includes(url.hostname.toLowerCase())) {
    throw new Error("Only public https://github.com repository URLs are supported.");
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const [owner, rawRepo] = segments;
  const repo = rawRepo?.replace(/\.git$/, "");

  if (!owner || !repo || !isSafeRepoPart(owner) || !isSafeRepoPart(repo)) {
    throw new Error("GitHub URL must look like https://github.com/owner/repo.");
  }

  const treeIndex = segments.findIndex((segment) => segment === "tree");
  const ref = treeIndex >= 0 && treeIndex + 1 < segments.length
    ? segments.slice(treeIndex + 1).map(decodeURIComponent).join("/")
    : null;

  return {
    owner,
    repo,
    ref,
    label: `${owner}/${repo}${ref ? `#${ref}` : ""}`,
    canonicalUrl: `https://github.com/${owner}/${repo}${ref ? `/tree/${encodePath(ref)}` : ""}`,
  };
}

export async function prepareGitHubSource(githubUrl: string): Promise<PreparedScanSource> {
  const repoRef = parseGitHubUrl(githubUrl);
  const ref = repoRef.ref || await fetchDefaultBranch(repoRef);
  const archiveUrl = `https://codeload.github.com/${repoRef.owner}/${repoRef.repo}/zip/refs/heads/${encodePath(ref)}`;

  const archive = await fetchArchive(archiveUrl);
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "spec-compass-github-"));

  try {
    const extractRoot = path.join(tempRoot, "repo");
    await mkdir(extractRoot, { recursive: true });
    const targetPath = await extractZip(archive, extractRoot);

    return {
      targetPath,
      cleanup: () => rm(tempRoot, { recursive: true, force: true }),
      sourceInfo: {
        type: "githubUrl",
        label: `${repoRef.owner}/${repoRef.repo}#${ref}`,
        url: repoRef.canonicalUrl,
        path: targetPath,
        evidence: [
          `GitHub URL accepted: ${repoRef.canonicalUrl}`,
          `Archive URL fetched from codeload.github.com for ref ${ref}`,
          `Archive size: ${archive.byteLength.toLocaleString()} bytes`,
          `Extracted into Cloud Run temp directory: ${targetPath}`,
        ],
        warnings: [
          "Only public GitHub repositories are supported in this demo.",
          "Git history is not included in GitHub zip archives, so commit status may be unavailable.",
        ],
      },
    };
  } catch (err) {
    await rm(tempRoot, { recursive: true, force: true });
    throw err;
  }
}

function isSafeRepoPart(value: string) {
  return /^[A-Za-z0-9_.-]+$/.test(value);
}

function encodePath(value: string) {
  return value.split("/").map(encodeURIComponent).join("/");
}

async function fetchDefaultBranch(repoRef: GitHubRepoRef): Promise<string> {
  const response = await fetch(`https://api.github.com/repos/${repoRef.owner}/${repoRef.repo}`, {
    headers: {
      "accept": "application/vnd.github+json",
      "user-agent": "spec-compass-demo",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub repository lookup failed with HTTP ${response.status}.`);
  }

  const data = await response.json() as { default_branch?: string };
  if (!data.default_branch) {
    throw new Error("GitHub repository did not report a default branch.");
  }

  return data.default_branch;
}

async function fetchArchive(archiveUrl: string): Promise<Buffer> {
  const response = await fetch(archiveUrl, {
    headers: {
      "accept": "application/zip",
      "user-agent": "spec-compass-demo",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub archive download failed with HTTP ${response.status}.`);
  }

  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_ARCHIVE_BYTES) {
    throw new Error(`GitHub archive is too large for this demo (${contentLength.toLocaleString()} bytes).`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_ARCHIVE_BYTES) {
    throw new Error(`GitHub archive is too large for this demo (${buffer.byteLength.toLocaleString()} bytes).`);
  }

  return buffer;
}

async function extractZip(archive: Buffer, extractRoot: string): Promise<string> {
  const zip = new AdmZip(archive);
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);

  if (entries.length > MAX_FILES) {
    throw new Error(`GitHub archive has too many files for this demo (${entries.length}).`);
  }

  let extractedBytes = 0;
  for (const entry of entries) {
    const destination = path.resolve(extractRoot, entry.entryName);
    if (!destination.startsWith(`${extractRoot}${path.sep}`)) {
      throw new Error("GitHub archive contains an unsafe path.");
    }

    const data = entry.getData();
    extractedBytes += data.byteLength;
    if (extractedBytes > MAX_EXTRACTED_BYTES) {
      throw new Error(`GitHub archive expands beyond the demo limit (${MAX_EXTRACTED_BYTES.toLocaleString()} bytes).`);
    }

    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, data);
  }

  const children = await readdir(extractRoot, { withFileTypes: true });
  const directories = children.filter((child) => child.isDirectory());
  const files = children.filter((child) => child.isFile());

  if (directories.length === 1 && files.length === 0) {
    return path.join(extractRoot, directories[0].name);
  }

  return extractRoot;
}
