import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AccountTree as AccountTreeIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  Code as CodeIcon,
  ContentCopy as ContentCopyIcon,
  Dashboard as DashboardIcon,
  Error as ErrorIcon,
  FactCheck as FactCheckIcon,
  FileDownload as FileDownloadIcon,
  FolderZip as FolderZipIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  MenuBook as MenuBookIcon,
  PlayArrow as PlayArrowIcon,
  Psychology as PsychologyIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Translate as TranslateIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { AnalogyResponse, ScanReport } from "@spec-compass/shared";

type TabKey = "overview" | "scan" | "analogy" | "launch" | "agents" | "deploy";
type Identity = "boss" | "designer" | "sales";
type AnalogyStyle = "bicycle" | "house" | "plant" | "human body";
type LocaleKey = "en" | "ja" | "zh-CN";
type ScanSourceMode = "serverWorkspace" | "githubUrl" | "localPath";
type DeploymentInfo = ScanReport["deployment"];
type HealthResponse = {
  status: string;
  geminiConfigured: boolean;
  deployment?: DeploymentInfo;
  time: string;
};
type RuntimeMetrics = {
  appLoadMs: number | null;
  domContentLoadedMs: number | null;
  jsKb: number | null;
  resourceCount: number;
};

const defaultScanPath = "";

