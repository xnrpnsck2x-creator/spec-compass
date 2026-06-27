import * as path from "path";

export interface DeploymentInfo {
  environment: "local" | "cloud-run";
  verified: boolean;
  service: string | null;
  revision: string | null;
  region: string | null;
  url: string | null;
  sourcePath: string;
  evidence: string[];
}

export function getDeploymentInfo(sourcePath: string): DeploymentInfo {
  const resolvedSourcePath = path.resolve(sourcePath);
  const service = process.env.K_SERVICE || process.env.SPEC_COMPASS_SERVICE || null;
  const revision = process.env.K_REVISION || process.env.SPEC_COMPASS_REVISION || null;
  const configuration = process.env.K_CONFIGURATION || null;
  const region = process.env.SPEC_COMPASS_REGION || null;
  const url = process.env.SPEC_COMPASS_PUBLIC_URL || null;
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
  const verified = Boolean(isCloudRun && service && revision && url);

  const evidence = [
    isCloudRun ? `Cloud Run runtime detected: K_SERVICE=${service || "missing"}` : "Cloud Run runtime environment not detected",
    revision ? `Cloud Run revision: ${revision}` : "Cloud Run revision missing",
    configuration ? `Cloud Run configuration: ${configuration}` : "Cloud Run configuration missing",
    region ? `Cloud Run region: ${region}` : "Cloud Run region missing",
    url ? `Public URL: ${url}` : "Public URL missing",
    `Scan source path: ${resolvedSourcePath}`,
  ];

  return {
    environment: isCloudRun ? "cloud-run" : "local",
    verified,
    service,
    revision,
    region,
    url,
    sourcePath: resolvedSourcePath,
    evidence,
  };
}
