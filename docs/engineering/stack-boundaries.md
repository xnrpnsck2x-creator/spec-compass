# Engineering Stack And Boundaries

This file defines the technical contract for the first runnable Spec Compass demo.

## Approved Demo Stack

Use the same language across frontend, backend, and schemas so the first demo stays easy to inspect and hard for agents to drift.

- Frontend: Vite + React + TypeScript.
- UI system: Material UI (MUI).
- Figma resource library: Material 3 Design Kit.
- Backend: Node.js + TypeScript + Fastify.
- Shared schema layer: TypeScript types plus Zod validation.
- Internationalization: i18next plus react-i18next for runtime UI localization.
- Version control: Git on `main`, with small verified commits only after explicit user approval.
- Local data source: a project folder path for the demo scanner.
- Cloud data source: uploaded zip, GitHub repository, or Cloud Storage object.
- Local runtime: local frontend and backend servers.
- Google Cloud target: Cloud Run backend API, with Firebase Hosting as an optional later frontend host.
- Event submission target: a deployed app or website URL via Cloud Run or Agent Runtime.
- Required Google integration: at least one real Google Cloud or Gemini capability in the product flow. For this demo, prefer Gemini API for analogy generation, structured interpretation, and Launch Packet drafting.

Do not use Python as the default backend for the MVP. Python can be introduced later only if a specific scanner or data-processing need justifies it.

Do not mix another major UI library into the first demo unless this contract is explicitly updated.

Do not hard-code user-facing UI copy directly in React components. All primary UI labels, section titles, statuses, explanation controls, empty states, and deploy-readiness messages must go through i18n keys.

Do not commit generated output, build artifacts, local environment files, API keys, service account files, or IDE-private settings.

## Cloud Boundary

The local demo may scan the server workspace by default or an explicit `<project-path>` supplied by the user.

A deployed Cloud Run backend cannot read files from the user's Mac. For a cloud version, use one of these inputs instead:

- Public GitHub repository URL. This is implemented as the first cloud-safe path by downloading the public GitHub zipball into a temporary scan directory.
- Uploaded zip.
- Cloud Storage object created by an upload flow.

GitHub zipball input does not include `.git` history. Treat missing branch/commit evidence as a source limitation, not a scanner failure.

Use deterministic scanners for file counts, language mix, framework detection, and test/deploy evidence. Use Gemini to interpret evidence, generate analogies, and produce the Launch Packet; do not use Gemini as the source of measured facts.

For the Gemini Tokyo event, a local-only demo is not submission-complete. The local demo is the fastest development path, but the final submission should include a deployed Cloud Run or Agent Runtime URL and a real Google integration such as Gemini API, AI Studio, Vertex AI, or Antigravity-assisted agent workflow.

## Git Boundary

The repository is already initialized with Git on `main`. The first agent should verify this instead of creating a nested repository:

```sh
git status --short --branch
git rev-parse --is-inside-work-tree
git branch --show-current
```

Git is part of the product evidence model:

- Project Scan should report whether the source is a Git repository.
- Project Scan should show current branch, clean/dirty status, untracked count, and recent commit status when commits exist.
- Project Scan should mark "no commits yet" as a real status, not an error.
- Launch Packet should include the current git state and warn agents not to overwrite unrelated changes.
- Agent work should use small verified save points, but commits require explicit user approval.

Do not run destructive Git commands such as `git reset --hard`, `git clean`, or `git checkout --` unless the user explicitly asks.

## Gemini Capability Mapping

Use Gemini where it adds product value:

- Structured output: force reports into a stable JSON schema.
- Function calling: call deterministic scanners for code counts, framework detection, tests, and deploy checks.
- Multimodal generation: produce analogy images or diagrams for non-technical users.
- Long context: read project docs and scan summaries together.
- Code execution or tool-backed checks: validate small derived facts instead of guessing.
- Antigravity or managed agents: turn the Launch Packet into a supervised coding loop.

