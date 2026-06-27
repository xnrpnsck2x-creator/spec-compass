import { GoogleGenAI, type GoogleGenAIOptions } from "@google/genai";
import { ScanReport, AnalogyResponse, type Locale } from "@spec-compass/shared";
import * as path from "path";
import * as dotenv from "dotenv";

// Load API-local env before reading process.env. This works when npm starts the
// workspace from the repo root and when tsx runs from apps/api during dev.
if (process.env.NODE_ENV !== "test") {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
  dotenv.config();
}

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const cloudProject = process.env.GOOGLE_CLOUD_PROJECT || "";
const cloudLocation = process.env.GOOGLE_CLOUD_LOCATION || "global";
const useEnterprise = process.env.GOOGLE_GENAI_USE_ENTERPRISE === "true";
const hasKey = apiKey.trim().length > 0;
const hasCloudConfig = useEnterprise && cloudProject.trim().length > 0 && cloudLocation.trim().length > 0;

let ai: GoogleGenAI | null = null;
if (hasCloudConfig) {
  const options: GoogleGenAIOptions = {
    enterprise: true,
    project: cloudProject,
    location: cloudLocation,
  };
  ai = new GoogleGenAI(options);
} else if (hasKey) {
  ai = new GoogleGenAI({ apiKey });
}

const GLOSSARY = {
  framework: { en: "framework", ja: "フレームワーク", "zh-CN": "框架" },
  launchPacket: { en: "Launch Packet", ja: "ローンチパケット", "zh-CN": "启动包" },
  frontend: { en: "frontend", ja: "フロントエンド", "zh-CN": "前端" },
  backend: { en: "backend", ja: "バックエンド", "zh-CN": "后端" },
  API: { en: "API", ja: "API", "zh-CN": "API" },
  scanner: { en: "scanner", ja: "スキャナー", "zh-CN": "扫描器" },
  evidence: { en: "evidence", ja: "証拠", "zh-CN": "证据" },
  "Gemini API": { en: "Gemini API", ja: "Gemini API", "zh-CN": "Gemini API" },
  "Cloud Run": { en: "Cloud Run", ja: "Cloud Run", "zh-CN": "Cloud Run" },
  "Agent Runtime": { en: "Agent Runtime", ja: "Agent Runtime", "zh-CN": "Agent Runtime" },
  TypeScript: { en: "TypeScript", ja: "TypeScript", "zh-CN": "TypeScript" },
  React: { en: "React", ja: "React", "zh-CN": "React" },
  MUI: { en: "MUI", ja: "MUI", "zh-CN": "MUI" },
  "Node.js": { en: "Node.js", ja: "Node.js", "zh-CN": "Node.js" },
  Fastify: { en: "Fastify", ja: "Fastify", "zh-CN": "Fastify" },
  Zod: { en: "Zod", ja: "Zod", "zh-CN": "Zod" },
  tests: { en: "tests", ja: "テスト", "zh-CN": "测试" },
  Git: { en: "Git", ja: "Git", "zh-CN": "Git" }
};

const ANALOGY_LABELS: Record<
  Locale,
  {
    claim: string;
    analogy: string;
    evidence: string;
    benefit: string;
    limitation: string;
    nextAction: string;
  }
> = {
  en: {
    claim: "Claim",
    analogy: "Analogy",
    evidence: "Evidence",
    benefit: "Benefit",
    limitation: "Limitation",
    nextAction: "Next action",
  },
  ja: {
    claim: "主張",
    analogy: "比喩",
    evidence: "根拠",
    benefit: "利点",
    limitation: "制限",
    nextAction: "次のアクション",
  },
  "zh-CN": {
    claim: "主张",
    analogy: "类比",
    evidence: "证据",
    benefit: "优点",
    limitation: "限制",
    nextAction: "下一步",
  },
};

const OUTPUT_LANGUAGE: Record<Locale, string> = {
  en: "English",
  ja: "Japanese",
  "zh-CN": "Simplified Chinese",
};

const VOCABULARY_FALLBACK_COPY: Record<
  Locale,
  {
    claim: (term: string) => string;
    role: string;
    evidence: string;
    benefit: string;
    limitation: string;
    nextAction: string;
  }
