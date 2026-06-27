# UI Layout Brief

Use this brief when building the first Spec Compass UI.

## Product Design Direction

Spec Compass should feel closer to a Google Cloud Console / Cloud Hub workspace than a chat app or prompt playground.

Reason:

- The product is about project supervision, evidence, deployment readiness, and action.
- Google Cloud Console is a better mental model for resource status, risks, actions, and deployment.
- Google AI Studio is useful inspiration for Gemini-powered creation, but the main UI should not look like a prompt-only builder.

Use Material 3 structure:

- Desktop and tablet: left navigation rail.
- Mobile: compact top tabs or bottom navigation.
- Main content: dense but calm dashboard.
- Secondary content: right-side evidence/action panel or drawer.

Avoid:

- Landing-page hero sections.
- Decorative gradients or oversized marketing copy.
- Chat-first layout as the primary screen.
- Cards inside cards.
- Mock data presented as real completion.

## Required Screen Regions

### 1. Top App Bar

Purpose: identify the current project and expose primary actions.

Required elements:

- Product name: `Spec Compass`.
- Project selector.
- Language switcher: English, 日本語, 简体中文.
- Source input summary: local path, zip, GitHub repo, or Cloud Storage object.
- Primary action: `Run scan`.
- Secondary action: `Generate explanation`.
- Deployment readiness chip: local only, Cloud Run ready, deployed, or blocked.
- Gemini status chip: configured, fallback, or missing key.
- Translation status chip: reviewed, unverified, or missing locale.

### 2. Left Navigation Rail

Use 5-6 destinations:

- Overview.
- Analogy.
- Evidence.
- Launch Packet.
- AI Team.
- Deploy.

Each destination should map to a real section on the page. Do not create dead navigation.

### 3. Project Scan / 项目体检

This is the first viewport and the judging anchor.

Required modules:

- Technology stack.
- Total code size.
- Frameworks.
- Frontend, backend, network, database, deployment, and test inventory.
- Git status: repository, branch, dirty/untracked state, latest commit or no-commit-yet state.
- Three progress bars: product completion, engineering completion, evidence confidence.
- Risk red lights for blocked, missing, or weak areas.
- Evidence buttons or drawers for every major claim.
- Biggest risk.
- Next recommended action.
- Source and last scan time.
- Language coverage: English, Japanese, Chinese.
- Programmer-facing Engineering Monitor:
  - Architecture boundary cards for frontend, backend, shared contracts, and runtime.
  - Stack/framework drift watch.
  - Language mix and line/file growth since the previous scan.
  - Performance baseline for scan API latency, app load, DOM ready, and JS bundle size.
  - Benchmark placeholders must be labeled as baseline/pending until real historical data exists.
- Event readiness checklist:
  - Real scanner evidence.
  - Gemini API feature.
  - Cloud Run or Agent Runtime URL.
  - Multilingual UI with Gemini-reviewed translations.
  - Verification evidence.

### 4. Analogy View / 类比解释

Purpose: help non-technical users understand the project.

Required shape:

```text
Claim -> analogy -> evidence -> benefit -> limitation -> next action
```

Controls:

- Profession preset selector: boss, designer, sales.
- Basic object selector: bicycle, house, plant, human body.
- Generate button.
- Generate image/diagram button.
- Copy explanation button.

The analogy must cite measured evidence from the scanner report. Every analogy module must map back to a real engineering module or scanner finding.

Add a vocabulary translation layer inside or next to the analogy panel. This should explain technical terms that the scanner detects, especially framework, programming language, frontend, backend, API, deployment, tests, package manager, and cloud services.

Use this display shape:

```text
Technical term -> plain-language job -> analogy role -> evidence
```

Example rows:

| Technical term | Plain-language job | Analogy role | Evidence |
|---|---|---|---|
| Programming language | The language the builders use to write the project | Construction language / growth instructions / DNA-like instructions | Detected file extensions and package files |
| TypeScript | JavaScript with stricter labels so mistakes are caught earlier | Labeled blueprint notes | `.ts`, `.tsx`, `tsconfig.json` |
| Framework | A prebuilt way to organize common work | Building method / bicycle frame / plant growth structure | Detected dependencies |
| React | Builds the interactive screen users touch | Front desk and room layout system | `react` dependency, `.tsx` files |
| Material UI | Ready-made interface components | Interior design kit and furniture catalog | `@mui/*` dependencies |
| Backend | The service layer users do not directly see | Utility room, roots, chain drive, or bloodstream | API/server files |
| Fastify | The backend's request handler | Service counter that receives orders and returns results | `fastify` dependency |
| API | The contract between UI and backend | Waitstaff, wiring, or delivery lane | `/api/*` routes |
| Zod/schema | Checks that data has the right shape | Quality inspector / checklist | `zod` dependency or schema files |
| Gemini API | Interprets evidence into useful explanation | Translator, advisor, or project narrator | Gemini endpoint and env config |
| Cloud Run | Hosts the app as a reachable web service | Public storefront / delivery address | Deploy config and URL |
| Tests | Prove important behavior still works | Safety inspection / brake test | Test files and command output |
| Git | Tracks project history | Project ledger / construction diary | `.git` and commit status |

Interaction requirements:

- Let the user switch between `Plain`, `Technical`, and `Analogy` views.
- Let the user choose a profession preset: boss, designer, or sales.
- Let the user choose a basic object: bicycle, house, plant, or human body.
- Let the user switch output language between English, Japanese, and Chinese.
- Keep definitions short. One or two sentences per term is enough.
- Each explanation must point back to evidence. If evidence is missing, show `Unverified` instead of guessing.
- Do not hide the technical term. The goal is to teach the user the term gently, not remove it.

## Multilingual UX