const localeCopy = {
  en: {
    tagline: "Evidence-backed project scanner for humans and coding agents.",
    scanPath: "Workspace path",
    sourceMode: "Source",
    sourceServer: "Server",
    sourceGithub: "GitHub",
    sourceLocal: "Local",
    sourceInput: "Source input",
    sourceServerPlaceholder: "Server workspace snapshot",
    githubUrlPlaceholder: "https://github.com/owner/repo",
    localPathPlaceholder: "/absolute/local/project/path",
    githubUrlRequired: "Enter a GitHub repository URL before scanning.",
    sourceWarnings: "Source warnings",
    sourceEvidence: "Source evidence",
    rescan: "Run scan",
    lastScan: "Last scan",
    notReady: "Not event-ready yet",
    readyToDemo: "Ready for a local demo",
    currentTruth: "Current truth",
    runEvidence: "Evidence",
    nextAction: "Next action",
    remainingGaps: "Remaining gaps",
    verifiedChecks: "Verified checks",
    moduleMap: "Real module map",
    diagramSource: "Diagram source",
    generatedExplanation: "Generated explanation",
    analogyImage: "Generated analogy image",
    imageHint: "A shareable SVG image generated from the selected audience, object, and scanner evidence.",
    noAnalogy: "Choose an audience and analogy, then generate an explanation from measured evidence.",
    copyExplanation: "Copy explanation",
    copyDiagram: "Copy diagram",
    copyImageSvg: "Copy SVG",
    copiedImageSvg: "Image SVG copied",
    downloadSvg: "Download SVG",
    imageEvidence: "Image evidence",
    copied: "Copied",
    openEvidence: "Open evidence",
    launchSummary: "Agent-ready packet",
    launchTitle: "Launch Packet",
    launchHint: "Copy this into Gemini or Antigravity to continue the build loop with explicit guardrails.",
    missingReport: "Scanner has not returned a report yet.",
    scanFailed: "Scan failed. Check that the API server is running.",
    analogyFailed: "Analogy generation failed. Fallback mode may still be available if the API is healthy.",
    deployTruth: "Deployment truth",
    deployPanelTitle: "Deploy Panel",
    localOnly: "Local preview",
    cloudPartial: "Cloud Run artifacts ready, live service not verified",
    cloudVerified: "Cloud Run verified",
    cloudRuntime: "Cloud Run runtime",
    submissionEvidence: "Submission evidence",
    submissionEvidenceReady: "Cloud Run URL, service, revision, and scan source are included in the packet.",
    submissionEvidenceIncomplete: "Deployment evidence is incomplete; keep this marked unverified.",
    publicUrl: "Public URL",
    service: "Service",
    revision: "Revision",
    region: "Region",
    scanSource: "Scan source",
    copyUrl: "Copy URL",
    copyPacket: "Copy packet",
    guardrails: "Guardrails",
    nextRoundTasks: "Next-round tasks",
    currentBranch: "Current branch",
    gitBaseline: "Git baseline",
    present: "present",
    missing: "missing",
    notSet: "Not set",
    notDetected: "Not detected",
    verified: "Verified",
    pending: "Pending",
    verificationChecklist: "Verification checklist",
    check: "Check",
    status: "Status",
    cloudRunReadiness: "Cloud Run readiness",
    liveServiceVerified: "Live service verified with deterministic deployment evidence.",
    areaScore: "Area score",
    serviceUrl: "Service URL",
    deployArtifacts: "Deploy artifacts",
    cloudScannerNote: "The cloud scanner should use zip, Git, or Cloud Storage input later. Local filesystem paths are only trustworthy in local preview.",
    none: "None",
    files: "files",
    lines: "lines",
    score: "Score",
    configured: "configured",
    fallback: "fallback",
    reviewed: "reviewed",
    unverified: "unverified",
    clean: "Clean",
    detected: "Detected",
    noCommits: "No commits yet",
    headExists: "HEAD exists",
    noBlockingGaps: "No blocking gaps reported by the scanner.",
    product: "Product",
    engineering: "Engineering",
    evidenceShort: "Evidence",
    workspace: "Workspace",
    tests: "Tests",
    cloud: "Cloud",
    hasCommits: "has commits",
    demoPathTitle: "Three-function demo path",
    demoPathChip: "Project Scan -> Analogy -> Launch Packet",
    demoCards: [
      {
        title: "Project Scan",
        body: "Stack, code size, Git, deployment, tests, and risk evidence are measured from files.",
      },
      {
        title: "Analogy View",
        body: "Audience and metaphor controls turn engineering modules into explainable work objects.",
      },
      {
        title: "Launch Packet",
        body: "A copyable agent handoff preserves stack limits, next tasks, and completion standards.",
      },
    ],
    projectScan: {
      title: "Project Scan",
      subtitle: "Deterministic facts before any model explanation.",
      technologyStack: "Technology stack",
      languageMix: "Language mix",
      gitState: "Git state",
      repository: "Repository",
      branch: "Branch",
      latestCommit: "Latest commit",
      dirtyState: "Dirty state",
      untrackedEntries: "untracked top-level entries",
      stackRows: {
        frontend: "Frontend",
        backend: "Backend",
        network: "Network",
        database: "Database",
        data: "Data / Schema",
        deploy: "Deploy",
        tests: "Tests",
      },
    },
    areaTable: {
      title: "Functional areas",
      area: "Area",
      status: "Status",
      progress: "Progress",
      nextAction: "Next action",
      evidence: "Evidence",
      monitor: "Monitor",
      open: "Open",
    },
    engineeringMonitor: {
      title: "Engineering Monitor",
      subtitle: "Programmer-facing baseline for stack drift, architecture boundaries, code growth, and runtime performance.",
      deltaActive: "Delta active",
      baselinePending: "Baseline pending",
      codeGrowth: "Code growth baseline",
      languageGrowth: "Language growth",
      performance: "Performance benchmark",
      architectureWatch: "Architecture boundary watch",
      firstScanNote: "First scan sets the baseline. Running scan again shows real growth since the previous scan in this browser session.",
      resourceEntries: "Resource entries",
      buildOutputNote: "Use build output as the source of truth for bundle warnings.",
      labels: {
        lines: "Lines",
        files: "Files",
        lineTrend: "Line trend",
        baseline: "Baseline",
        current: "Current",
        nextScan: "Next scan",
        setNow: "set now",
        actual: "actual",
        pending: "pending",
        baselinePending: "baseline pending",
        sinceLastScan: "since last scan",
      },
      boundaries: {
        frontend: {
          label: "Frontend",
          boundary: "User-facing React/MUI surfaces and browser state.",
        },
        backend: {
          label: "Backend",
          boundary: "Fastify routes, scanner orchestration, Gemini endpoints.",
        },
        contracts: {
          label: "Contracts",
          boundary: "Zod schemas shared by API and UI.",
        },
        runtime: {
          label: "Runtime",
          boundary: "One Node service serving API and Vite assets.",
        },
      },
      performanceRows: {
        scanApiLatency: {
          label: "Scan API latency",
          target: "local target < 250 ms",
        },
        appLoad: {
          label: "App load",
          target: "watch > 1.2 s",
        },
        domReady: {
          label: "DOM ready",
          target: "watch > 800 ms",
        },
        jsBundle: {
          label: "JS bundle",
          target: "Vite warns > 500 KB",
        },
      },
    },
    analogyUi: {
      title: "Analogy View",
      subtitle: "Explain real engineering modules in a language the selected audience understands.",
      userProfession: "User profession",
      basicObject: "Basic object",
      generateFromEvidence: "Generate from evidence",
      mermaid: "Mermaid",
      vocabularyTitle: "Vocabulary translation layer",
      term: "Term",
      job: "Job",
      source: "Source",
      evidenceLabel: "Evidence",
      audience: "Audience",
      object: "Object",
      benefit: "Benefit",
      limit: "Limit",
      analogy: "Analogy",
    },
    analogyMap: {
      frontendTerm: "Frontend UI",
      backendTerm: "Backend API",
      sharedTerm: "Shared contract",
      gitTerm: "Git state",
      visibleSurface: "visible surface",
      operatingCore: "operating core",
      inspectionStandard: "inspection standard",
      buildLedger: "build ledger",
    },
    metaphors: {
      bicycle: {
        system: "Bicycle system",
        core: "Crank, chain, and wheel drive",
        interface: "Handlebar, seat, and brake levers",
        architecture: "Frame geometry and cable routing",
        language: "Bike-fit measurements",
        tools: "Repair stand and maintenance log",
        deploy: "Road test and riding route",
        flow: "Pedal force, chain motion, and brake cable signals",
        sample: "Model foundation = rider power, API/tool calls = chain and brake cables, UI = handlebar and seat, tests/Git = repair checks.",
      },
      house: {
        system: "Building system",
        core: "Utility room and power supply",
        interface: "Rooms, doors, and exterior wall",
        architecture: "Foundation and floor plan",
        language: "Construction measurements",
        tools: "Building inspection and site ledger",
        deploy: "Address, keys, and move-in route",
        flow: "Plumbing, wiring, and hallway flow",
        sample: "Model foundation = power supply, API/tool calls = wiring and plumbing, UI = rooms and exterior, tests/Git = inspection records.",
      },
      plant: {
        system: "Plant system",
        core: "Roots and growth energy",
        interface: "Leaves, flowers, and visible shape",
        architecture: "Stem, branches, and root structure",
        language: "Genetic growth instructions",
        tools: "Gardening checks and care log",
        deploy: "Soil, sunlight, and outdoor environment",
        flow: "Water, nutrients, and sunlight moving through the plant",
        sample: "Model foundation = roots, API/tool calls = nutrient flow, UI = leaves and flowers, tests/Git = pruning and growth records.",
      },
      "human body": {
        system: "Human body",
        core: "Heart and model foundation",
        interface: "Skin, senses, and movement",
        architecture: "Skeleton and nervous system",
        language: "DNA-like operating instructions",
        tools: "Immune checks and medical record",
        deploy: "Body in the real environment",
        flow: "Bloodstream and nerve signals",
        sample: "Model foundation = heart, API/tool calls = bloodstream and nerves, UI = skin and senses, tests/Git = immune checks and medical record.",
      },
    },
    analogyLayers: {
      modelFoundation: {
        label: "Model foundation",
        real: "Gemini API / fallback engine",
        metaphorSuffix: "gives the system intelligence and rhythm",
        explains: "The AI layer turns scan evidence into user-facing explanation and translation.",
        benefit: "One module can generate audience-specific explanations.",
        limitation: "Without Gemini configuration it truthfully runs in fallback mode.",
        evidenceGap: "Gemini key gap detected",
        evidenceReady: "Gemini route available",
      },
      language: {
        label: "Language",
        noLanguage: "No language lines detected",
        explains: "Programming language is the rule system the agent must write in.",
        benefit: "TypeScript catches many mistakes before runtime.",
        limitation: "Types do not prove the product is useful or deployed.",
      },
      frontend: {
        label: "Frontend framework",
        explains: "This is what ordinary users touch, scan, read, and copy.",
        benefit: "React + MUI can build a polished console quickly.",
        limitation: "Large dashboards can become heavy without component splitting.",
      },
      backend: {
        label: "Backend architecture",
        explains: "The API receives scan requests, calls analysis logic, and returns structured evidence.",
        benefit: "Fastify keeps Cloud Run serving and API routing lightweight.",
        limitation: "External APIs and keys must be verified before claiming full automation.",
      },
      contracts: {
        label: "Contracts and tools",
        explains: "Schemas, tests, and Git keep the agent from drifting away from facts.",
        benefit: "A reviewer can ask for evidence instead of trusting claims.",
        limitationWithHistory: "History exists, but new changes still need review.",
        limitationNoHistory: "No first commit yet, so the baseline is not sealed.",
        gitCommitsPresent: "Git commits present",
      },
      deployment: {
        label: "Deployment path",
        explains: "This is how the local app becomes a public service.",
        benefit: "Cloud Run fits the Node/Fastify server and Vite static assets.",
        limitation: "A live URL must pass /api/health before it is called deployed.",
      },
    },
    blueprint: {
      title: "Visual analogy blueprint",
      subtitle: "Explains framework, architecture, language, tools, benefits, and limits for {{identity}}.",
      appCore: "In this app, the AI/model foundation is the reasoning core: it turns scanner evidence into explanation, diagrams, translation, and next-step supervision.",
      exampleMapping: "Example mapping",
      currentEvidence: "Current evidence",
      geminiFallback: "Gemini key is not configured, so generated copy uses fallback mode.",
      geminiReady: "Gemini route is available.",
      framework: {
        label: "Framework",
        detail: "Frameworks decide how UI screens, API routes, and reusable components are assembled.",
      },
      architecture: {
        label: "Architecture",
        detail: "The project is separated into web, API, and shared contracts so agents can work without mixing concerns.",
      },
      language: {
        label: "Language",
        detail: "The language is the instruction system that keeps the engineering work precise and reviewable.",
      },
      tools: {
        label: "Tools",
        detail: "Tools provide checks, history, deployment evidence, and boundaries for the next agent loop.",
      },
    },
    agents: {
      title: "AI Team Map",
      subtitle: "A simple organization model for routing work to specialist agents.",
      tools: "Tools",
      capabilities: "Capabilities",
      evidence: "Evidence",
    },
    deployChecks: {
      fastifyPort: "Fastify listens on PORT",
      fastifyPortDetail: "Server binds to 0.0.0.0 and process.env.PORT.",
      viteServed: "Vite build served by API",
      viteServedDetail: "Fastify serves apps/web/dist in production.",
      dockerfilePresent: "Dockerfile present",
      geminiConfigured: "Gemini API configured",
      geminiConfiguredDetail: "Google Cloud / Enterprise or API key active",
      fallbackMode: "Fallback mode",
      translationReviewed: "Translation reviewed",
      translationReviewedDetail: "Reviewed by Gemini",
      translationFallback: "Unverified fallback",
      liveCloudRunUrl: "Live Cloud Run URL",
      cloudRunRevision: "Cloud Run revision",
      hostedSourceSnapshot: "Hosted source snapshot",
      cloudSafeInput: "Cloud-safe scan input",
    },
    guardrailItems: [
      "Do not change the approved TypeScript + MUI + Fastify stack.",
      "Do not claim Gemini review without Google Cloud / Enterprise or API key evidence.",
      "Do not call Cloud Run deployed until a live URL, service, revision, and /api/health are verified.",
      "Do not push or publish unapproved project changes.",
    ],
    identities: {
      boss: "Boss",
      designer: "Designer",
      sales: "Sales",
    },
    analogies: {
      bicycle: "Bicycle",
      house: "House",
      plant: "Plant",
      "human body": "Human body",
    },
  },
  ja: {
    tagline: "人間とコーディングエージェント向けの根拠ベースのプロジェクトスキャナー。",
    scanPath: "ワークスペースパス",
    sourceMode: "ソース",
    sourceServer: "サーバー",
    sourceGithub: "GitHub",
    sourceLocal: "ローカル",
    sourceInput: "ソース入力",
    sourceServerPlaceholder: "サーバー作業区スナップショット",
    githubUrlPlaceholder: "https://github.com/owner/repo",
    localPathPlaceholder: "/absolute/local/project/path",
    githubUrlRequired: "スキャン前に GitHub リポジトリ URL を入力してください。",
    sourceWarnings: "ソース警告",
    sourceEvidence: "ソース根拠",
    rescan: "スキャン実行",
    lastScan: "最終スキャン",
    notReady: "イベント準備は未完了",
    readyToDemo: "ローカルデモ可能",
    currentTruth: "現在の事実",
    runEvidence: "根拠",
    nextAction: "次のアクション",
    remainingGaps: "残りのギャップ",
    verifiedChecks: "検証済みチェック",
    moduleMap: "実モジュール対応表",
    diagramSource: "図表ソース",
    generatedExplanation: "生成された説明",
    analogyImage: "生成された類比画像",
    imageHint: "選択した対象者、物、スキャン根拠から生成した共有用 SVG 画像です。",
    noAnalogy: "対象者と比喩を選び、計測済み根拠から説明を生成します。",
    copyExplanation: "説明をコピー",
    copyDiagram: "図表をコピー",
    copyImageSvg: "SVG をコピー",
    copiedImageSvg: "画像 SVG をコピーしました",
    downloadSvg: "SVG をダウンロード",
    imageEvidence: "画像の根拠",
    copied: "コピーしました",
    openEvidence: "根拠を開く",
    launchSummary: "エージェント用パケット",
    launchTitle: "ローンチパケット",
    launchHint: "Gemini または Antigravity に貼り付けて、明確な制約付きで開発ループを継続します。",
    missingReport: "スキャナー結果はまだありません。",
    scanFailed: "スキャンに失敗しました。API サーバーを確認してください。",
    analogyFailed: "類比生成に失敗しました。API が正常ならフォールバックを利用できます。",
    deployTruth: "デプロイ事実",
    deployPanelTitle: "デプロイパネル",
    localOnly: "ローカルプレビュー",
    cloudPartial: "Cloud Run 成果物は準備済み、実サービスは未検証",
    cloudVerified: "Cloud Run 検証済み",
    cloudRuntime: "Cloud Run ランタイム",
    submissionEvidence: "提出用エビデンス",
    submissionEvidenceReady: "Cloud Run URL、サービス、リビジョン、スキャン元がパケットに含まれています。",
    submissionEvidenceIncomplete: "デプロイ証拠が不完全です。未検証として表示してください。",
    publicUrl: "公開 URL",
    service: "サービス",
    revision: "リビジョン",
    region: "リージョン",
    scanSource: "スキャン元",
    copyUrl: "URL をコピー",
    copyPacket: "パケットをコピー",
    guardrails: "ガードレール",
    nextRoundTasks: "次ラウンドのタスク",
    currentBranch: "現在のブランチ",
    gitBaseline: "Git ベースライン",
    present: "あり",
    missing: "なし",
    notSet: "未設定",
    notDetected: "未検出",
    verified: "検証済み",
    pending: "保留",
    verificationChecklist: "検証チェックリスト",
    check: "チェック",
    status: "状態",
    cloudRunReadiness: "Cloud Run 準備状況",
    liveServiceVerified: "決定的なデプロイ証拠で実サービスを検証済みです。",
    areaScore: "エリアスコア",
    serviceUrl: "サービス URL",
    deployArtifacts: "デプロイ成果物",
    cloudScannerNote: "クラウド版スキャナーは今後 zip、Git、Cloud Storage 入力に対応させます。ローカルファイルパスはローカルプレビューでのみ信頼できます。",
    none: "なし",
    files: "ファイル",
    lines: "行",
    score: "スコア",
    configured: "設定済み",
    fallback: "フォールバック",
    reviewed: "レビュー済み",
    unverified: "未検証",
    clean: "クリーン",
    detected: "検出済み",
    noCommits: "コミットなし",
    headExists: "HEAD あり",
    noBlockingGaps: "スキャナーからブロック要因は報告されていません。",
    product: "プロダクト",
    engineering: "エンジニアリング",
    evidenceShort: "根拠",
    workspace: "ワークスペース",
    tests: "テスト",
    cloud: "クラウド",
    hasCommits: "コミットあり",
    demoPathTitle: "3機能デモの流れ",
    demoPathChip: "プロジェクトスキャン -> 類比 -> ローンチパケット",
    demoCards: [
      {
        title: "プロジェクトスキャン",
        body: "スタック、コード量、Git、デプロイ、テスト、リスク根拠をファイルから計測します。",
      },
      {
        title: "類比解説",
        body: "対象者と比喩の選択で、技術モジュールを理解しやすい作業物に変換します。",
      },
      {
        title: "ローンチパケット",
        body: "スタック制約、次タスク、完了基準を保ったエージェント引き継ぎ文をコピーできます。",
      },
    ],
    projectScan: {
      title: "プロジェクトスキャン",
      subtitle: "モデル説明の前に、まず決定的な事実を確認します。",
      technologyStack: "技術スタック",
      languageMix: "言語構成",
      gitState: "Git 状態",
      repository: "リポジトリ",
      branch: "ブランチ",
      latestCommit: "最新コミット",
      dirtyState: "変更状態",
      untrackedEntries: "件の未追跡トップレベル項目",
      stackRows: {
        frontend: "フロントエンド",
        backend: "バックエンド",
        network: "ネットワーク",
        database: "データベース",
        data: "データ / スキーマ",
        deploy: "デプロイ",
        tests: "テスト",
      },
    },
    areaTable: {
      title: "機能エリア",
      area: "エリア",
      status: "状態",
      progress: "進捗",
      nextAction: "次のアクション",
      evidence: "根拠",
      monitor: "監視",
      open: "開く",
    },
    engineeringMonitor: {
      title: "エンジニアリング監視",
      subtitle: "スタック逸脱、境界、コード増分、実行性能を見る開発者向けベースラインです。",
      deltaActive: "差分有効",
      baselinePending: "ベースライン未確定",
      codeGrowth: "コード増分ベースライン",
      languageGrowth: "言語別増分",
      performance: "性能ベンチマーク",
      architectureWatch: "アーキテクチャ境界監視",
      firstScanNote: "初回スキャンがベースラインになります。同じブラウザで再スキャンすると前回との差分が表示されます。",
      resourceEntries: "リソース数",
      buildOutputNote: "バンドル警告の真実はビルド出力を優先してください。",
      labels: {
        lines: "行数",
        files: "ファイル",
        lineTrend: "行数トレンド",
        baseline: "ベースライン",
        current: "現在",
        nextScan: "次回スキャン",
        setNow: "今回設定",
        actual: "実測",
        pending: "保留",
        baselinePending: "ベースライン待ち",
        sinceLastScan: "前回スキャン比",
      },
      boundaries: {
        frontend: {
          label: "フロントエンド",
          boundary: "ユーザー向け React/MUI 画面とブラウザ状態。",
        },
        backend: {
          label: "バックエンド",
          boundary: "Fastify ルート、スキャナー制御、Gemini エンドポイント。",
        },
        contracts: {
          label: "契約",
          boundary: "API と UI で共有する Zod スキーマ。",
        },
        runtime: {
          label: "ランタイム",
          boundary: "API と Vite 静的資産を配信する単一 Node サービス。",
        },
      },
      performanceRows: {
        scanApiLatency: {
          label: "スキャン API 遅延",
          target: "ローカル目標 < 250 ms",
        },
        appLoad: {
          label: "アプリ読み込み",
          target: "1.2秒超を監視",
        },
        domReady: {
          label: "DOM 準備",
          target: "800 ms 超を監視",
        },
        jsBundle: {
          label: "JS バンドル",
          target: "Vite 警告 > 500 KB",
        },
      },
    },
    analogyUi: {
      title: "類比解説",
      subtitle: "選択した対象者が理解できる言葉で、実際の技術モジュールを説明します。",
      userProfession: "対象者",
      basicObject: "基本オブジェクト",
      generateFromEvidence: "根拠から生成",
      mermaid: "Mermaid",
      vocabularyTitle: "専門用語翻訳レイヤー",
      term: "用語",
      job: "役割",
      source: "ソース",
      evidenceLabel: "根拠",
      audience: "対象者",
      object: "オブジェクト",
      benefit: "利点",
      limit: "制限",
      analogy: "比喩",
    },
    analogyMap: {
      frontendTerm: "フロントエンド UI",
      backendTerm: "バックエンド API",
      sharedTerm: "共有契約",
      gitTerm: "Git 状態",
      visibleSurface: "見える表面",
      operatingCore: "動作の中核",
      inspectionStandard: "検査基準",
      buildLedger: "制作台帳",
    },
    metaphors: {
      bicycle: {
        system: "自転車システム",
        core: "クランク、チェーン、車輪",
        interface: "ハンドル、サドル、ブレーキレバー",
        architecture: "フレーム形状とケーブル配線",
        language: "自転車フィットの測定値",
        tools: "整備スタンドと点検記録",
        deploy: "試走ルート",
        flow: "ペダル力、チェーン運動、ブレーキ信号",
        sample: "モデル基盤 = 乗り手の力、API/ツール呼び出し = チェーンとブレーキケーブル、UI = ハンドルとサドル、テスト/Git = 点検記録。",
      },
      house: {
        system: "住宅システム",
        core: "設備室と電源",
        interface: "部屋、扉、外壁",
        architecture: "基礎と間取り",
        language: "建築寸法",
        tools: "建築検査と現場台帳",
        deploy: "住所、鍵、入居経路",
        flow: "配管、配線、廊下の動線",
        sample: "モデル基盤 = 電源、API/ツール呼び出し = 配線と配管、UI = 部屋と外観、テスト/Git = 検査記録。",
      },
      plant: {
        system: "植物システム",
        core: "根と成長エネルギー",
        interface: "葉、花、見える形",
        architecture: "茎、枝、根の構造",
        language: "遺伝的な成長指示",
        tools: "園芸チェックと世話記録",
        deploy: "土、日光、屋外環境",
        flow: "水、栄養、日光の流れ",
        sample: "モデル基盤 = 根、API/ツール呼び出し = 栄養の流れ、UI = 葉と花、テスト/Git = 剪定と成長記録。",
      },
      "human body": {
        system: "人体",
        core: "心臓とモデル基盤",
        interface: "皮膚、感覚、動き",
        architecture: "骨格と神経系",
        language: "DNA のような運用指示",
        tools: "免疫チェックと診療記録",
        deploy: "現実環境で動く身体",
        flow: "血流と神経信号",
        sample: "モデル基盤 = 心臓、API/ツール呼び出し = 血流と神経、UI = 皮膚と感覚、テスト/Git = 免疫チェックと診療記録。",
      },
    },
    analogyLayers: {
      modelFoundation: {
        label: "モデル基盤",
        real: "Gemini API / フォールバックエンジン",
        metaphorSuffix: "システムに知性とリズムを与える",
        explains: "AI 層はスキャン根拠をユーザー向け説明と翻訳に変換します。",
        benefit: "1つのモジュールで対象者別の説明を生成できます。",
        limitation: "Gemini 設定がなければ正直にフォールバックで動きます。",
        evidenceGap: "Gemini キーの不足を検出",
        evidenceReady: "Gemini ルート利用可能",
      },
      language: {
        label: "言語",
        noLanguage: "言語行数は未検出",
        explains: "プログラミング言語はエージェントが従うルール体系です。",
        benefit: "TypeScript は実行前に多くのミスを検出できます。",
        limitation: "型だけではプロダクト価値やデプロイ完了は証明できません。",
      },
      frontend: {
        label: "フロントエンドフレームワーク",
        explains: "普通のユーザーが触り、読み、コピーする部分です。",
        benefit: "React + MUI は整った管理画面を素早く作れます。",
        limitation: "大きなダッシュボードは分割しないと重くなります。",
      },
      backend: {
        label: "バックエンド構成",
        explains: "API はスキャン要求を受け、分析ロジックを呼び、構造化根拠を返します。",
        benefit: "Fastify は Cloud Run 上の配信と API ルーティングを軽く保ちます。",
        limitation: "外部 API とキーは自動化完了を主張する前に検証が必要です。",
      },
      contracts: {
        label: "契約とツール",
        explains: "スキーマ、テスト、Git はエージェントが事実から逸脱しないよう支えます。",
        benefit: "レビュー担当者は曖昧な主張ではなく根拠を要求できます。",
        limitationWithHistory: "履歴はありますが、新しい変更にはレビューが必要です。",
        limitationNoHistory: "初回コミットがなく、ベースラインはまだ固定されていません。",
        gitCommitsPresent: "Git コミットあり",
      },
      deployment: {
        label: "デプロイ経路",
        explains: "ローカルアプリを公開サービスにする道筋です。",
        benefit: "Cloud Run は Node/Fastify サーバーと Vite 静的資産に合っています。",
        limitation: "有効な URL が /api/health を通るまでデプロイ済みとは呼べません。",
      },
    },
    blueprint: {
      title: "ビジュアル類比ブループリント",
      subtitle: "{{identity}} 向けに、フレームワーク、構成、言語、ツール、利点、制限を説明します。",
      appCore: "このアプリでは AI/モデル基盤が推論の中核です。スキャン根拠を説明、図、翻訳、次の監督タスクへ変換します。",
      exampleMapping: "対応例",
      currentEvidence: "現在の根拠",
      geminiFallback: "Gemini キー未設定のため、生成コピーはフォールバックモードです。",
      geminiReady: "Gemini ルートが利用可能です。",
      framework: {
        label: "フレームワーク",
        detail: "フレームワークは UI 画面、API ルート、再利用部品の組み立て方を決めます。",
      },
      architecture: {
        label: "アーキテクチャ",
        detail: "web、API、共有契約に分けることで、エージェントが関心を混ぜずに作業できます。",
      },
      language: {
        label: "言語",
        detail: "言語はエンジニアリング作業を正確かつ検証可能に保つ指示体系です。",
      },
      tools: {
        label: "ツール",
        detail: "ツールはチェック、履歴、デプロイ根拠、次のエージェントループの境界を提供します。",
      },
    },
    agents: {
      title: "AI チームマップ",
      subtitle: "専門エージェントへ作業を振り分けるためのシンプルな組織モデルです。",
      tools: "ツール",
      capabilities: "能力",
      evidence: "根拠",
    },
    deployChecks: {
      fastifyPort: "Fastify が PORT を listen",
      fastifyPortDetail: "サーバーは 0.0.0.0 と process.env.PORT にバインドします。",
      viteServed: "Vite ビルドを API が配信",
      viteServedDetail: "本番環境では Fastify が apps/web/dist を配信します。",
      dockerfilePresent: "Dockerfile あり",
      geminiConfigured: "Gemini API 設定済み",
      geminiConfiguredDetail: "Google Cloud / Enterprise または API キーが有効",
      fallbackMode: "フォールバックモード",
      translationReviewed: "翻訳レビュー済み",
      translationReviewedDetail: "Gemini によるレビュー済み",
      translationFallback: "未検証フォールバック",
      liveCloudRunUrl: "有効な Cloud Run URL",
      cloudRunRevision: "Cloud Run リビジョン",
      hostedSourceSnapshot: "ホスト済みソーススナップショット",
      cloudSafeInput: "クラウド対応スキャン入力",
    },
    guardrailItems: [
      "承認済みの TypeScript + MUI + Fastify スタックを変更しない。",
      "Google Cloud / Enterprise または API キーの証拠なしに Gemini レビュー済みと主張しない。",
      "有効な URL、サービス、リビジョン、/api/health が検証されるまで Cloud Run デプロイ済みと主張しない。",
      "未承認のプロジェクト変更を push または公開しない。",
    ],
    identities: {
      boss: "経営者",
      designer: "デザイナー",
      sales: "営業",
    },
    analogies: {
      bicycle: "自転車",
      house: "家",
      plant: "植物",
      "human body": "人体",
    },
  },
  "zh-CN": {
    tagline: "给普通用户和编码 agent 共用的、有证据的项目体检台。",
    scanPath: "工作区路径",
    sourceMode: "来源",
    sourceServer: "服务器",
    sourceGithub: "GitHub",
    sourceLocal: "本地",
    sourceInput: "来源输入",
    sourceServerPlaceholder: "服务器工作区快照",
    githubUrlPlaceholder: "https://github.com/owner/repo",
    localPathPlaceholder: "/absolute/local/project/path",
    githubUrlRequired: "请先输入 GitHub 仓库 URL 再扫描。",
    sourceWarnings: "来源警告",
    sourceEvidence: "来源证据",
    rescan: "运行体检",
    lastScan: "最后扫描",
    notReady: "尚未达到活动级完成",
    readyToDemo: "可本地演示",
    currentTruth: "当前真实状态",
    runEvidence: "证据",
    nextAction: "下一步",
    remainingGaps: "剩余缺口",
    verifiedChecks: "已验证检查",
    moduleMap: "真实模块映射",
    diagramSource: "图表源码",
    generatedExplanation: "生成解释",
    analogyImage: "生成类比图",
    imageHint: "根据所选身份、类比物件和扫描证据生成的可分享 SVG 图。",
    noAnalogy: "选择身份和类比后，从真实扫描证据生成解释。",
    copyExplanation: "复制解释",
    copyDiagram: "复制图表",
    copyImageSvg: "复制 SVG",
    copiedImageSvg: "类比图 SVG 已复制",
    downloadSvg: "下载 SVG",
    imageEvidence: "图像证据",
    copied: "已复制",
    openEvidence: "打开证据",
    launchSummary: "Agent 开工包",
    launchTitle: "开工包",
    launchHint: "复制到 Gemini 或 Antigravity，让它按明确边界继续循环开发。",
    missingReport: "扫描器还没有返回报告。",
    scanFailed: "扫描失败。检查 API 服务是否在运行。",
    analogyFailed: "类比生成失败。如果 API 正常，可继续使用 fallback。",
    deployTruth: "部署真实状态",
    deployPanelTitle: "部署看板",
    localOnly: "本地预览",
    cloudPartial: "Cloud Run 文件已准备，线上服务未验证",
    cloudVerified: "Cloud Run 已验证",
    cloudRuntime: "Cloud Run 运行时",
    submissionEvidence: "提交证据",
    submissionEvidenceReady: "Cloud Run URL、服务、版本和扫描来源已写入开工包。",
    submissionEvidenceIncomplete: "部署证据不完整，请继续标记为未验证。",
    publicUrl: "公开 URL",
    service: "服务",
    revision: "版本",
    region: "区域",
    scanSource: "扫描来源",
    copyUrl: "复制 URL",
    copyPacket: "复制开工包",
    guardrails: "护栏规则",
    nextRoundTasks: "下一轮任务",
    currentBranch: "当前分支",
    gitBaseline: "Git 基线",
    present: "已有",
    missing: "缺失",
    notSet: "未设置",
    notDetected: "未检测到",
    verified: "已验证",
    pending: "待验证",
    verificationChecklist: "验证清单",
    check: "检查项",
    status: "状态",
    cloudRunReadiness: "Cloud Run 准备度",
    liveServiceVerified: "线上服务已通过确定性部署证据验证。",
    areaScore: "区域评分",
    serviceUrl: "服务 URL",
    deployArtifacts: "部署产物",
    cloudScannerNote: "云端扫描器后续应支持 zip、Git 或 Cloud Storage 输入。本地文件路径只适合本地预览。",
    none: "无",
    files: "文件",
    lines: "行",
    score: "评分",
    configured: "已配置",
    fallback: "fallback",
    reviewed: "已审核",
    unverified: "未验证",
    clean: "干净",
    detected: "已检测到",
    noCommits: "尚无提交",
    headExists: "HEAD 存在",
    noBlockingGaps: "扫描器没有报告阻塞性缺口。",
    product: "产品",
    engineering: "工程",
    evidenceShort: "证据",
    workspace: "工作区",
    tests: "测试",
    cloud: "云端",
    hasCommits: "已有提交",
    demoPathTitle: "三大功能演示路径",
    demoPathChip: "项目体检 -> 类比解释 -> 开工包",
    demoCards: [
      {
        title: "项目体检",
        body: "从文件中实测技术栈、代码量、Git、部署、测试和风险证据。",
      },
      {
        title: "类比解释",
        body: "通过受众和类比物件，把工程模块翻译成普通用户能理解的对象。",
      },
      {
        title: "开工包",
        body: "可复制的 agent 交接包会保留技术栈边界、下一步任务和完成标准。",
      },
    ],
    projectScan: {
      title: "项目体检",
      subtitle: "先看确定性事实，再看任何模型解释。",
      technologyStack: "技术栈",
      languageMix: "语言构成",
      gitState: "Git 状态",
      repository: "仓库",
      branch: "分支",
      latestCommit: "最新提交",
      dirtyState: "改动状态",
      untrackedEntries: "个未跟踪顶层项目",
      stackRows: {
        frontend: "前端",
        backend: "后端",
        network: "网络",
        database: "数据库",
        data: "数据 / Schema",
        deploy: "部署",
        tests: "测试",
      },
    },
    areaTable: {
      title: "功能区域",
      area: "区域",
      status: "状态",
      progress: "进度",
      nextAction: "下一步",
      evidence: "证据",
      monitor: "监控",
      open: "打开",
    },
    engineeringMonitor: {
      title: "工程监控",
      subtitle: "给程序员看的基线：技术栈漂移、架构边界、代码增长和运行性能。",
      deltaActive: "差分已启用",
      baselinePending: "基线待建立",
      codeGrowth: "代码增长基线",
      languageGrowth: "语言增长",
      performance: "性能基准",
      architectureWatch: "架构边界监控",
      firstScanNote: "第一次扫描会建立基线。在同一个浏览器会话里再次扫描，就能看到相对上次扫描的真实增长。",
      resourceEntries: "资源条目",
      buildOutputNote: "Bundle 警告以 build 输出为准。",
      labels: {
        lines: "行数",
        files: "文件",
        lineTrend: "行数趋势",
        baseline: "基线",
        current: "当前",
        nextScan: "下次扫描",
        setNow: "本次建立",
        actual: "实测",
        pending: "待定",
        baselinePending: "基线待建立",
        sinceLastScan: "相对上次扫描",
      },
      boundaries: {
        frontend: {
          label: "前端",
          boundary: "面向用户的 React/MUI 页面和浏览器状态。",
        },
        backend: {
          label: "后端",
          boundary: "Fastify 路由、扫描器编排、Gemini 接口。",
        },
        contracts: {
          label: "契约",
          boundary: "API 和 UI 共用的 Zod schema。",
        },
        runtime: {
          label: "运行时",
          boundary: "一个 Node 服务同时托管 API 和 Vite 静态资源。",
        },
      },
      performanceRows: {
        scanApiLatency: {
          label: "扫描 API 延迟",
          target: "本地目标 < 250 ms",
        },
        appLoad: {
          label: "应用加载",
          target: "关注 > 1.2 s",
        },
        domReady: {
          label: "DOM 就绪",
          target: "关注 > 800 ms",
        },
        jsBundle: {
          label: "JS bundle",
          target: "Vite 警告 > 500 KB",
        },
      },
    },
    analogyUi: {
      title: "类比解释",
      subtitle: "用所选受众能理解的语言，解释真实工程模块。",
      userProfession: "用户身份",
      basicObject: "基础物件",
      generateFromEvidence: "根据证据生成",
      mermaid: "Mermaid",
      vocabularyTitle: "专业词汇翻译层",
      term: "术语",
      job: "职责",
      source: "来源",
      evidenceLabel: "证据",
      audience: "受众",
      object: "物件",
      benefit: "优点",
      limit: "限制",
      analogy: "类比",
    },
    analogyMap: {
      frontendTerm: "前端 UI",
      backendTerm: "后端 API",
      sharedTerm: "共享契约",
      gitTerm: "Git 状态",
      visibleSurface: "可见表面",
      operatingCore: "运行核心",
      inspectionStandard: "检查标准",
      buildLedger: "建造台账",
    },
    metaphors: {
      bicycle: {
        system: "自行车系统",
        core: "曲柄、链条和车轮传动",
        interface: "车把、座椅和刹车杆",
        architecture: "车架几何和线缆走向",
        language: "车身尺寸测量",
        tools: "维修架和保养记录",
        deploy: "试骑路线",
        flow: "踏板力量、链条运动和刹车信号",
        sample: "模型基座 = 骑手力量，API/工具调用 = 链条和刹车线，UI = 车把和座椅，测试/Git = 维修检查。",
      },
      house: {
        system: "房屋系统",
        core: "设备间和供电系统",
        interface: "房间、门和外墙",
        architecture: "地基和平面布局",
        language: "建筑测量尺寸",
        tools: "验房清单和工地台账",
        deploy: "地址、钥匙和入住路线",
        flow: "水管、电线和走廊动线",
        sample: "模型基座 = 供电系统，API/工具调用 = 电线和水管，UI = 房间和外墙，测试/Git = 验收记录。",
      },
      plant: {
        system: "植物系统",
        core: "根系和生长能量",
        interface: "叶子、花和可见形态",
        architecture: "茎、枝和根部结构",
        language: "遗传生长指令",
        tools: "园艺检查和养护日志",
        deploy: "土壤、阳光和户外环境",
        flow: "水分、养分和阳光在植物内流动",
        sample: "模型基座 = 根系，API/工具调用 = 养分流动，UI = 叶子和花，测试/Git = 修剪和生长记录。",
      },
      "human body": {
        system: "人体系统",
        core: "心脏和模型基座",
        interface: "皮肤、感官和动作",
        architecture: "骨架和神经系统",
        language: "类似 DNA 的运行指令",
        tools: "免疫检查和病历",
        deploy: "在真实环境中运行的人体",
        flow: "血液循环和神经信号",
        sample: "模型基座 = 心脏，API/工具调用 = 血流和神经，UI = 皮肤和感官，测试/Git = 免疫检查和病历。",
      },
    },
    analogyLayers: {
      modelFoundation: {
        label: "模型基座",
        real: "Gemini API / fallback 引擎",
        metaphorSuffix: "给系统提供智能和节奏",
        explains: "AI 层把扫描证据转成用户能读懂的解释和翻译。",
        benefit: "一个模块就能生成面向不同受众的解释。",
        limitation: "没有 Gemini 配置时，会诚实地进入 fallback 模式。",
        evidenceGap: "检测到 Gemini key 缺口",
        evidenceReady: "Gemini 路由可用",
      },
      language: {
        label: "语言",
        noLanguage: "未检测到语言行数",
        explains: "编程语言是 agent 必须遵守的规则体系。",
        benefit: "TypeScript 能在运行前发现许多错误。",
        limitation: "类型不能单独证明产品有用或已经部署。",
      },
      frontend: {
        label: "前端框架",
        explains: "这是普通用户触摸、查看、扫描和复制的部分。",
        benefit: "React + MUI 能快速构建专业的控制台页面。",
        limitation: "大型看板如果不拆组件，可能变重。",
      },
      backend: {
        label: "后端架构",
        explains: "API 接收扫描请求，调用分析逻辑，并返回结构化证据。",
        benefit: "Fastify 让 Cloud Run 服务和 API 路由保持轻量。",
        limitation: "外部 API 和 key 必须先验证，才能声称自动化完整。",
      },
      contracts: {
        label: "契约和工具",
        explains: "Schema、测试和 Git 防止 agent 偏离事实。",
        benefit: "审核者可以要求证据，而不是相信模糊说法。",
        limitationWithHistory: "已有历史，但新改动仍需要审核。",
        limitationNoHistory: "还没有第一次提交，当前基线尚未封存。",
        gitCommitsPresent: "Git 提交已存在",
      },
      deployment: {
        label: "部署路径",
        explains: "这是把本地应用变成公开服务的路径。",
        benefit: "Cloud Run 适合托管 Node/Fastify 服务和 Vite 静态资源。",
        limitation: "线上 URL 必须通过 /api/health，才能称为已部署。",
      },
    },
    blueprint: {
      title: "可视化类比蓝图",
      subtitle: "面向 {{identity}} 解释框架、架构、语言、工具、优点和限制。",
      appCore: "在这个应用里，AI/模型基座是推理核心：它把扫描证据转成解释、图表、翻译和下一步监督。",
      exampleMapping: "映射示例",
      currentEvidence: "当前证据",
      geminiFallback: "Gemini key 未配置，因此生成内容使用 fallback 模式。",
      geminiReady: "Gemini 路由可用。",
      framework: {
        label: "框架",
        detail: "框架决定 UI 页面、API 路由和可复用组件如何组装。",
      },
      architecture: {
        label: "架构",
        detail: "项目拆分为 web、API 和共享契约，agent 可以分清边界，不混着改。",
      },
      language: {
        label: "语言",
        detail: "语言是让工程工作保持精确和可检查的指令体系。",
      },
      tools: {
        label: "工具",
        detail: "工具提供检查、历史、部署证据，以及下一轮 agent 工作边界。",
      },
    },
    agents: {
      title: "AI 团队看板",
      subtitle: "用于把工作分配给专门 agent 的简单组织模型。",
      tools: "工具",
      capabilities: "能力",
      evidence: "证据",
    },
    deployChecks: {
      fastifyPort: "Fastify 监听 PORT",
      fastifyPortDetail: "服务绑定 0.0.0.0 并读取 process.env.PORT。",
      viteServed: "API 托管 Vite 构建产物",
      viteServedDetail: "生产环境由 Fastify 托管 apps/web/dist。",
      dockerfilePresent: "Dockerfile 存在",
      geminiConfigured: "Gemini API 已配置",
      geminiConfiguredDetail: "Google Cloud / Enterprise 或 API key 已启用",
      fallbackMode: "Fallback 模式",
      translationReviewed: "翻译已审核",
      translationReviewedDetail: "Gemini 已审核",
      translationFallback: "未验证 fallback",
      liveCloudRunUrl: "线上 Cloud Run URL",
      cloudRunRevision: "Cloud Run 版本",
      hostedSourceSnapshot: "托管源码快照",
      cloudSafeInput: "云端安全扫描输入",
    },
    guardrailItems: [
      "不要更改已批准的 TypeScript + MUI + Fastify 技术栈。",
      "没有 Google Cloud / Enterprise 或 API key 证据时，不要声称 Gemini 已审核。",
      "没有验证 URL、服务、版本和 /api/health 前，不要声称 Cloud Run 已部署。",
      "不要 push 或发布未经项目批准的变更。",
    ],
    identities: {
      boss: "老板",
      designer: "设计师",
      sales: "销售",
    },
    analogies: {
      bicycle: "自行车",
      house: "房子",
      plant: "植物",
      "human body": "人体",
    },
  },
};