> = {
  en: {
    claim: (term) => `${term} is part of the detected project stack.`,
    role: "Unverified analogy role.",
    evidence: "Unverified.",
    benefit: "Explains this technology's job in the system.",
    limitation: "This fallback module is synthesized from vocabulary because Gemini did not return a full explanation string.",
    nextAction: "Regenerate the analogy after the next scan and keep evidence beside each claim.",
  },
  ja: {
    claim: (term) => `${term} は検出済み技術スタックの一部です。`,
    role: "類比上の役割は未検証です。",
    evidence: "未検証です。",
    benefit: "この技術がシステム内で担う仕事を説明します。",
    limitation: "Gemini が完全な説明文を返さなかったため、語彙表から合成したフォールバックです。",
    nextAction: "次回スキャン後に類比を再生成し、各主張の横に根拠を残してください。",
  },
  "zh-CN": {
    claim: (term) => `${term} 是当前项目已检测到的技术栈组成部分。`,
    role: "类比角色未验证。",
    evidence: "未验证。",
    benefit: "说明这项技术在系统里负责什么工作。",
    limitation: "这是根据词汇表合成的兜底说明，因为 Gemini 没有返回完整解释正文。",
    nextAction: "下一次扫描后重新生成类比，并继续把证据放在每个结论旁边。",
  },
};

const EMPTY_EXPLANATION_COPY: Record<Locale, string> = {
  en: "No explanation generated.",
  ja: "説明は生成されませんでした。",
  "zh-CN": "未生成解释。",
};

type SupportedAnalogy = "bicycle" | "house" | "plant" | "human body";

const ANALOGY_NAMES: Record<SupportedAnalogy, Record<Locale, string>> = {
  bicycle: { en: "bicycle", ja: "自転車", "zh-CN": "自行车" },
  house: { en: "house", ja: "家", "zh-CN": "房子" },
  plant: { en: "plant", ja: "植物", "zh-CN": "植物" },
  "human body": { en: "human body", ja: "人体", "zh-CN": "人体" },
};

const NO_SIGNAL_COPY: Record<Locale, string> = {
  en: "none",
  ja: "なし",
  "zh-CN": "未检测到",
};

type FallbackVocabularyTemplate = {
  term: string;
  job: string;
  role: (analogyName: string) => string;
  evidence: (report: ScanReport) => string;
};

const fallbackList = (items: string[], locale: Locale) => items.join(", ") || NO_SIGNAL_COPY[locale];