Use a real localization library, not manual `if language then text` branches.

Required library:

- `i18next`
- `react-i18next`

Required languages:

- English: `en`
- Japanese: `ja`
- Chinese: `zh-CN`

Required UI behavior:

- Language switcher in the top app bar.
- Persist selected language in local storage.
- Default to browser language when supported, otherwise English.
- All primary UI text should come from translation keys.
- Avoid string concatenation for translated sentences; use complete translated phrases with interpolation.
- Use locale-aware date and number formatting for scan time, counts, and percentages where practical.

Gemini precision translation requirement:

- UI copy, analogy explanations, vocabulary definitions, Launch Packet labels, and deploy-readiness messages must go through a Gemini precision translation pass for English, Japanese, and Chinese before the multilingual build is called event-ready.
- The translation pass must use a glossary so technical terms stay stable across languages.
- Translation status must be visible in the UI or readiness checklist.
- If Gemini translation has not run, label the language as `Unverified`, not complete.

Suggested locale resource shape:

```text
apps/web/src/locales/en/common.json
apps/web/src/locales/ja/common.json
apps/web/src/locales/zh-CN/common.json
apps/web/src/locales/glossary.json
```

Suggested glossary fields:

```json
{
  "framework": {
    "en": "framework",
    "ja": "フレームワーク",
    "zh-CN": "框架",
    "note": "A reusable structure for building software. Do not replace with brand names."
  },
  "launchPacket": {
    "en": "Launch Packet",
    "ja": "ローンチパケット",
    "zh-CN": "启动包",
    "note": "Copyable instruction packet for coding agents."
  }
}
```

### 5. Evidence Workspace

Purpose: make the product credible to engineers.

Required modules:

- File count and language mix.
- Framework/package signals.
- Key directories.
- Test evidence.
- Deploy evidence.
- Documentation evidence.
- Agent-rule evidence.
- Raw JSON drawer.

Each claim should have an evidence row, source path, command, or scanner field.

### 6. Launch Packet / 开工包

Purpose: produce a copyable instruction packet for Antigravity, Gemini, or another coding agent.

Required modules:

- Gemini / Antigravity start prompt.
- Supervision rules and stack boundaries.
- Next-round task list.
- Forbidden drift items.
- Completion standards.
- Required verification.
- Current evidence-backed status.
- Current Git state.
- One-click copy button.

Do not generate a Launch Packet that asks agents to change the approved stack.

### 7. AI Team Map

Purpose: show the managed-agent organization structure without building a full provider platform.

Required roles:

- Human Owner.
- Orchestrator / PM.
- Scanner.
- Architect.
- Frontend.
- Backend.
- Analogy.
- Critic.
- Release.

Show each role with:

- Responsibility.
- Preferred model capability.
- Required evidence.
- Current status.

### 8. Deploy Panel

Purpose: make event submission requirements visible.

Required modules:

- Local status.
- Cloud Run readiness.
- Agent Runtime readiness.
- Missing environment variables.
- Deployment URL field.
- Health check status.
- Verification checklist.

Cloud Run rule:

- The service must listen on `PORT`.
- The deployed version cannot scan a Mac local path.
- Cloud source input must be uploaded zip, GitHub repo, or Cloud Storage object.

## Responsive Layout

Desktop:

```text
Top app bar
Left nav rail | Main dashboard/content | Evidence/action side panel
```

Mobile:

```text
Top app bar
Status summary
Section tabs
Content panels
Evidence drawer
```

Keep text compact. Use MUI components such as `AppBar`, `NavigationRail` pattern, `Tabs`, `LinearProgress`, `Chip`, `Alert`, `Table`, `Drawer`, `Stepper`, `Timeline`, `TextField`, and `Button`.

## Visual Tone

- Google-adjacent, Material, utilitarian, confident.
- Light theme first; dark mode optional.
- Use restrained color: blue for primary action, green for verified, yellow for warning, red for blocked, neutral gray for unknown.
- Use clear density. This is an operational tool, not a portfolio site.

## Color System

Use a clean Google Cloud-adjacent light palette. Keep blue as the action color, but do not make the whole product blue.

Core tokens:

| Token | Hex | Use |
|---|---:|---|
| `background` | `#F8FAFD` | Page background |
| `surface` | `#FFFFFF` | Main panels, tables, drawers |
| `surfaceSubtle` | `#F1F3F4` | Secondary panels and section backgrounds |
| `border` | `#DADCE0` | Dividers and card outlines |
| `textPrimary` | `#202124` | Main text |
| `textSecondary` | `#5F6368` | Supporting text |
| `primary` | `#1A73E8` | Primary buttons, active nav, selected tabs |
| `primaryHover` | `#185ABC` | Button hover and active states |
| `verified` | `#188038` | Verified evidence and passing checks |
| `warning` | `#F9AB00` | Missing config, partial evidence, caution |
| `blocked` | `#D93025` | Failed checks and blocking issues |
| `insight` | `#9334E6` | Gemini-generated explanation accents only |
| `codeAccent` | `#3178C6` | TypeScript/code chips |
| `localeAccent` | `#0B57D0` | Language switcher focus and translation status |

Usage rules:

- Use `primary` for action and navigation, not for every chart or card.
- Use `verified`, `warning`, and `blocked` consistently for status.
- Use `insight` sparingly for Gemini output so generated explanation feels distinct without turning the UI purple.
- Keep progress bars semantically colored: product completion uses `primary`, engineering completion uses `codeAccent`, evidence confidence uses `verified` or `warning` depending on score.
- Keep cards and panels at 8px radius or less.
- Maintain strong contrast for chips and small status labels.
- Avoid large gradients. If a small Gemini accent is needed, use a solid `insight` chip or icon instead.