const tabs: Array<{ key: TabKey; labelKey: string; icon: React.ReactElement }> = [
  { key: "overview", labelKey: "sections.overview", icon: <DashboardIcon /> },
  { key: "scan", labelKey: "sections.projectScan", icon: <SearchIcon /> },
  { key: "analogy", labelKey: "sections.analogy", icon: <PsychologyIcon /> },
  { key: "launch", labelKey: "sections.launchPacket", icon: <FolderZipIcon /> },
  { key: "agents", labelKey: "sections.aiTeam", icon: <AccountTreeIcon /> },
  { key: "deploy", labelKey: "sections.deployPanel", icon: <CloudUploadIcon /> },
];

function normalizeLocale(language: string): LocaleKey {
  if (language.startsWith("ja")) return "ja";
  if (language.startsWith("zh")) return "zh-CN";
  return "en";
}

function scoreColor(value: number): "success" | "warning" | "error" {
  if (value >= 80) return "success";
  if (value >= 50) return "warning";
  return "error";
}

function statusIcon(status: string) {
  if (status === "verified") return <CheckCircleIcon color="success" />;
  if (status === "usable") return <CheckCircleIcon color="primary" />;
  if (status === "partial") return <WarningIcon color="warning" />;
  return <ErrorIcon color="error" />;
}