const FALLBACK_VOCABULARY: Record<Locale, FallbackVocabularyTemplate[]> = {
  en: [
    {
      term: "TypeScript",
      job: "Gives code variables strict types so programming mistakes are caught earlier.",
      role: (analogyName) => `The blueprint measurements in the ${analogyName}.`,
      evidence: (report) => `Language scan includes: ${fallbackList(report.inventory.languages.map((language) => language.name), "en")}.`,
    },
    {
      term: "React",
      job: "Creates interactive browser interfaces that users can see and operate.",
      role: (analogyName) => `The user-facing surface of the ${analogyName}.`,
      evidence: (report) => `Frontend stack detected: ${fallbackList(report.detectedStack.frontend, "en")}.`,
    },
    {
      term: "Material UI (MUI)",
      job: "Provides polished Material Design components for the React interface.",
      role: (analogyName) => `The standardized fittings and controls in the ${analogyName}.`,
      evidence: (report) => `Frontend stack detected: ${fallbackList(report.detectedStack.frontend, "en")}.`,
    },
    {
      term: "Node.js",
      job: "Runs the server-side JavaScript and TypeScript code.",
      role: (analogyName) => `The engine room that keeps the ${analogyName} operating.`,
      evidence: (report) => `Backend stack detected: ${fallbackList(report.detectedStack.backend, "en")}.`,
    },
    {
      term: "Fastify",
      job: "Handles API requests with a focused, low-overhead backend server.",
      role: (analogyName) => `The request desk inside the ${analogyName}.`,
      evidence: (report) => `Backend stack detected: ${fallbackList(report.detectedStack.backend, "en")}.`,
    },
    {
      term: "Zod",
      job: "Checks whether incoming data matches the expected schema before it is trusted.",
      role: (analogyName) => `The inspection checklist for the ${analogyName}.`,
      evidence: (report) => `Data stack detected: ${fallbackList(report.detectedStack.data, "en")}.`,
    },
    {
      term: "Gemini API",
      job: "Generates and reviews analogy explanations when Google AI access is configured.",
      role: (analogyName) => `The reasoning assistant that explains the ${analogyName}.`,
      evidence: (report) => `Data stack detected: ${fallbackList(report.detectedStack.data, "en")}.`,
    },
    {
      term: "Cloud Run",
      job: "Runs the web app and API as a deployable Google Cloud service.",
      role: (analogyName) => `The public address where the ${analogyName} can be used by others.`,
      evidence: (report) => `Deployment stack detected: ${fallbackList(report.detectedStack.deploy, "en")}.`,
    },
    {
      term: "Tests",
      job: "Check core behavior repeatedly so agents cannot only claim that work is done.",
      role: (analogyName) => `The safety inspection before the ${analogyName} is handed over.`,
      evidence: (report) => `Test stack detected: ${fallbackList(report.detectedStack.test, "en")}.`,
    },
    {
      term: "Git",
      job: "Records file changes over time so the project baseline can be reviewed.",
      role: (analogyName) => `The maintenance log for the ${analogyName}.`,
      evidence: (report) => `Git status reports branch ${report.git.branch}; has commits: ${report.git.hasCommits ? "yes" : "no"}.`,
    },
  ],
  ja: [
    {
      term: "TypeScript",
      job: "コード変数に厳密な型を付け、プログラミングミスを早期に見つけます。",
      role: (analogyName) => `${analogyName}における設計図の寸法です。`,
      evidence: (report) => `言語スキャン: ${fallbackList(report.inventory.languages.map((language) => language.name), "ja")}。`,
    },
    {
      term: "React",
      job: "ユーザーが見て操作するブラウザー画面を作ります。",
      role: (analogyName) => `${analogyName}の利用者に見える表面です。`,
      evidence: (report) => `フロントエンド検出結果: ${fallbackList(report.detectedStack.frontend, "ja")}。`,
    },
    {
      term: "Material UI (MUI)",
      job: "React 画面に整った Material Design コンポーネントを提供します。",
      role: (analogyName) => `${analogyName}の標準化された設備や操作部品です。`,
      evidence: (report) => `フロントエンド検出結果: ${fallbackList(report.detectedStack.frontend, "ja")}。`,
    },
    {
      term: "Node.js",
      job: "サーバー側の JavaScript / TypeScript コードを動かします。",
      role: (analogyName) => `${analogyName}を動かし続ける機械室です。`,
      evidence: (report) => `バックエンド検出結果: ${fallbackList(report.detectedStack.backend, "ja")}。`,
    },
    {
      term: "Fastify",
      job: "軽量なバックエンドサーバーとして API リクエストを処理します。",
      role: (analogyName) => `${analogyName}の中にある受付窓口です。`,
      evidence: (report) => `バックエンド検出結果: ${fallbackList(report.detectedStack.backend, "ja")}。`,
    },
    {
      term: "Zod",
      job: "入力データが期待されたスキーマに合っているか確認します。",
      role: (analogyName) => `${analogyName}の点検チェックリストです。`,
      evidence: (report) => `データ層検出結果: ${fallbackList(report.detectedStack.data, "ja")}。`,
    },
    {
      term: "Gemini API",
      job: "Google AI の設定が有効なとき、類比説明の生成とレビューを行います。",
      role: (analogyName) => `${analogyName}を説明する推論アシスタントです。`,
      evidence: (report) => `データ層検出結果: ${fallbackList(report.detectedStack.data, "ja")}。`,
    },
    {
      term: "Cloud Run",
      job: "Web アプリと API を Google Cloud 上のサービスとして実行します。",
      role: (analogyName) => `${analogyName}を他の人が使える公開住所です。`,
      evidence: (report) => `デプロイ検出結果: ${fallbackList(report.detectedStack.deploy, "ja")}。`,
    },
    {
      term: "Tests",
      job: "主要な動作を繰り返し確認し、エージェントの完了主張だけに頼らないようにします。",
      role: (analogyName) => `${analogyName}を引き渡す前の安全点検です。`,
      evidence: (report) => `テスト検出結果: ${fallbackList(report.detectedStack.test, "ja")}。`,
    },
    {
      term: "Git",
      job: "ファイル変更の履歴を記録し、プロジェクトの基準点を確認できるようにします。",
      role: (analogyName) => `${analogyName}の保守記録です。`,
      evidence: (report) => `Git ブランチは ${report.git.branch}、コミットあり: ${report.git.hasCommits ? "はい" : "いいえ"}。`,
    },
  ],
  "zh-CN": [
    {
      term: "TypeScript",
      job: "给代码变量加上严格类型，尽早发现编程错误。",
      role: (analogyName) => `${analogyName}里的蓝图尺寸。`,
      evidence: (report) => `语言扫描结果: ${fallbackList(report.inventory.languages.map((language) => language.name), "zh-CN")}。`,
    },
    {
      term: "React",
      job: "创建用户能看到、能操作的浏览器界面。",
      role: (analogyName) => `${analogyName}面向使用者的外观和操作面。`,
      evidence: (report) => `前端技术栈检测结果: ${fallbackList(report.detectedStack.frontend, "zh-CN")}。`,
    },
    {
      term: "Material UI (MUI)",
      job: "为 React 界面提供成熟的 Material Design 组件。",
      role: (analogyName) => `${analogyName}里的标准化设施和控制件。`,
      evidence: (report) => `前端技术栈检测结果: ${fallbackList(report.detectedStack.frontend, "zh-CN")}。`,
    },
    {
      term: "Node.js",
      job: "运行服务端的 JavaScript / TypeScript 代码。",
      role: (analogyName) => `让${analogyName}持续运转的机房。`,
      evidence: (report) => `后端技术栈检测结果: ${fallbackList(report.detectedStack.backend, "zh-CN")}。`,
    },
    {
      term: "Fastify",
      job: "用轻量后端服务器处理 API 请求。",
      role: (analogyName) => `${analogyName}里的请求接待台。`,
      evidence: (report) => `后端技术栈检测结果: ${fallbackList(report.detectedStack.backend, "zh-CN")}。`,
    },
    {
      term: "Zod",
      job: "检查输入数据是否符合预期 schema，再决定是否可信。",
      role: (analogyName) => `${analogyName}的验收清单。`,
      evidence: (report) => `数据层检测结果: ${fallbackList(report.detectedStack.data, "zh-CN")}。`,
    },
    {
      term: "Gemini API",
      job: "当 Google AI 访问配置完成后，用来生成并审核类比解释。",
      role: (analogyName) => `负责解释${analogyName}的推理助手。`,
      evidence: (report) => `数据层检测结果: ${fallbackList(report.detectedStack.data, "zh-CN")}。`,
    },
    {
      term: "Cloud Run",
      job: "把 Web 应用和 API 作为 Google Cloud 服务运行起来。",
      role: (analogyName) => `让别人能访问${analogyName}的公开地址。`,
      evidence: (report) => `部署技术栈检测结果: ${fallbackList(report.detectedStack.deploy, "zh-CN")}。`,
    },
    {
      term: "Tests",
      job: "反复检查核心行为，避免只相信 agent 的口头完成声明。",
      role: (analogyName) => `${analogyName}交付前的安全检查。`,
      evidence: (report) => `测试技术栈检测结果: ${fallbackList(report.detectedStack.test, "zh-CN")}。`,
    },
    {
      term: "Git",
      job: "记录文件随时间发生的变化，让项目基线可以被审查。",
      role: (analogyName) => `${analogyName}的维修记录。`,
      evidence: (report) => `Git 状态显示分支 ${report.git.branch}；是否已有提交: ${report.git.hasCommits ? "是" : "否"}。`,
    },
  ],
};

