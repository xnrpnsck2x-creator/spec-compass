import { z } from "zod";

// Project Metadata
export const ProjectSchema = z.object({
  name: z.string(),
  goal: z.string(),
  targetUsers: z.array(z.string()),
});

// Detected Tech Stack
export const DetectedStackSchema = z.object({
  frontend: z.array(z.string()),
  backend: z.array(z.string()),
  network: z.array(z.string()),
  database: z.array(z.string()),
  data: z.array(z.string()),
  deploy: z.array(z.string()),
  test: z.array(z.string()),
});

// Git Status Details
export const GitStatusSchema = z.object({
  isRepository: z.boolean(),
  branch: z.string(),
  hasCommits: z.boolean(),
  latestCommit: z.string().nullable(),
  isDirty: z.boolean(),
  untrackedCount: z.number(),
  statusSummary: z.array(z.string()),
  evidence: z.array(z.string()),
});

// File Inventory Details
export const LanguageMetricSchema = z.object({
  name: z.string(),
  lines: z.number(),
});

export const KeyDirectorySchema = z.object({
  path: z.string(),
  purpose: z.string(),
});

export const InventorySchema = z.object({
  files: z.number(),
  lines: z.number(),
  languages: z.array(LanguageMetricSchema),
  keyDirectories: z.array(KeyDirectorySchema),
});

// Completion Scores
export const CompletionSchema = z.object({
  product: z.number(),
  engineering: z.number(),
  evidenceConfidence: z.number(),
});

// Deployment Evidence
export const DeploymentSchema = z.object({
  environment: z.enum(["local", "cloud-run"]),
  verified: z.boolean(),
  service: z.string().nullable(),
  revision: z.string().nullable(),
  region: z.string().nullable(),
  url: z.string().nullable(),
  sourcePath: z.string(),
  evidence: z.array(z.string()),
});

// Scan Source Evidence
export const ScanSourceSchema = z.object({
  type: z.enum(["serverWorkspace", "localPath", "githubUrl"]),
  label: z.string(),
  url: z.string().nullable(),
  path: z.string(),
  evidence: z.array(z.string()),
  warnings: z.array(z.string()),
});

// Codebase Functional Area Metrics
export const AreaStatusSchema = z.enum(["missing", "partial", "usable", "verified"]);

export const AreaSchema = z.object({
  name: z.string(),
  score: z.number(),
  status: AreaStatusSchema,
  evidence: z.array(z.string()),
  gaps: z.array(z.string()),
  nextActions: z.array(z.string()),
});

// Drift Audit Log
export const DriftSeveritySchema = z.enum(["low", "medium", "high"]);

export const DriftSchema = z.object({
  severity: DriftSeveritySchema,
  claim: z.string(),
  evidence: z.array(z.string()),
  suggestedFix: z.string(),
});

// Agent Operating Model definitions
export const AgentRoleSchema = z.object({
  id: z.string(),
  label: z.string(),
  role: z.string(),
  allowedTools: z.array(z.string()),
  preferredCapabilities: z.array(z.string()),
  evidenceRequired: z.array(z.string()),
  stopCondition: z.string(),
});

export const AgentRouteSchema = z.object({
  taskType: z.string(),
  agentId: z.string(),
  preferredCapabilities: z.array(z.string()),
  routingReason: z.string(),
});

export const AgentTimelineSchema = z.object({
  agentId: z.string(),
  claim: z.string(),
  evidence: z.array(z.string()),
  nextAction: z.string(),
});

export const AgentOperatingModelSchema = z.object({
  agents: z.array(AgentRoleSchema),
  routes: z.array(AgentRouteSchema),
  timeline: z.array(AgentTimelineSchema),
});

// Top-Level Scan Report Schema
export const ScanReportSchema = z.object({
  project: ProjectSchema,
  detectedStack: DetectedStackSchema,
  git: GitStatusSchema,
  inventory: InventorySchema,
  completion: CompletionSchema,
  source: ScanSourceSchema,
  deployment: DeploymentSchema,
  areas: z.array(AreaSchema),
  drift: z.array(DriftSchema),
  agentOperatingModel: AgentOperatingModelSchema,
  launchPacket: z.string(),
});

export type ScanReport = z.infer<typeof ScanReportSchema>;

// Analogy / Explanation Interface Schema
export const AnalogyIdentitySchema = z.enum(["boss", "designer", "sales"]);
export type AnalogyIdentity = z.infer<typeof AnalogyIdentitySchema>;

export const AnalogyStyleSchema = z.enum(["bicycle", "house", "plant", "human body"]);
export type AnalogyStyle = z.infer<typeof AnalogyStyleSchema>;

export const LocaleSchema = z.enum(["en", "ja", "zh-CN"]);
export type Locale = z.infer<typeof LocaleSchema>;

export const AnalogyRequestSchema = z.object({
  report: ScanReportSchema,
  identity: AnalogyIdentitySchema,
  analogy: AnalogyStyleSchema,
  locale: LocaleSchema.default("en"),
});

export type AnalogyRequest = z.infer<typeof AnalogyRequestSchema>;

export const AnalogyResponseSchema = z.object({
  explanation: z.string(), // Claim -> Analogy -> Evidence -> Benefit -> Limitation -> Next action format
  diagramCode: z.string(), // Mermaid diagram or text representation
  vocabulary: z.array(
    z.object({
      term: z.string(),
      job: z.string(),
      role: z.string(),
      evidence: z.string(),
    })
  ),
});

export type AnalogyResponse = z.infer<typeof AnalogyResponseSchema>;