function listText(items: string[], fallback = localeCopy.en.none) {
  return items.length > 0 ? items.join(", ") : fallback;
}

function formatSigned(value: number) {
  if (value > 0) return `+${value.toLocaleString()}`;
  return value.toLocaleString();
}

function formatMs(value: number | null, pending = localeCopy.en.pending) {
  return value === null ? pending : `${Math.round(value).toLocaleString()} ms`;
}

function formatKb(value: number | null, pending = localeCopy.en.pending) {
  return value === null ? pending : `${Math.round(value).toLocaleString()} KB`;
}

function getRuntimeMetrics(): RuntimeMetrics {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const jsEntries = performance
    .getEntriesByType("resource")
    .filter((entry) => entry.name.includes("/assets/") && entry.name.endsWith(".js")) as PerformanceResourceTiming[];
  const jsBytes = jsEntries.reduce((sum, entry) => sum + (entry.encodedBodySize || entry.transferSize || 0), 0);

  return {
    appLoadMs: navigation?.duration ? Math.round(navigation.duration) : null,
    domContentLoadedMs: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.startTime) : null,
    jsKb: jsBytes > 0 ? Math.round(jsBytes / 1024) : null,
    resourceCount: performance.getEntriesByType("resource").length,
  };
}

function metricTone(value: number | null, warningAt: number, dangerAt: number): "success" | "warning" | "error" {
  if (value === null) return "warning";
  if (value >= dangerAt) return "error";
  if (value >= warningAt) return "warning";
  return "success";
}

function getArea(report: ScanReport, name: string) {
  return report.areas.find((area) => area.name === name);
}

function getMetaphorProfile(theme: AnalogyStyle, copy: typeof localeCopy.en) {
  return copy.metaphors[theme];
}

function getAreaCompletion(report: ScanReport, name: string, fallback: number) {
  return getArea(report, name)?.score ?? fallback;
}

function hasGeminiGap(report: ScanReport) {
  return report.areas.some((area) => area.gaps.some((gap) => gap.includes("Gemini")));
}

function buildAnalogyLayers(report: ScanReport, theme: AnalogyStyle, copy: typeof localeCopy.en) {
  const profile = getMetaphorProfile(theme, copy);
  const largestLanguage = report.inventory.languages[0];
  const languageSummary = largestLanguage
    ? `${largestLanguage.name}: ${largestLanguage.lines.toLocaleString()} ${copy.lines}`
    : copy.analogyLayers.language.noLanguage;
  const frontendStack = listText(report.detectedStack.frontend, copy.none);
  const backendStack = listText(report.detectedStack.backend, copy.none);
  const networkStack = listText(report.detectedStack.network, copy.none);
  const deployStack = listText(report.detectedStack.deploy, copy.none);
  const testStack = listText(report.detectedStack.test, copy.none);
  const dataStack = listText(report.detectedStack.data, copy.none);

  return [
    {
      label: copy.analogyLayers.modelFoundation.label,
      real: copy.analogyLayers.modelFoundation.real,
      metaphor: `${profile.core}: ${copy.analogyLayers.modelFoundation.metaphorSuffix}`,
      explains: copy.analogyLayers.modelFoundation.explains,
      benefit: copy.analogyLayers.modelFoundation.benefit,
      limitation: copy.analogyLayers.modelFoundation.limitation,
      evidence: hasGeminiGap(report) ? copy.analogyLayers.modelFoundation.evidenceGap : copy.analogyLayers.modelFoundation.evidenceReady,
      completion: report.completion.evidenceConfidence,
      icon: <PsychologyIcon />,
      color: "#9334E6",
    },
    {
      label: copy.analogyLayers.language.label,
      real: languageSummary,
      metaphor: profile.language,
      explains: copy.analogyLayers.language.explains,
      benefit: copy.analogyLayers.language.benefit,
      limitation: copy.analogyLayers.language.limitation,
      evidence: listText(report.inventory.languages.map((language) => language.name), copy.none),
      completion: Math.min(100, Math.max(35, report.completion.engineering)),
      icon: <LanguageIcon />,
      color: "#0B57D0",
    },
    {
      label: copy.analogyLayers.frontend.label,
      real: frontendStack,
      metaphor: profile.interface,
      explains: copy.analogyLayers.frontend.explains,
      benefit: copy.analogyLayers.frontend.benefit,
      limitation: copy.analogyLayers.frontend.limitation,
      evidence: frontendStack,
      completion: getAreaCompletion(report, "Frontend UI Workspace", report.completion.product),
      icon: <DashboardIcon />,
      color: "#1A73E8",
    },
    {
      label: copy.analogyLayers.backend.label,
      real: `${backendStack}; ${networkStack}`,
      metaphor: profile.flow,
      explains: copy.analogyLayers.backend.explains,
      benefit: copy.analogyLayers.backend.benefit,
      limitation: copy.analogyLayers.backend.limitation,
      evidence: backendStack,
      completion: getAreaCompletion(report, "Backend API Workspace", report.completion.engineering),
      icon: <AccountTreeIcon />,
      color: "#188038",
    },
    {
      label: copy.analogyLayers.contracts.label,
      real: `${dataStack}; ${testStack}; Git ${report.git.branch}`,
      metaphor: profile.tools,
      explains: copy.analogyLayers.contracts.explains,
      benefit: copy.analogyLayers.contracts.benefit,
      limitation: report.git.hasCommits ? copy.analogyLayers.contracts.limitationWithHistory : copy.analogyLayers.contracts.limitationNoHistory,
      evidence: `${testStack}; ${report.git.hasCommits ? copy.analogyLayers.contracts.gitCommitsPresent : copy.noCommits}`,
      completion: getAreaCompletion(report, "Quality Assurance (Tests)", 70),
      icon: <SecurityIcon />,
      color: "#F9AB00",
    },
    {
      label: copy.analogyLayers.deployment.label,
      real: deployStack,
      metaphor: profile.deploy,
      explains: copy.analogyLayers.deployment.explains,
      benefit: copy.analogyLayers.deployment.benefit,
      limitation: copy.analogyLayers.deployment.limitation,
      evidence: deployStack,
      completion: getAreaCompletion(report, "Cloud Run Readiness", 50),
      icon: <CloudUploadIcon />,
      color: "#D93025",
    },
  ];
}

type AnalogyPosterNode = {
  label: string;
  metaphor: string;
  real: string;
  evidence: string;
  color: string;
};

type AnalogyPoster = {
  title: string;
  subtitle: string;
  audienceLabel: string;
  objectLabel: string;
  evidenceLabel: string;
  audience: string;
  object: string;
  source: string;
  stats: string;
  nodes: AnalogyPosterNode[];
};

function buildAnalogyPoster(report: ScanReport, identity: Identity, theme: AnalogyStyle, copy: typeof localeCopy.en): AnalogyPoster {
  const layers = buildAnalogyLayers(report, theme, copy);
  return {
    title: `${copy.identities[identity]} x ${copy.analogies[theme]}`,
    subtitle: report.project.goal,
    audienceLabel: copy.analogyUi.audience,
    objectLabel: copy.analogyUi.object,
    evidenceLabel: copy.analogyUi.evidenceLabel,
    audience: copy.identities[identity],
    object: copy.analogies[theme],
    source: report.source.url || report.source.label,
    stats: `${report.inventory.files.toLocaleString()} ${copy.files} / ${report.inventory.lines.toLocaleString()} ${copy.lines}`,
    nodes: layers.map((layer) => ({
      label: layer.label,
      metaphor: layer.metaphor,
      real: layer.real,
      evidence: layer.evidence,
      color: layer.color,
    })),
  };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(value: string, maxChars: number, maxLines: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return [""];

  if (!normalized.includes(" ") && normalized.length > maxChars) {
    const lines = Array.from({ length: maxLines }, (_, index) => normalized.slice(index * maxChars, (index + 1) * maxChars)).filter(Boolean);
    if (normalized.length > maxChars * maxLines && lines.length > 0) {
      lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, Math.max(0, maxChars - 3))}...`;
    }
    return lines;
  }

  const lines: string[] = [];
  let current = "";
  for (const word of normalized.split(" ")) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = next;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  const used = lines.join(" ");
  if (used.length < normalized.length && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, Math.max(0, maxChars - 3))}...`;
  }

  return lines.length > 0 ? lines : [normalized.slice(0, maxChars)];
}