function buildFallbackVocabulary(report: ScanReport, analogy: SupportedAnalogy, locale: Locale): AnalogyResponse["vocabulary"] {
  const analogyName = ANALOGY_NAMES[analogy][locale];
  return FALLBACK_VOCABULARY[locale].map((row) => ({
    term: row.term,
    job: row.job,
    role: row.role(analogyName),
    evidence: row.evidence(report),
  }));
}

export function isGeminiConfigured(): boolean {
  return Boolean(ai);
}

export async function generateExplanation(
  report: ScanReport,
  identity: "boss" | "designer" | "sales",
  analogy: "bicycle" | "house" | "plant" | "human body",
  locale: Locale = "en"
): Promise<AnalogyResponse> {
  if (!ai) {
    return getFallbackAnalogy(report, identity, analogy, locale);
  }

  const prompt = `You are an expert software architect and communicator. Translate the following project scan report into a user-selected analogy explanation.

User Profession Preset: ${identity}
Selected Basic Object: ${analogy}
Output Language: ${OUTPUT_LANGUAGE[locale]} (${locale})

Here is the deterministic scan report of the project:
${JSON.stringify(report, null, 2)}

Evidence rules:
- Use only measured facts present in the scan report for file paths, counts, packages, Git status, tests, deployment, Gemini status, and translation status.
- If a fact is missing, weak, fallback-only, or unverified, say "Unverified" or name the blocker instead of guessing.
- Do not claim the app is event-ready unless the report proves Gemini is configured, translation review passed, and deployment has a verified URL.
- Write all user-facing explanation, vocabulary job, role, and evidence text in ${OUTPUT_LANGUAGE[locale]}. Keep product names, package names, file paths, commands, JSON keys, and Mermaid syntax unchanged.
- For ${locale}, use these module labels inside the explanation string: ${ANALOGY_LABELS[locale].claim}, ${ANALOGY_LABELS[locale].analogy}, ${ANALOGY_LABELS[locale].evidence}, ${ANALOGY_LABELS[locale].benefit}, ${ANALOGY_LABELS[locale].limitation}, ${ANALOGY_LABELS[locale].nextAction}.

Requirements:
1. Write a comprehensive explanation structured as multiple logical modules. Explain framework, architecture, programming language, tools, benefits, and limitations. For each module, write in this specific format:
   Claim: <what is being explained, e.g. "React UI frontend is partial">
   Analogy: <metaphor description mapping the engineering concept to the ${analogy} object, tailored to the user's profession: ${identity}>
   Evidence: <list scanner facts from the report that prove this claim, e.g. "apps/web/package.json contains react but files counts are low">
   Benefit: <why this technical choice helps>
   Limitation: <what this choice does not solve yet>
   Next action: <the exact engineering steps recommended to move forward, e.g. "Create React component views">

2. Generate Mermaid diagram code (inside a string field "diagramCode") representing the analogy components and how they map to actual technical components. The diagram must include model foundation, frontend, backend/API, schemas/contracts, tests/Git, and Cloud Run/deployment. Do not include markdown code block formatting like "\`\`\`mermaid" inside the JSON string, just the raw Mermaid code (e.g., "flowchart TD\\n  ...").
3. Generate a vocabulary translation list explaining the detected technologies in this format:
   - term: The tech term (e.g. "React")
   - job: Plain-language explanation of what it does
   - role: What role it plays in the selected basic object (${analogy})
   - evidence: Scanner proof detected in this codebase (e.g. "react dependency in package.json")
   Provide definitions for: TypeScript, React, MUI, Node.js, Fastify, Zod, Gemini API, Cloud Run, tests, and Git (if detected in the report).

Return the response in JSON format matching the following structure:
{
  "explanation": "string content with Claim -> Analogy -> Evidence -> Benefit -> Limitation -> Next action modules",
  "diagramCode": "flowchart TD\\n  A[Analogy Term] --> B[Another Term]\\n  ...",
  "vocabulary": [
   { "term": "string", "job": "string", "role": "string", "evidence": "string" }
  ]
}

Return only valid JSON. Do not include markdown fences, commentary, or extra prose outside the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const parsed = JSON.parse(text);
    return normalizeAnalogyResponse(parsed, locale);
  } catch (err: any) {
    console.error("Gemini API error, using fallback:", err);
    return getFallbackAnalogy(report, identity, analogy, locale);
  }
}

export function normalizeAnalogyResponse(parsed: unknown, locale: Locale = "en"): AnalogyResponse {
  const value = isRecord(parsed) ? parsed : {};
  const vocabulary = normalizeVocabulary(value.vocabulary);
  const explanationCandidate =
    value.explanation ??
    value.explanationModules ??
    value.modules ??
    value.sections ??
    value.moduleExplanations ??
    value.analysis ??
    value.summary ??
    value.details;
  let explanation = normalizeExplanation(explanationCandidate, locale);
  if (explanation === EMPTY_EXPLANATION_COPY[locale] && vocabulary.length > 0) {
    explanation = buildExplanationFromVocabulary(vocabulary, locale);
  }

  return {
    explanation,
    diagramCode: typeof value.diagramCode === "string" && value.diagramCode.trim()
      ? value.diagramCode
      : "flowchart TD\n  A[Tech] --> B[Analogy]",
    vocabulary,
  };
}

function normalizeExplanation(value: unknown, locale: Locale): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    const modules = value.map((item) => formatExplanationModule(item, locale)).filter(Boolean);
    return modules.length > 0 ? modules.join("\n\n") : EMPTY_EXPLANATION_COPY[locale];
  }

  if (isRecord(value)) {
    const moduleText = formatExplanationModule(value, locale);
    return moduleText || JSON.stringify(value, null, 2);
  }

  return EMPTY_EXPLANATION_COPY[locale];
}

function formatExplanationModule(value: unknown, locale: Locale): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  const labels = ANALOGY_LABELS[locale];

  const lines = [
    [labels.claim, value.claim],
    [labels.analogy, value.analogy],
    [labels.evidence, value.evidence],
    [labels.benefit, value.benefit],
    [labels.limitation, value.limitation],
    [labels.nextAction, value.next_action ?? value.nextAction],
  ]
    .filter(([, content]) => content !== undefined && content !== null && stringifyContent(content).trim())
    .map(([label, content]) => `${label}: ${stringifyContent(content)}`);

  return lines.join("\n");
}

function normalizeVocabulary(value: unknown): AnalogyResponse["vocabulary"] {
  const rows = Array.isArray(value) ? value : isRecord(value) ? Object.values(value) : [];
  return rows
    .filter(isRecord)
    .map((row) => ({
      term: stringifyContent(row.term),
      job: stringifyContent(row.job),
      role: stringifyContent(row.role),
      evidence: stringifyContent(row.evidence),
    }))
    .filter((row) => row.term || row.job || row.role || row.evidence);
}

function buildExplanationFromVocabulary(vocabulary: AnalogyResponse["vocabulary"], locale: Locale): string {
  const labels = ANALOGY_LABELS[locale];
  const copy = VOCABULARY_FALLBACK_COPY[locale];
  const moduleText = vocabulary
    .slice(0, 6)
    .map((row) => `${labels.claim}: ${copy.claim(row.term)}
${labels.analogy}: ${row.role || copy.role}
${labels.evidence}: ${row.evidence || copy.evidence}
${labels.benefit}: ${row.job || copy.benefit}
${labels.limitation}: ${copy.limitation}
${labels.nextAction}: ${copy.nextAction}`)
    .join("\n\n");

  return moduleText || EMPTY_EXPLANATION_COPY[locale];
}

function stringifyContent(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(stringifyContent).filter(Boolean).join("; ");
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${stringifyContent(item)}`)
      .filter((item) => !item.endsWith(": "))
      .join("; ");
  }
  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function translateCopy(
  locale: "en" | "ja" | "zh-CN",
  strings: Record<string, string>
): Promise<{
  reviewedStrings: Record<string, string>;
  status: "reviewed" | "unverified";
  reviewedBy: string;
  reviewedAt: string;
}> {
  const defaultRes = {
    reviewedStrings: strings,
    status: "unverified" as const,
    reviewedBy: "fallback",
    reviewedAt: new Date().toISOString()
  };

  if (!ai) {
    return defaultRes;
  }

const prompt = `You are a professional localization reviewer. Translate and review the following UI copy dictionary into the target locale. Ensure you use the provided glossary to translate technical terms consistently.

Target Locale: ${locale}

Glossary:
${JSON.stringify(GLOSSARY, null, 2)}

Copy Strings to Translate/Review:
${JSON.stringify(strings, null, 2)}

Instructions:
- Keep the keys exactly the same.
- Translate the values into ${locale}. If the target locale is English, review and normalize the English copy instead of changing product terms.
- Do not translate code identifiers, package names, files, commands, environment variables, or product names (e.g. "TypeScript", "React", "Fastify", "Zod", "Cloud Run" should stay as is, unless the glossary says otherwise).
- Return only a valid JSON dictionary mapping the original keys to the translated/reviewed values.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "";
    const reviewedStrings = JSON.parse(text);
    return {
      reviewedStrings,
      status: "reviewed",
      reviewedBy: "gemini",
      reviewedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error("Gemini Translation API error:", err);
    return defaultRes;
  }
}

export function getFallbackAnalogy(
  report: ScanReport,
  identity: string,
  analogy: SupportedAnalogy,
  locale: Locale = "en"
): AnalogyResponse {
  const branch = report.git.branch;
  const labels = ANALOGY_LABELS[locale];
  const metaphor = {
    bicycle: {
      core: "rider power, crank, chain, and wheels",
      ui: "handlebar, seat, brake levers, and visible frame",
      architecture: "frame geometry and cable routing",
      contract: "bike-fit measurements and repair checklist",
      deploy: "road test and riding route",
    },
    house: {
      core: "utility room and power supply",
      ui: "rooms, doors, exterior wall, and switches",
      architecture: "foundation, floor plan, and wiring layout",
      contract: "building measurements and inspection checklist",
      deploy: "address, keys, and move-in route",
    },
    plant: {
      core: "roots and growth energy",
      ui: "leaves, flowers, and visible shape",
      architecture: "stem, branches, and root structure",
      contract: "growth instructions and care log",
      deploy: "soil, sunlight, and outdoor environment",
    },
    "human body": {
      core: "heart and model foundation",
      ui: "skin, senses, and movement",
      architecture: "skeleton plus nervous system",
      contract: "DNA-like instructions and immune checks",
      deploy: "body operating in the real environment",
    },
  }[analogy];

  const explanation = `${labels.claim}: The frontend framework is the part users directly experience.
${labels.analogy}: For a ${identity}, React and MUI are like the ${metaphor.ui} of a ${analogy}: people judge the product through what they can see, touch, and operate.
${labels.evidence}: Frontend stack detected: ${report.detectedStack.frontend.join(", ") || "none"}.
${labels.benefit}: A reusable UI framework lets the team build polished screens quickly.
${labels.limitation}: A good surface does not prove the backend, AI key, translation, or deployment are complete.
${labels.nextAction}: Keep the Analogy View visual, evidence-backed, and responsive on mobile.

${labels.claim}: The backend architecture moves data and decisions through the system.
${labels.analogy}: Fastify and API routes are like the ${metaphor.core}; they receive requests, move information, and make the visible experience work.
${labels.evidence}: Backend stack detected: ${report.detectedStack.backend.join(", ") || "none"}; network stack: ${report.detectedStack.network.join(", ") || "none"}.
${labels.benefit}: A focused API layer is easier for agents to inspect and deploy to Cloud Run.
${labels.limitation}: External AI behavior still depends on valid Google Cloud ADC or GEMINI_API_KEY configuration and verified API responses.
${labels.nextAction}: Verify /api/health, /api/scan, and /api/generate-explanation after every build.

${labels.claim}: TypeScript, Zod, tests, and Git are the supervision layer.
${labels.analogy}: They act like ${metaphor.contract}: they define allowed shapes, catch bad changes, and keep a record of what happened.
${labels.evidence}: Data stack: ${report.detectedStack.data.join(", ") || "none"}; tests: ${report.detectedStack.test.join(", ") || "none"}; branch "${branch}" has commits: ${report.git.hasCommits ? "yes" : "no"}.
${labels.benefit}: The user can demand proof instead of trusting vague agent claims.
${labels.limitation}: No first commit means the current baseline is not sealed yet.
${labels.nextAction}: Make an approved initial commit when the user is ready.

${labels.claim}: Deployment turns the local project into a real product surface.
${labels.analogy}: Cloud Run is like the ${metaphor.deploy}: it proves the system can leave the workshop and run for other people.
${labels.evidence}: Deploy stack detected: ${report.detectedStack.deploy.join(", ") || "none"}.
${labels.benefit}: One Fastify server can serve both API and Vite static assets.
${labels.limitation}: It is not truly deployed until a live URL passes /api/health.
${labels.nextAction}: Deploy only after build, API smoke tests, and static asset checks pass.`;

  const diagramCode = `flowchart TD
  Model[Model foundation / ${metaphor.core}] --> API[Fastify API / tool calls]
  UI[React + MUI / ${metaphor.ui}] --> API
  Shared[Zod + TypeScript / ${metaphor.contract}] --> API
  Shared --> UI
  Checks[Tests + Git evidence] --> Shared
  Deploy[Cloud Run / ${metaphor.deploy}] --> UI
  Deploy --> API`;

  const vocabulary = buildFallbackVocabulary(report, analogy, locale);

  return {
    explanation,
    diagramCode,
    vocabulary,
  };
}