Avoid using Gemini for facts that tools can measure directly.

Do not treat "built with Antigravity" as the only Google integration. The app itself should expose a user-visible Gemini-backed action, such as generating the analogy explanation or Launch Packet from measured scan evidence.

## Localization Boundary

The first demo must support three languages:

- English: `en`
- Japanese: `ja`
- Chinese: `zh-CN`

Use `i18next` and `react-i18next` for frontend localization. Store locale resources in a predictable folder such as:

```text
apps/web/src/locales/en/common.json
apps/web/src/locales/ja/common.json
apps/web/src/locales/zh-CN/common.json
```

Required localization surfaces:

- Top app bar, navigation, buttons, chips, alerts, and section headings.
- Overview dashboard text.
- Analogy controls and vocabulary translation layer.
- Evidence labels and status text.
- Launch Packet labels and copy actions.
- AI Team Map role labels and status text.
- Deploy panel labels and readiness messages.

Gemini translation gate:

- All event-facing English, Japanese, and Chinese copy must pass through a Gemini precision translation review before being marked ready.
- Use a shared glossary for technical terms such as framework, frontend, backend, API, scanner, evidence, Launch Packet, Gemini API, Cloud Run, Agent Runtime, TypeScript, React, MUI, Node.js, Fastify, Zod, tests, and Git.
- Do not translate code identifiers, package names, file paths, commands, environment variable names, API route names, or product names unless the glossary explicitly says to.
- Each locale file should carry a review marker or metadata field such as `translationReviewedBy: "gemini"` and `translationReviewedAt`.
- If the Gemini translation pass has not run, show translation status as `Unverified` in development notes or readiness checks. Do not claim the multilingual UI is event-ready.

## UI Library

Use Material UI (MUI) as the default UI system for the first demo.

Figma prep:

- Demo design file: https://www.figma.com/design/V1NCkbBOgQ4OwgnA02uHsV
- Figma resource library: Material 3 Design Kit.
- Code implementation library: Material UI (MUI) with Antigravity `@mui/mcp@latest`.
- Figma MCP boundary: do not rely on Figma MCP inside Antigravity for the first demo. Figma's remote MCP requires an OAuth-capable supported client, and the current Antigravity app shows `Unauthorized` with no working auth flow. Figma's local desktop MCP requires Figma Desktop, Dev Mode, and a paid Dev or Full seat; the Free-plan demo should use the Figma file as visual reference and MUI MCP as the implementation helper.

Why MUI fits:

- It matches a Google/Material mental model, which is helpful for a Gemini event.
- It has production-ready React components for dashboards, forms, tabs, drawers, progress, tables, and navigation.
- MUI X community components can cover charts, data grids, and tree views when the demo needs deeper inspection surfaces.
- The Antigravity MCP config includes `@mui/mcp`, so agents can ask for MUI-specific component guidance instead of improvising UI primitives.

Default demo surfaces:

- Overall project status: `Card`, `LinearProgress`, `Chip`, and `Alert`.
- Non-technical analogy view: `Tabs`, `Timeline`, `Stepper`, and diagram panels.
- Engineering evidence view: `DataGrid` or `Table`, `Accordion`, `Drawer`, and `TreeView`.
- Launch Packet editor: `TextField`, `Button`, `Snackbar`, and copy action controls.

## Implementation Boundaries

- The scanner is the authority for measured project facts.
- The model is the interpreter, not the source of inventory counts.
- Git status is evidence. Do not claim a clean repository, committed work, or deployment tag unless `git status` and relevant git commands verify it.
- Cloud APIs are optional only for the first local development loop. The event-ready build must include a real Google/Gemini integration and a deployed Cloud Run or Agent Runtime URL.
- Do not store provider API keys, tokens, or secrets in project docs.
- Do not claim deployment readiness unless a deploy command or runbook has been verified.
- Do not add dependencies for hypothetical later features.