function svgText(lines: string[], x: number, y: number, options: { size?: number; weight?: number; fill?: string; lineHeight?: number } = {}) {
  const size = options.size ?? 13;
  const lineHeight = options.lineHeight ?? 17;
  const weight = options.weight ?? 400;
  const fill = options.fill ?? "#3C4043";

  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Inter, Roboto, Arial, sans-serif" font-size="${size}" font-weight="${weight}">${lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("")}</text>`;
}

function buildAnalogyPosterSvg(poster: AnalogyPoster) {
  const positions = [
    { x: 334, y: 112 },
    { x: 638, y: 112 },
    { x: 334, y: 242 },
    { x: 638, y: 242 },
    { x: 334, y: 372 },
    { x: 638, y: 372 },
  ];

  const nodeMarkup = poster.nodes.map((node, index) => {
    const pos = positions[index];
    if (!pos) return "";
    return `<g>
      <rect x="${pos.x}" y="${pos.y}" width="260" height="108" rx="12" fill="#FFFFFF" stroke="#DADCE0"/>
      <rect x="${pos.x}" y="${pos.y}" width="6" height="108" rx="3" fill="${node.color}"/>
      ${svgText(wrapText(node.label, 26, 1), pos.x + 18, pos.y + 28, { size: 14, weight: 800, fill: "#202124" })}
      ${svgText(wrapText(node.metaphor, 38, 2), pos.x + 18, pos.y + 52, { size: 12, fill: "#3C4043", lineHeight: 15 })}
      ${svgText(wrapText(node.real, 40, 1), pos.x + 18, pos.y + 94, { size: 11, fill: "#5F6368" })}
    </g>`;
  }).join("");

  const connectorMarkup = positions
    .map((pos) => `<path d="M 276 290 C 300 ${pos.y + 54}, 314 ${pos.y + 54}, ${pos.x - 10} ${pos.y + 54}" stroke="#BDC1C6" stroke-width="2" fill="none" marker-end="url(#arrow)"/>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="${escapeXml(poster.title)}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#BDC1C6"/>
    </marker>
  </defs>
  <rect width="960" height="540" rx="24" fill="#F8FAFD"/>
  <rect x="24" y="24" width="912" height="492" rx="20" fill="#FFFFFF" stroke="#DADCE0"/>
  ${svgText(wrapText(poster.title, 48, 1), 48, 62, { size: 26, weight: 800, fill: "#202124" })}
  ${svgText(wrapText(poster.subtitle, 92, 1), 48, 88, { size: 13, fill: "#5F6368" })}
  <rect x="48" y="132" width="228" height="316" rx="18" fill="#E8F0FE" stroke="#AECBFA"/>
  ${svgText([poster.audienceLabel], 72, 174, { size: 12, weight: 800, fill: "#174EA6" })}
  ${svgText(wrapText(poster.audience, 22, 1), 72, 202, { size: 24, weight: 800, fill: "#174EA6" })}
  ${svgText([poster.objectLabel], 72, 250, { size: 12, weight: 800, fill: "#188038" })}
  ${svgText(wrapText(poster.object, 22, 1), 72, 278, { size: 24, weight: 800, fill: "#188038" })}
  ${svgText([poster.evidenceLabel], 72, 326, { size: 12, weight: 800, fill: "#5F6368" })}
  ${svgText(wrapText(poster.stats, 26, 1), 72, 354, { size: 17, weight: 800, fill: "#202124" })}
  ${svgText(wrapText(poster.source, 30, 2), 72, 386, { size: 12, fill: "#5F6368", lineHeight: 16 })}
  ${connectorMarkup}
  ${nodeMarkup}
</svg>`;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const copy = localeCopy[normalizeLocale(i18n.language)];

  const [selectedTab, setSelectedTab] = useState<TabKey>("overview");
  const [sourceMode, setSourceMode] = useState<ScanSourceMode>("serverWorkspace");
  const [scanPath, setScanPath] = useState(defaultScanPath);
  const [githubUrl, setGithubUrl] = useState("");
  const [scanReport, setScanReport] = useState<ScanReport | null>(null);
  const [previousReport, setPreviousReport] = useState<ScanReport | null>(null);
  const [scanError, setScanError] = useState("");
  const [lastScannedAt, setLastScannedAt] = useState<Date | null>(null);
  const [lastScanDurationMs, setLastScanDurationMs] = useState<number | null>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [loadingAnalogy, setLoadingAnalogy] = useState(false);
  const [analogyError, setAnalogyError] = useState("");
  const [identity, setIdentity] = useState<Identity>("boss");
  const [analogyTheme, setAnalogyTheme] = useState<AnalogyStyle>("bicycle");
  const [analogyResponse, setAnalogyResponse] = useState<AnalogyResponse | null>(null);
  const [analogyView, setAnalogyView] = useState(0);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [drawerEvidence, setDrawerEvidence] = useState<string[]>([]);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [translationReviewed, setTranslationReviewed] = useState(false);
  const [runtimeMetrics, setRuntimeMetrics] = useState<RuntimeMetrics>({
    appLoadMs: null,
    domContentLoadedMs: null,
    jsKb: null,
    resourceCount: 0,
  });

  const isDeployed = scanReport?.deployment.verified ?? false;
  const sourceInputValue = sourceMode === "githubUrl" ? githubUrl : sourceMode === "localPath" ? scanPath : "";
  const sourceInputPlaceholder = sourceMode === "githubUrl"
    ? copy.githubUrlPlaceholder
    : sourceMode === "localPath"
      ? copy.localPathPlaceholder
      : copy.sourceServerPlaceholder;

  async function handleScan() {
    setLoadingScan(true);
    setScanError("");

    try {
      const trimmedPath = scanPath.trim();
      const trimmedGithubUrl = githubUrl.trim();
      if (sourceMode === "githubUrl" && !trimmedGithubUrl) {
        throw new Error(copy.githubUrlRequired);
      }

      const scanPayload = sourceMode === "githubUrl"
        ? { sourceType: "githubUrl", githubUrl: trimmedGithubUrl }
        : sourceMode === "localPath"
          ? { sourceType: "localPath", path: trimmedPath || undefined }
          : { sourceType: "serverWorkspace" };

      const startedAt = performance.now();
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scanPayload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errorBody.error || `Scan request failed with ${res.status}`);
      }

      const data = (await res.json()) as ScanReport;
      setPreviousReport(scanReport);
      setScanReport(data);
      setAnalogyResponse(null);
      setLastScannedAt(new Date());
      setLastScanDurationMs(Math.round(performance.now() - startedAt));

      const [healthResult, translationResult] = await Promise.allSettled([
        fetch("/api/health").then((healthRes) => healthRes.json() as Promise<HealthResponse>),
        fetch("/api/translate-copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: "en", strings: { test: "test" } }),
        }).then((translationRes) => translationRes.json()),
      ]);

      if (healthResult.status === "fulfilled") {
        setGeminiConfigured(Boolean(healthResult.value.geminiConfigured));
      }
      if (translationResult.status === "fulfilled") {
        setTranslationReviewed(translationResult.value.status === "reviewed");
      }
    } catch (err) {
      console.error("Scan failed:", err);
      setScanError(err instanceof Error ? err.message : copy.scanFailed);
    } finally {
      setLoadingScan(false);
    }
  }

  async function handleGenerateAnalogy() {
    if (!scanReport) return;
    setLoadingAnalogy(true);
    setAnalogyError("");

    try {
      const res = await fetch("/api/generate-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report: scanReport,
          identity,
          analogy: analogyTheme,
          locale: normalizeLocale(i18n.language),
        }),
      });

      if (!res.ok) {
        throw new Error(`Analogy request failed with ${res.status}`);
      }

      const data = (await res.json()) as AnalogyResponse;
      setAnalogyResponse(data);
    } catch (err) {
      console.error("Analogy generation failed:", err);
      setAnalogyError(copy.analogyFailed);
    } finally {
      setLoadingAnalogy(false);
    }
  }

  async function copyText(value: string, message = copy.copied) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.setAttribute("readonly", "true");
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  }

  function openEvidence(title: string, evidence: string[]) {
    setDrawerTitle(title);
    setDrawerEvidence(evidence);
    setEvidenceDrawerOpen(true);
  }

  const projectReady = useMemo(() => {
    if (!scanReport) return false;
    return scanReport.completion.product >= 70 && scanReport.completion.evidenceConfidence >= 60;
  }, [scanReport]);

  const topGaps = useMemo(() => {
    if (!scanReport) return [];
    return scanReport.areas.flatMap((area) => area.gaps.map((gap) => ({ area: area.name, gap }))).slice(0, 5);
  }, [scanReport]);

  const nextActions = useMemo(() => {
    if (!scanReport) return [];
    return scanReport.areas
      .flatMap((area) => area.nextActions.map((action) => ({ area: area.name, action })))
      .slice(0, 6);
  }, [scanReport]);

  const analogyMappings = useMemo(() => {
    if (!scanReport) return [];
    return [
      {
        term: copy.analogyMap.frontendTerm,
        module: "apps/web",
        analogy: `${copy.analogies[analogyTheme]} ${copy.analogyMap.visibleSurface}`,
        evidence: listText(scanReport.detectedStack.frontend, copy.none),
      },
      {
        term: copy.analogyMap.backendTerm,
        module: "apps/api",
        analogy: `${copy.analogies[analogyTheme]} ${copy.analogyMap.operatingCore}`,
        evidence: listText(scanReport.detectedStack.backend, copy.none),
      },
      {
        term: copy.analogyMap.sharedTerm,
        module: "packages/shared",
        analogy: `${copy.analogies[analogyTheme]} ${copy.analogyMap.inspectionStandard}`,
        evidence: listText(scanReport.detectedStack.data, copy.none),
      },
      {
        term: copy.analogyMap.gitTerm,
        module: scanReport.git.branch,
        analogy: `${copy.analogies[analogyTheme]} ${copy.analogyMap.buildLedger}`,
        evidence: scanReport.git.hasCommits ? scanReport.git.latestCommit || copy.headExists : copy.noCommits,
      },
    ];
  }, [analogyTheme, copy, scanReport]);

  const selectedIndex = tabs.findIndex((tab) => tab.key === selectedTab);

  useEffect(() => {
    void handleScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setRuntimeMetrics(getRuntimeMetrics()), 800);
    return () => window.clearTimeout(timer);
  }, [scanReport]);

  return (
    <Box sx={{ minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden", bgcolor: "background.default", color: "text.primary" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #DADCE0", maxWidth: "100vw", overflowX: "hidden" }}>
        <Toolbar sx={{ gap: 1.5, alignItems: "center", flexWrap: "wrap", py: 1, maxWidth: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: { xs: "100%", md: 260 }, maxWidth: "100%" }}>
            <SearchIcon color="primary" />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                {t("app.title")}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere" }}>
                {copy.tagline}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: { xs: "1 0 100%", md: "1 1 520px" }, minWidth: 0, width: { xs: "100%", md: "auto" } }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ minWidth: 0 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={sourceMode}
                onChange={(_, value) => value && setSourceMode(value)}
                aria-label={copy.sourceMode}
                sx={{ flexShrink: 0 }}
              >
                <ToggleButton value="serverWorkspace" aria-label={copy.sourceServer}>
                  {copy.sourceServer}
                </ToggleButton>
                <ToggleButton value="githubUrl" aria-label={copy.sourceGithub}>
                  <GitHubIcon fontSize="small" sx={{ mr: 0.75 }} />
                  {copy.sourceGithub}
                </ToggleButton>
                <ToggleButton value="localPath" aria-label={copy.sourceLocal}>
                  {copy.sourceLocal}
                </ToggleButton>
              </ToggleButtonGroup>

              <TextField
                aria-label={sourceMode === "localPath" ? copy.scanPath : copy.sourceInput}
                size="small"
                value={sourceInputValue}
                disabled={sourceMode === "serverWorkspace"}
                onChange={(event) => {
                  if (sourceMode === "githubUrl") {
                    setGithubUrl(event.target.value);
                  } else if (sourceMode === "localPath") {
                    setScanPath(event.target.value);
                  }
                }}
                sx={{ minWidth: 0, flex: 1 }}
                placeholder={sourceInputPlaceholder}
              />
            </Stack>
          </Box>

          <Button
            variant="contained"
            onClick={handleScan}
            disabled={loadingScan}
            startIcon={loadingScan ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
            sx={{ minWidth: 132, width: { xs: "calc(50% - 6px)", sm: "auto" } }}
          >
            {copy.rescan}
          </Button>

          <Select
            value={normalizeLocale(i18n.language)}
            onChange={(event) => void i18n.changeLanguage(event.target.value)}
            size="small"
            sx={{ minWidth: 126, width: { xs: "calc(50% - 6px)", sm: 126 } }}
            IconComponent={TranslateIcon}
            inputProps={{ "aria-label": t("app.language") }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ja">日本語</MenuItem>
            <MenuItem value="zh-CN">简体中文</MenuItem>
          </Select>
        </Toolbar>

        {!isDesktop && (
          <Tabs
            value={selectedIndex}
            onChange={(_, value) => setSelectedTab(tabs[value].key)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 44, px: 1 }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.key} icon={tab.icon} iconPosition="start" label={t(tab.labelKey)} sx={{ minHeight: 44 }} />
            ))}
          </Tabs>
        )}
      </AppBar>

      <Box sx={{ display: "flex", minHeight: "calc(100vh - 82px)" }}>
        {isDesktop && (
          <Box
            component="nav"
            sx={{
              width: 92,
              flexShrink: 0,
              borderRight: "1px solid #DADCE0",
              bgcolor: "background.paper",
              py: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            {tabs.map((tab) => (
              <Tooltip key={tab.key} title={t(tab.labelKey)} placement="right">
                <IconButton
                  aria-label={t(tab.labelKey)}
                  onClick={() => setSelectedTab(tab.key)}
                  color={selectedTab === tab.key ? "primary" : "default"}
                  sx={{
                    width: 64,
                    height: 56,
                    borderRadius: 2,
                    border: selectedTab === tab.key ? "1px solid #1A73E8" : "1px solid transparent",
                    bgcolor: selectedTab === tab.key ? "#E8F0FE" : "transparent",
                  }}
                >
                  {tab.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        )}

        <Box component="main" sx={{ flex: 1, minWidth: 0, maxWidth: "100%", p: { xs: 2, md: 3 }, overflow: "auto" }}>
          {scanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {scanError}
            </Alert>
          )}

          {!scanReport ? (
            <EmptyState loading={loadingScan} message={copy.missingReport} />
          ) : (
            <>
              {selectedTab === "overview" && (
                <OverviewPanel
                  copy={copy}
                  report={scanReport}
                  geminiConfigured={geminiConfigured}
                  translationReviewed={translationReviewed}
                  isDeployed={isDeployed}
                  lastScannedAt={lastScannedAt}
                  projectReady={projectReady}
                  topGaps={topGaps}
                  nextActions={nextActions}
                  setSelectedTab={setSelectedTab}
                  openEvidence={openEvidence}
                />
              )}

              {selectedTab === "scan" && (
                <ProjectScanPanel
                  copy={copy}
                  report={scanReport}
                  previousReport={previousReport}
                  lastScanDurationMs={lastScanDurationMs}
                  runtimeMetrics={runtimeMetrics}
                  openEvidence={openEvidence}
                />
              )}

              {selectedTab === "analogy" && (
                <AnalogyPanel
                  copy={copy}
                  report={scanReport}
                  identity={identity}
                  analogyTheme={analogyTheme}
                  analogyResponse={analogyResponse}
                  analogyView={analogyView}
                  loadingAnalogy={loadingAnalogy}
                  analogyError={analogyError}
                  mappings={analogyMappings}
                  setIdentity={setIdentity}
                  setAnalogyTheme={setAnalogyTheme}
                  setAnalogyView={setAnalogyView}
                  generate={handleGenerateAnalogy}
                  copyText={copyText}
                />
              )}

              {selectedTab === "launch" && (
                <LaunchPanel copy={copy} report={scanReport} nextActions={nextActions} copyText={copyText} />
              )}

              {selectedTab === "agents" && <AgentsPanel copy={copy} report={scanReport} />}

              {selectedTab === "deploy" && (
                <DeployPanel
                  copy={copy}
                  report={scanReport}
                  geminiConfigured={geminiConfigured}
                  translationReviewed={translationReviewed}
                  isDeployed={isDeployed}
                />
              )}
            </>
          )}
        </Box>
      </Box>

      <Drawer anchor="right" open={evidenceDrawerOpen} onClose={() => setEvidenceDrawerOpen(false)}>
        <Box sx={{ width: { xs: 340, sm: 460 }, p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <FactCheckIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {drawerTitle}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {copy.runEvidence}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>
            {drawerEvidence.map((evidence, index) => (
              <ListItem key={`${evidence}-${index}`} disableGutters alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 34, mt: 0.25 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontFamily: "Roboto Mono, monospace", wordBreak: "break-word" }}>
                      {evidence}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3200}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}

function EmptyState({ loading, message }: { loading: boolean; message: string }) {
  return (
    <Paper sx={{ p: 5, textAlign: "center", border: "1px solid #DADCE0" }} elevation={0}>
      {loading ? <CircularProgress sx={{ mb: 2 }} /> : <SearchIcon color="primary" sx={{ fontSize: 44, mb: 2 }} />}
      <Typography variant="h6">{message}</Typography>
    </Paper>
  );
}

function OverviewPanel({
  copy,
  report,
  geminiConfigured,
  translationReviewed,
  isDeployed,
  lastScannedAt,
  projectReady,
  topGaps,
  nextActions,
  setSelectedTab,
  openEvidence,
}: {
  copy: typeof localeCopy.en;
  report: ScanReport;
  geminiConfigured: boolean;
  translationReviewed: boolean;
  isDeployed: boolean;
  lastScannedAt: Date | null;
  projectReady: boolean;
  topGaps: Array<{ area: string; gap: string }>;
  nextActions: Array<{ area: string; action: string }>;
  setSelectedTab: (tab: TabKey) => void;
  openEvidence: (title: string, evidence: string[]) => void;
}) {
  const qaArea = getArea(report, "Quality Assurance (Tests)");
  const cloudArea = getArea(report, "Cloud Run Readiness");

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems={{ lg: "center" }} justifyContent="space-between">
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {copy.currentTruth}
          </Typography>
          <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
            {report.project.goal}
          </Typography>
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          flexWrap="wrap"
          alignItems={{ xs: "flex-start", sm: "center" }}
          useFlexGap
          sx={{ minWidth: 0, maxWidth: "100%" }}
        >
          <Chip
            icon={projectReady ? <CheckCircleIcon /> : <WarningIcon />}
            label={projectReady ? copy.readyToDemo : copy.notReady}
            color={projectReady ? "success" : "warning"}
            sx={{ maxWidth: "100%" }}
          />
          <Chip label={`Gemini ${geminiConfigured ? copy.configured : copy.fallback}`} color={geminiConfigured ? "success" : "warning"} variant="outlined" sx={{ maxWidth: "100%" }} />
          <Chip label={`${copy.deployChecks.translationReviewed} ${translationReviewed ? copy.reviewed : copy.unverified}`} color={translationReviewed ? "success" : "warning"} variant="outlined" sx={{ maxWidth: "100%" }} />
          <Chip
            label={isDeployed ? copy.cloudVerified : report.deployment.environment === "cloud-run" ? copy.cloudRuntime : copy.localOnly}
            color={isDeployed ? "success" : report.deployment.environment === "cloud-run" ? "warning" : "primary"}
            variant="outlined"
            sx={{ maxWidth: "100%" }}
          />
          <Chip
            icon={report.source.type === "githubUrl" ? <GitHubIcon /> : <SearchIcon />}
            label={`${copy.scanSource}: ${report.source.label}`}
            color={report.source.type === "githubUrl" ? "success" : "default"}
            variant="outlined"
            sx={{ maxWidth: "100%" }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <ScoreCard label={copy.product} value={report.completion.product} icon={<DashboardIcon />} />
        <ScoreCard label={copy.engineering} value={report.completion.engineering} icon={<CodeIcon />} />
        <ScoreCard label={copy.evidenceShort} value={report.completion.evidenceConfidence} icon={<SecurityIcon />} />
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {copy.workspace}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {report.inventory.files}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {copy.files} / {report.inventory.lines.toLocaleString()} {copy.lines}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {copy.lastScan}: {lastScannedAt ? lastScannedAt.toLocaleTimeString() : copy.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {copy.demoPathTitle}
                </Typography>
                <Chip label={copy.demoPathChip} color="primary" variant="outlined" />
              </Stack>
              <Grid container spacing={1.5}>
                {[
                  {
                    icon: <SearchIcon color="primary" />,
                    title: copy.demoCards[0].title,
                    body: copy.demoCards[0].body,
                    tab: "scan" as const,
                  },
                  {
                    icon: <PsychologyIcon sx={{ color: "#9334E6" }} />,
                    title: copy.demoCards[1].title,
                    body: copy.demoCards[1].body,
                    tab: "analogy" as const,
                  },
                  {
                    icon: <FolderZipIcon color="success" />,
                    title: copy.demoCards[2].title,
                    body: copy.demoCards[2].body,
                    tab: "launch" as const,
                  },
                ].map((item) => (
                  <Grid item xs={12} md={4} key={item.title}>
                    <Paper
                      component="button"
                      type="button"
                      elevation={0}
                      onClick={() => setSelectedTab(item.tab)}
                      aria-label={item.title}
                      sx={{
                        p: 2,
                        width: "100%",
                        height: "100%",
                        border: "1px solid #DADCE0",
                        bgcolor: "background.paper",
                        color: "text.primary",
                        cursor: "pointer",
                        textAlign: "left",
                        font: "inherit",
                        transition: "border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease",
                        "&:hover": {
                          borderColor: "#1A73E8",
                          bgcolor: "#F8FAFD",
                        },
                        "&:focus-visible": {
                          outline: "3px solid #AECBFA",
                          outlineOffset: 2,
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        {item.icon}
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.body}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {copy.remainingGaps}
              </Typography>
              <Stack spacing={1.25}>
                {topGaps.length === 0 ? (
                  <Alert severity="success">{copy.noBlockingGaps}</Alert>
                ) : (
                  topGaps.map((gap) => (
                    <Alert key={`${gap.area}-${gap.gap}`} severity="warning" variant="outlined">
                      <strong>{gap.area}:</strong> {gap.gap}
                    </Alert>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
        <AreaTable copy={copy} report={report} openEvidence={openEvidence} />
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {copy.nextAction}
              </Typography>
              <List disablePadding>
                {nextActions.map((item, index) => (
                  <ListItem key={`${item.area}-${item.action}`} disableGutters alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <Chip label={index + 1} size="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={item.action} secondary={item.area} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`${copy.tests}: ${qaArea?.status || copy.missing}`} color={qaArea?.status === "verified" ? "success" : "warning"} />
                <Chip label={`${copy.cloud}: ${cloudArea?.status || copy.missing}`} color={cloudArea?.status === "verified" ? "success" : "warning"} />
                <Chip label={`Git: ${report.git.hasCommits ? copy.hasCommits : copy.noCommits}`} color={report.git.hasCommits ? "success" : "warning"} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

function ScoreCard({ label, value, icon }: { label: string; value: number; icon: React.ReactElement }) {
  return (
    <Grid item xs={12} sm={4} md={3}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="overline" color="text.secondary">
              {label}
            </Typography>
            {icon}
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {value}%
          </Typography>
          <LinearProgress variant="determinate" value={value} color={scoreColor(value)} sx={{ height: 8, borderRadius: 4 }} />
        </CardContent>
      </Card>
    </Grid>
  );
}

function ProjectScanPanel({
  copy,
  report,
  previousReport,
  lastScanDurationMs,
  runtimeMetrics,
  openEvidence,
}: {
  copy: typeof localeCopy.en;
  report: ScanReport;
  previousReport: ScanReport | null;
  lastScanDurationMs: number | null;
  runtimeMetrics: RuntimeMetrics;
  openEvidence: (title: string, evidence: string[]) => void;
}) {
  const stackRows = [
    [copy.projectScan.stackRows.frontend, report.detectedStack.frontend],
    [copy.projectScan.stackRows.backend, report.detectedStack.backend],
    [copy.projectScan.stackRows.network, report.detectedStack.network],
    [copy.projectScan.stackRows.database, report.detectedStack.database],
    [copy.projectScan.stackRows.data, report.detectedStack.data],
    [copy.projectScan.stackRows.deploy, report.detectedStack.deploy],
    [copy.projectScan.stackRows.tests, report.detectedStack.test],
  ];

  const largestLanguage = Math.max(...report.inventory.languages.map((language) => language.lines), 1);

  return (
    <Stack spacing={2.5}>
      <PageTitle icon={<SearchIcon color="primary" />} title={copy.projectScan.title} subtitle={copy.projectScan.subtitle} />

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} justifyContent="space-between">
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {copy.scanSource}: {report.source.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                {report.source.url || report.source.path}
              </Typography>
            </Box>
            <Button variant="outlined" startIcon={<FactCheckIcon />} onClick={() => openEvidence(copy.sourceEvidence, report.source.evidence)}>
              {copy.openEvidence}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {copy.projectScan.technologyStack}
              </Typography>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableBody>
                    {stackRows.map(([label, values]) => (
                      <TableRow key={label as string}>
                        <TableCell sx={{ width: 160, fontWeight: 700 }}>{label as string}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                            {(values as string[]).map((value) => (
                              <Chip key={value} size="small" label={value} variant="outlined" />
                            ))}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {copy.projectScan.languageMix}
              </Typography>
              <Stack spacing={1.25}>
                {report.inventory.languages.map((language) => (
                  <Box key={language.name}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {language.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {language.lines.toLocaleString()}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(language.lines / largestLanguage) * 100}
                      sx={{ height: 7, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <EngineeringMonitor
            copy={copy}
            report={report}
            previousReport={previousReport}
            lastScanDurationMs={lastScanDurationMs}
            runtimeMetrics={runtimeMetrics}
          />
        </Grid>

        <Grid item xs={12}>
          <AreaTable copy={copy} report={report} openEvidence={openEvidence} />
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {copy.projectScan.gitState}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FactLine label={copy.projectScan.repository} value={report.git.isRepository ? copy.detected : copy.missing} />
                  <FactLine label={copy.projectScan.branch} value={report.git.branch} />
                  <FactLine label={copy.projectScan.latestCommit} value={report.git.latestCommit || copy.noCommits} />
                  <FactLine label={copy.projectScan.dirtyState} value={report.git.isDirty ? `${report.git.untrackedCount} ${copy.projectScan.untrackedEntries}` : copy.clean} />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: "#F1F3F4", border: "1px solid #DADCE0", maxHeight: 220, overflow: "auto" }}>
                    <Typography component="pre" sx={{ m: 0, fontSize: 12, whiteSpace: "pre-wrap", fontFamily: "Roboto Mono, monospace" }}>
                      {report.git.evidence.join("\n\n")}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

function EngineeringMonitor({
  copy,
  report,
  previousReport,
  lastScanDurationMs,
  runtimeMetrics,
}: {
  copy: typeof localeCopy.en;
  report: ScanReport;
  previousReport: ScanReport | null;
  lastScanDurationMs: number | null;
  runtimeMetrics: RuntimeMetrics;
}) {
  const previousLanguageMap = new Map(previousReport?.inventory.languages.map((language) => [language.name, language.lines]) ?? []);
  const lineDelta = previousReport ? report.inventory.lines - previousReport.inventory.lines : null;
  const fileDelta = previousReport ? report.inventory.files - previousReport.inventory.files : null;
  const languageRows = report.inventory.languages.slice(0, 6);
  const maxLanguageLines = Math.max(...languageRows.map((language) => language.lines), 1);
  const monitorArea = getArea(report, "Engineering Monitor");
  const architectureBoundaries = [
    {
      label: copy.engineeringMonitor.boundaries.frontend.label,
      path: "apps/web",
      stack: listText(report.detectedStack.frontend, copy.none),
      boundary: copy.engineeringMonitor.boundaries.frontend.boundary,
      score: getAreaCompletion(report, "Frontend UI Workspace", report.completion.product),
      icon: <DashboardIcon />,
    },
    {
      label: copy.engineeringMonitor.boundaries.backend.label,
      path: "apps/api",
      stack: listText(report.detectedStack.backend, copy.none),
      boundary: copy.engineeringMonitor.boundaries.backend.boundary,
      score: getAreaCompletion(report, "Backend API Workspace", report.completion.engineering),
      icon: <AccountTreeIcon />,
    },
    {
      label: copy.engineeringMonitor.boundaries.contracts.label,
      path: "packages/shared",
      stack: listText(report.detectedStack.data, copy.none),
      boundary: copy.engineeringMonitor.boundaries.contracts.boundary,
      score: getAreaCompletion(report, "Quality Assurance (Tests)", 70),
      icon: <SecurityIcon />,
    },
    {
      label: copy.engineeringMonitor.boundaries.runtime.label,
      path: "Cloud Run",
      stack: listText(report.detectedStack.deploy, copy.none),
      boundary: copy.engineeringMonitor.boundaries.runtime.boundary,
      score: getAreaCompletion(report, "Cloud Run Readiness", 50),
      icon: <CloudUploadIcon />,
    },
  ];
  const performanceRows = [
    {
      label: copy.engineeringMonitor.performanceRows.scanApiLatency.label,
      value: formatMs(lastScanDurationMs, copy.pending),
      target: copy.engineeringMonitor.performanceRows.scanApiLatency.target,
      tone: metricTone(lastScanDurationMs, 250, 1000),
    },
    {
      label: copy.engineeringMonitor.performanceRows.appLoad.label,
      value: formatMs(runtimeMetrics.appLoadMs, copy.pending),
      target: copy.engineeringMonitor.performanceRows.appLoad.target,
      tone: metricTone(runtimeMetrics.appLoadMs, 1200, 2500),
    },
    {
      label: copy.engineeringMonitor.performanceRows.domReady.label,
      value: formatMs(runtimeMetrics.domContentLoadedMs, copy.pending),
      target: copy.engineeringMonitor.performanceRows.domReady.target,
      tone: metricTone(runtimeMetrics.domContentLoadedMs, 800, 1600),
    },
    {
      label: copy.engineeringMonitor.performanceRows.jsBundle.label,
      value: formatKb(runtimeMetrics.jsKb, copy.pending),
      target: copy.engineeringMonitor.performanceRows.jsBundle.target,
      tone: metricTone(runtimeMetrics.jsKb, 500, 900),
    },
  ];

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <TimelineIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {copy.engineeringMonitor.title}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {copy.engineeringMonitor.subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={previousReport ? copy.engineeringMonitor.deltaActive : copy.engineeringMonitor.baselinePending} color={previousReport ? "success" : "warning"} variant="outlined" />
            <Chip label={`${copy.score} ${monitorArea?.score ?? report.completion.engineering}%`} color={scoreColor(monitorArea?.score ?? report.completion.engineering)} />
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={4}>
            <Box sx={{ height: "100%", border: "1px solid #DADCE0", borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                {copy.engineeringMonitor.codeGrowth}
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <MetricTile copy={copy} label={copy.engineeringMonitor.labels.lines} value={report.inventory.lines.toLocaleString()} delta={lineDelta} />
                </Grid>
                <Grid item xs={6}>
                  <MetricTile copy={copy} label={copy.engineeringMonitor.labels.files} value={report.inventory.files.toLocaleString()} delta={fileDelta} />
                </Grid>
              </Grid>
              <TrendSlots copy={copy} label={copy.engineeringMonitor.labels.lineTrend} previous={previousReport?.inventory.lines ?? null} current={report.inventory.lines} />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
                {copy.engineeringMonitor.firstScanNote}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box sx={{ height: "100%", border: "1px solid #DADCE0", borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                {copy.engineeringMonitor.languageGrowth}
              </Typography>
              <Stack spacing={1.1}>
                {languageRows.map((language) => {
                  const previousLines = previousLanguageMap.get(language.name);
                  const delta = previousLines === undefined ? null : language.lines - previousLines;
                  return (
                    <Box key={language.name}>
                      <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.4 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {language.name}
                        </Typography>
                        <Typography variant="caption" color={delta === null ? "text.secondary" : delta > 0 ? "warning.main" : "success.main"}>
                          {delta === null ? copy.engineeringMonitor.labels.baseline : formatSigned(delta)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(language.lines / maxLanguageLines) * 100}
                        sx={{ height: 6, borderRadius: 4, bgcolor: "#E8EAED" }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box sx={{ height: "100%", border: "1px solid #DADCE0", borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                {copy.engineeringMonitor.performance}
              </Typography>
              <Stack spacing={1}>
                {performanceRows.map((row) => (
                  <Box key={row.label} sx={{ borderBottom: "1px solid #F1F3F4", pb: 0.75 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {row.label}
                      </Typography>
                      <Chip size="small" label={row.value} color={row.tone} variant={row.tone === "success" ? "filled" : "outlined"} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {row.target}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                {copy.engineeringMonitor.resourceEntries}: {runtimeMetrics.resourceCount}. {copy.engineeringMonitor.buildOutputNote}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ border: "1px solid #DADCE0", borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                {copy.engineeringMonitor.architectureWatch}
              </Typography>
              <Grid container spacing={1.5}>
                {architectureBoundaries.map((boundary) => (
                  <Grid item xs={12} md={6} xl={3} key={boundary.label}>
                    <Box sx={{ height: "100%", border: "1px solid #E8EAED", borderRadius: 2, p: 1.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        {boundary.icon}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {boundary.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                            {boundary.path}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", minHeight: 34 }}>
                        {boundary.boundary}
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block", mt: 1, overflowWrap: "anywhere" }}>
                        {boundary.stack}
                      </Typography>
                      <LinearProgress variant="determinate" value={boundary.score} color={scoreColor(boundary.score)} sx={{ mt: 1, height: 6, borderRadius: 4 }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function MetricTile({ copy, label, value, delta }: { copy: typeof localeCopy.en; label: string; value: string; delta: number | null }) {
  return (
    <Box sx={{ border: "1px solid #E8EAED", borderRadius: 2, p: 1.25 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
      <Typography variant="caption" color={delta === null ? "text.secondary" : delta > 0 ? "warning.main" : "success.main"}>
        {delta === null ? copy.engineeringMonitor.labels.baselinePending : `${formatSigned(delta)} ${copy.engineeringMonitor.labels.sinceLastScan}`}
      </Typography>
    </Box>
  );
}

function TrendSlots({ copy, label, previous, current }: { copy: typeof localeCopy.en; label: string; previous: number | null; current: number }) {
  const slots = [
    { label: copy.engineeringMonitor.labels.baseline, value: previous ?? current, state: previous === null ? copy.engineeringMonitor.labels.setNow : copy.engineeringMonitor.labels.actual },
    { label: copy.engineeringMonitor.labels.current, value: current, state: copy.engineeringMonitor.labels.actual },
    { label: copy.engineeringMonitor.labels.nextScan, value: null, state: copy.engineeringMonitor.labels.pending },
  ];
  const maxValue = Math.max(current, previous ?? current, 1);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, alignItems: "end", height: 92, mt: 0.5 }}>
        {slots.map((slot) => (
          <Box key={slot.label} sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 0, height: "100%" }}>
            <Box
              sx={{
                height: slot.value === null ? 18 : `${Math.max(18, (slot.value / maxValue) * 72)}px`,
                borderRadius: 1,
                border: slot.value === null ? "1px dashed #BDC1C6" : "none",
                bgcolor: slot.value === null ? "transparent" : slot.label === copy.engineeringMonitor.labels.current ? "#1A73E8" : "#D2E3FC",
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.5, fontSize: 11, color: "text.secondary" }}>
              {slot.label}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: 10, color: "text.secondary" }}>
              {slot.state}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function AreaTable({
  copy,
  report,
  openEvidence,
}: {
  copy: typeof localeCopy.en;
  report: ScanReport;
  openEvidence: (title: string, evidence: string[]) => void;
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {copy.areaTable.title}
        </Typography>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>{copy.areaTable.area}</TableCell>
                <TableCell>{copy.areaTable.status}</TableCell>
                <TableCell>{copy.areaTable.progress}</TableCell>
                <TableCell>{copy.areaTable.nextAction}</TableCell>
                <TableCell align="right">{copy.areaTable.evidence}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.areas.map((area) => (
                <TableRow key={area.name}>
                  <TableCell sx={{ fontWeight: 700 }}>{area.name}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {statusIcon(area.status)}
                      <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                        {area.status}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ minWidth: 160 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LinearProgress variant="determinate" value={area.score} color={scoreColor(area.score)} sx={{ width: 96, height: 7, borderRadius: 4 }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {area.score}%
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {area.nextActions[0] || copy.areaTable.monitor}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<FactCheckIcon />} onClick={() => openEvidence(area.name, area.evidence)}>
                      {copy.areaTable.open}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function AnalogyPanel({
  copy,
  report,
  identity,
  analogyTheme,
  analogyResponse,
  analogyView,
  loadingAnalogy,
  analogyError,
  mappings,
  setIdentity,
  setAnalogyTheme,
  setAnalogyView,
  generate,
  copyText,
}: {
  copy: typeof localeCopy.en;
  report: ScanReport;
  identity: Identity;
  analogyTheme: AnalogyStyle;
  analogyResponse: AnalogyResponse | null;
  analogyView: number;
  loadingAnalogy: boolean;
  analogyError: string;
  mappings: Array<{ term: string; module: string; analogy: string; evidence: string }>;
  setIdentity: (identity: Identity) => void;
  setAnalogyTheme: (theme: AnalogyStyle) => void;
  setAnalogyView: (view: number) => void;
  generate: () => void;
  copyText: (value: string, message?: string) => Promise<void>;
}) {
  return (
    <Stack spacing={2.5}>
      <PageTitle icon={<PsychologyIcon sx={{ color: "#9334E6" }} />} title={copy.analogyUi.title} subtitle={copy.analogyUi.subtitle} />

      {analogyError && <Alert severity="error">{analogyError}</Alert>}

      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="end">
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                {copy.analogyUi.userProfession}
              </Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={identity}
                onChange={(_, value) => value && setIdentity(value as Identity)}
                aria-label={copy.analogyUi.userProfession}
              >
                {Object.entries(copy.identities).map(([value, label]) => (
                  <ToggleButton key={value} value={value} sx={{ minHeight: 40 }}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                {copy.analogyUi.basicObject}
              </Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={analogyTheme}
                onChange={(_, value) => value && setAnalogyTheme(value as AnalogyStyle)}
                aria-label={copy.analogyUi.basicObject}
                sx={{
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                  "& .MuiToggleButton-root": {
                    flex: "1 1 96px",
                    minHeight: 40,
                  },
                }}
              >
                {Object.entries(copy.analogies).map(([value, label]) => (
                  <ToggleButton key={value} value={value}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={loadingAnalogy ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={generate}
                disabled={loadingAnalogy}
              >
                {copy.analogyUi.generateFromEvidence}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <AnalogyBlueprint report={report} identity={identity} analogyTheme={analogyTheme} copy={copy} />

      {analogyResponse && (
        <AnalogyImageCard
          copy={copy}
          report={report}
          identity={identity}
          analogyTheme={analogyTheme}
          copyText={copyText}
        />
      )}

      {!analogyResponse ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: "center", border: "1px dashed #DADCE0" }}>
          <AutoAwesomeIcon sx={{ fontSize: 44, color: "#9334E6", mb: 1 }} />
          <Typography>{copy.noAnalogy}</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={7}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" sx={{ mb: 2 }}>
                  <Tabs value={analogyView} onChange={(_, value) => setAnalogyView(value)}>
                    <Tab label={copy.generatedExplanation} />
                    <Tab label={copy.moduleMap} />
                    <Tab label={copy.diagramSource} />
                  </Tabs>
                  <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => void copyText(analogyResponse.explanation)}>
                    {copy.copyExplanation}
                  </Button>
                </Stack>

                {analogyView === 0 && (
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>
                    {analogyResponse.explanation}
                  </Typography>
                )}

                {analogyView === 1 && (
                  <Stack spacing={1.5}>
                    {mappings.map((mapping) => (
                      <Paper key={mapping.term} elevation={0} sx={{ p: 2, border: "1px solid #DADCE0" }}>
                        <Grid container spacing={1.5} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <Chip label={mapping.term} color="primary" variant="outlined" />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2" sx={{ fontFamily: "Roboto Mono, monospace" }}>
                              {mapping.module}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="body2">{mapping.analogy}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                              {mapping.evidence}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                )}

                {analogyView === 2 && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">{copy.analogyUi.mermaid}</Typography>
                      <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => void copyText(analogyResponse.diagramCode)}>
                        {copy.copyDiagram}
                      </Button>
                    </Stack>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: "#202124", color: "#D7E8FF", overflow: "auto" }}>
                      <Typography component="pre" sx={{ m: 0, fontSize: 12, whiteSpace: "pre-wrap", fontFamily: "Roboto Mono, monospace" }}>
                        {analogyResponse.diagramCode}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {copy.analogyUi.vocabularyTitle}
                </Typography>
                <TableContainer sx={{ maxHeight: 560 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>{copy.analogyUi.term}</TableCell>
                        <TableCell>{copy.analogyUi.job}</TableCell>
                        <TableCell>{copy.analogyUi.evidenceLabel}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analogyResponse.vocabulary.map((item) => (
                        <TableRow key={item.term}>
                          <TableCell sx={{ fontWeight: 700 }}>{item.term}</TableCell>
                          <TableCell>{item.job}</TableCell>
                          <TableCell>
                            <Typography variant="caption">{item.evidence}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  {copy.analogyUi.source}: {report.inventory.files} {copy.files}, {report.inventory.lines.toLocaleString()} {copy.lines}, {copy.projectScan.branch} {report.git.branch}.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}

function AnalogyImageCard({
  copy,
  report,
  identity,
  analogyTheme,
  copyText,
}: {
  copy: typeof localeCopy.en;
  report: ScanReport;
  identity: Identity;
  analogyTheme: AnalogyStyle;
  copyText: (value: string, message?: string) => Promise<void>;
}) {
  const poster = buildAnalogyPoster(report, identity, analogyTheme, copy);
  const svgMarkup = buildAnalogyPosterSvg(poster);

  function downloadSvg() {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${poster.object.toLowerCase().replace(/[^a-z0-9]+/gi, "-") || "analogy"}-spec-compass.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {copy.analogyImage}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {copy.imageHint}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => void copyText(svgMarkup, copy.copiedImageSvg)}>
              {copy.copyImageSvg}
            </Button>
            <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} onClick={downloadSvg}>
              {copy.downloadSvg}
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ overflowX: "auto", border: "1px solid #DADCE0", borderRadius: 2, bgcolor: "#F8FAFD" }}>
          <Box
            aria-label={copy.analogyImage}
            sx={{
              minWidth: 760,
              "& svg": {
                display: "block",
                width: "100%",
                height: "auto",
              },
            }}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          <Chip size="small" label={`${copy.imageEvidence}: ${report.source.label}`} variant="outlined" />
          <Chip size="small" label={poster.stats} variant="outlined" />
          <Chip size="small" label={`${copy.analogies[analogyTheme]} / ${copy.identities[identity]}`} color="secondary" variant="outlined" />
        </Stack>
      </CardContent>
    </Card>
  );
}

function AnalogyBlueprint({
  report,
  identity,
  analogyTheme,
  copy,
}: {
  report: ScanReport;
  identity: Identity;
  analogyTheme: AnalogyStyle;
  copy: typeof localeCopy.en;
}) {
  const profile = getMetaphorProfile(analogyTheme, copy);
  const layers = buildAnalogyLayers(report, analogyTheme, copy);
  const architecturePath = "apps/web -> apps/api -> packages/shared";
  const topLanguage = report.inventory.languages[0]?.name || "TypeScript";

  const explanationBlocks = [
    {
      label: copy.blueprint.framework.label,
      value: `React + MUI / Fastify`,
      analogy: `${profile.interface} / ${profile.core}`,
      detail: copy.blueprint.framework.detail,
    },
    {
      label: copy.blueprint.architecture.label,
      value: architecturePath,
      analogy: profile.architecture,
      detail: copy.blueprint.architecture.detail,
    },
    {
      label: copy.blueprint.language.label,
      value: topLanguage,
      analogy: profile.language,
      detail: copy.blueprint.language.detail,
    },
    {
      label: copy.blueprint.tools.label,
      value: `${listText(report.detectedStack.test, copy.none)} / Git / Cloud Run`,
      analogy: `${profile.tools} / ${profile.deploy}`,
      detail: copy.blueprint.tools.detail,
    },
  ];

  return (
    <Box sx={{ border: "1px solid #DADCE0", borderRadius: 2, bgcolor: "#FFFFFF", overflow: "hidden" }}>
      <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2, borderBottom: "1px solid #E8EAED", bgcolor: "#F8FAFD" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {copy.blueprint.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {copy.blueprint.subtitle.replace("{{identity}}", copy.identities[identity])}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={copy.analogies[analogyTheme]} color="secondary" variant="outlined" />
            <Chip label={`${report.inventory.files.toLocaleString()} ${copy.files}`} variant="outlined" />
            <Chip label={`${report.inventory.lines.toLocaleString()} ${copy.lines}`} variant="outlined" />
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={4}>
            <Box
              sx={{
                height: "100%",
                minHeight: 320,
                border: "1px solid #DADCE0",
                borderRadius: 2,
                bgcolor: "#F6F8FC",
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: "#EADDFF", color: "#681DA8", display: "grid", placeItems: "center" }}>
                    <PsychologyIcon />
                  </Box>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      {profile.system}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {profile.core}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  {copy.blueprint.appCore}
                </Typography>
                <Alert severity="info" variant="outlined">
                  {copy.blueprint.exampleMapping}: {profile.sample}
                </Alert>
              </Stack>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {copy.blueprint.currentEvidence}: {hasGeminiGap(report) ? copy.blueprint.geminiFallback : copy.blueprint.geminiReady}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
              {layers.map((layer) => (
                <Box key={layer.label} sx={{ border: "1px solid #DADCE0", borderRadius: 2, p: 1.5, bgcolor: "#FFFFFF" }}>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <Box sx={{ color: layer.color, mt: 0.25 }}>{layer.icon}</Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {layer.label}
                        </Typography>
                        <Chip label={`${Math.round(layer.completion)}%`} size="small" sx={{ bgcolor: "#F1F3F4" }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere" }}>
                        {layer.real}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.55 }}>
                        <strong>{copy.analogyUi.analogy}:</strong> {layer.metaphor}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.75, lineHeight: 1.55 }}>
                        {layer.explains}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, Math.min(100, layer.completion))}
                        sx={{ my: 1.25, height: 6, borderRadius: 4, bgcolor: "#E8EAED", "& .MuiLinearProgress-bar": { bgcolor: layer.color } }}
                      />
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 800 }}>
                            {copy.analogyUi.benefit}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block" }}>
                            {layer.benefit}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="warning.main" sx={{ fontWeight: 800 }}>
                            {copy.analogyUi.limit}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block" }}>
                            {layer.limitation}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, overflowWrap: "anywhere" }}>
                        {copy.analogyUi.evidenceLabel}: {layer.evidence}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        <Grid container spacing={1.5}>
          {explanationBlocks.map((block) => (
            <Grid item xs={12} md={6} xl={3} key={block.label}>
              <Box sx={{ height: "100%", border: "1px solid #E8EAED", borderRadius: 2, p: 1.5, bgcolor: "#FFFFFF" }}>
                <Typography variant="overline" color="text.secondary">
                  {block.label}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>
                  {block.value}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.75 }}>
                  {block.analogy}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, lineHeight: 1.55 }}>
                  {block.detail}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

function LaunchPanel({
  copy,
  report,
  nextActions,
  copyText,
}: {
  copy: typeof localeCopy.en;
  report: ScanReport;
  nextActions: Array<{ area: string; action: string }>;
  copyText: (value: string, message?: string) => Promise<void>;
}) {
  const deployment = report.deployment;

  return (
    <Stack spacing={2.5}>
      <PageTitle icon={<FolderZipIcon color="success" />} title={copy.launchTitle} subtitle={copy.launchHint} />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {copy.launchSummary}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {copy.currentBranch}: {report.git.branch}; {copy.gitBaseline}: {report.git.hasCommits ? copy.present : copy.missing}.
                  </Typography>
                </Box>
                <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={() => void copyText(report.launchPacket)}>
                  {copy.copyPacket}
                </Button>
              </Stack>
              <TextField
                fullWidth
                multiline
                minRows={18}
                value={report.launchPacket}
                InputProps={{
                  readOnly: true,
                  sx: { fontFamily: "Roboto Mono, monospace", fontSize: 13, alignItems: "flex-start" },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {copy.submissionEvidence}
                </Typography>
                <Alert severity={deployment.verified ? "success" : "warning"} sx={{ mb: 2 }}>
                  {deployment.verified ? copy.submissionEvidenceReady : copy.submissionEvidenceIncomplete}
                </Alert>
                <FactLine label={copy.publicUrl} value={deployment.url || copy.notSet} />
                <FactLine label={copy.service} value={deployment.service || copy.notDetected} />
                <FactLine label={copy.revision} value={deployment.revision || copy.notDetected} />
                <FactLine label={copy.scanSource} value={report.source.url || report.source.label} />
                <FactLine label={copy.deployChecks.hostedSourceSnapshot} value={deployment.sourcePath} />
                {report.source.warnings.length > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {copy.sourceWarnings}
                    </Typography>
                    <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                      {report.source.warnings.map((warning) => (
                        <Typography component="li" variant="body2" key={warning}>
                          {warning}
                        </Typography>
                      ))}
                    </Stack>
                  </Alert>
                )}
                {deployment.url && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => void copyText(deployment.url || "")}
                    sx={{ mt: 1 }}
                  >
                    {copy.copyUrl}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {copy.guardrails}
                </Typography>
                <Stack spacing={1}>
                  {copy.guardrailItems.map((item) => (
                    <Alert key={item} severity="info" variant="outlined">
                      {item}
                    </Alert>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {copy.nextRoundTasks}
                </Typography>
                <List disablePadding>
                  {nextActions.map((item, index) => (
                    <ListItem key={`${item.area}-${item.action}`} disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Chip label={index + 1} size="small" />
                      </ListItemIcon>
                      <ListItemText primary={item.action} secondary={item.area} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function AgentsPanel({ copy, report }: { copy: typeof localeCopy.en; report: ScanReport }) {
  return (
    <Stack spacing={2.5}>
      <PageTitle icon={<AccountTreeIcon color="primary" />} title={copy.agents.title} subtitle={copy.agents.subtitle} />
      <Grid container spacing={2}>
        {report.agentOperatingModel.agents.map((agent) => (
          <Grid item xs={12} md={6} xl={4} key={agent.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {agent.label}
                  </Typography>
                  <Chip label={agent.id.toUpperCase()} size="small" />
                </Stack>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  {agent.role}
                </Typography>
                <FactLine label={copy.agents.tools} value={listText(agent.allowedTools, copy.none)} />
                <FactLine label={copy.agents.capabilities} value={listText(agent.preferredCapabilities, copy.none)} />
                <FactLine label={copy.agents.evidence} value={listText(agent.evidenceRequired, copy.none)} />
                <Alert severity="warning" variant="outlined" sx={{ mt: 1.5 }}>
                  {agent.stopCondition}
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

function DeployPanel({
  copy,
  report,
  geminiConfigured,
  translationReviewed,
  isDeployed,
}: {
  copy: typeof localeCopy.en;
  report: ScanReport;
  geminiConfigured: boolean;
  translationReviewed: boolean;
  isDeployed: boolean;
}) {
  const cloudArea = getArea(report, "Cloud Run Readiness");
  const deployment = report.deployment;
  const checks = [
    { label: copy.deployChecks.fastifyPort, done: true, detail: copy.deployChecks.fastifyPortDetail },
    { label: copy.deployChecks.viteServed, done: true, detail: copy.deployChecks.viteServedDetail },
    { label: copy.deployChecks.dockerfilePresent, done: report.detectedStack.deploy.includes("Docker"), detail: listText(report.detectedStack.deploy, copy.none) },
    { label: copy.deployChecks.geminiConfigured, done: geminiConfigured, detail: geminiConfigured ? copy.deployChecks.geminiConfiguredDetail : copy.deployChecks.fallbackMode },
    { label: copy.deployChecks.translationReviewed, done: translationReviewed, detail: translationReviewed ? copy.deployChecks.translationReviewedDetail : copy.deployChecks.translationFallback },
    { label: copy.deployChecks.liveCloudRunUrl, done: deployment.verified, detail: deployment.url || copy.pending },
    { label: copy.deployChecks.cloudRunRevision, done: Boolean(deployment.revision), detail: deployment.revision || copy.notDetected },
    {
      label: copy.deployChecks.cloudSafeInput,
      done: report.source.type === "githubUrl" || deployment.sourcePath.includes("/workspace-source"),
      detail: report.source.type === "githubUrl" ? `${report.source.label}: ${report.source.url}` : deployment.sourcePath,
    },
  ];

  return (
    <Stack spacing={2.5}>
      <PageTitle icon={<CloudUploadIcon color="primary" />} title={copy.deployPanelTitle} subtitle={copy.deployTruth} />
      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {copy.verificationChecklist}
              </Typography>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 680 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{copy.check}</TableCell>
                      <TableCell>{copy.status}</TableCell>
                      <TableCell>{copy.runEvidence}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {checks.map((check) => (
                      <TableRow key={check.label}>
                        <TableCell sx={{ fontWeight: 700 }}>{check.label}</TableCell>
                        <TableCell>
                          <Chip
                            icon={check.done ? <CheckCircleIcon /> : <WarningIcon />}
                            label={check.done ? copy.verified : copy.pending}
                            color={check.done ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{check.detail}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {copy.cloudRunReadiness}
              </Typography>
              <Alert severity={deployment.verified ? "success" : "warning"} sx={{ mb: 2 }}>
                {deployment.verified ? copy.liveServiceVerified : copy.cloudPartial}
              </Alert>
              <FactLine label={copy.areaScore} value={`${cloudArea?.score ?? 0}%`} />
              <FactLine label={copy.serviceUrl} value={deployment.url || copy.notSet} />
              <FactLine label={copy.service} value={deployment.service || copy.notDetected} />
              <FactLine label={copy.revision} value={deployment.revision || copy.notDetected} />
              <FactLine label={copy.region} value={deployment.region || copy.notSet} />
              <FactLine label={copy.scanSource} value={deployment.sourcePath} />
              <FactLine label={copy.deployArtifacts} value={listText(report.detectedStack.deploy, copy.none)} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                {copy.runEvidence}
              </Typography>
              <List dense disablePadding sx={{ mb: 2 }}>
                {deployment.evidence.map((item) => (
                  <ListItem key={item} disableGutters alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 30, mt: 0.25 }}>
                      <FactCheckIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="caption" sx={{ fontFamily: "Roboto Mono, monospace", overflowWrap: "anywhere" }}>
                          {item}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="body2" color="text.secondary">
                {copy.cloudScannerNote}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

function PageTitle({ icon, title, subtitle }: { icon: React.ReactElement; title: string; subtitle: string }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ minWidth: 0, maxWidth: "100%" }}>
      {icon}
      <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{subtitle}</Typography>
      </Box>
    </Stack>
  );
}

function FactLine({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-word" }}>
        {value}
      </Typography>
    </Box>
  );
}
