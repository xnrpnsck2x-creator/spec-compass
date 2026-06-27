# Spec Compass

Spec Compass turns a software project into an evidence-backed control surface for non-technical stakeholders, engineers, and AI coding agents.

It scans a repository, explains the real architecture with user-friendly analogies, and produces a copyable Launch Packet that keeps the next coding loop grounded in measured facts.

Live demo:

- https://spec-compass-g3pfpanwsq-an.a.run.app

## Core Flow

```text
Project Scan -> Analogy View -> Launch Packet -> Cloud Run evidence
```

## Features

- Project Scan: detects stack, frameworks, language mix, code size, Git state, deployment evidence, tests, risks, and next actions.
- Analogy View: explains frontend, backend, schemas, tools, model foundation, and deployment using audience/object presets such as boss + human body.
- Launch Packet: creates a structured instruction packet for Gemini, Antigravity, or another coding agent.
- Multilingual UI: English, Japanese, and Simplified Chinese.
- Gemini integration: model-backed explanation generation and translation review when Google Cloud ADC or a Gemini API key is configured.
- Cloud Run ready: one Fastify service serves both API routes and the Vite React frontend.

## Stack

- Frontend: Vite, React, TypeScript, Material UI, i18next
- Backend: Node.js, TypeScript, Fastify
- Shared contracts: Zod
- AI: Gemini API through `@google/genai`
- Deployment: Cloud Run
- Tests: Vitest

## Local Development

```sh
npm install
npm test
npm run build
npm run dev
```

Production-style local run:

```sh
npm run build
PORT=3213 npm run start
```

Then open `http://localhost:3213`.

## Environment

For Gemini-backed generation, use either Google Cloud ADC / Enterprise config:

```sh
GOOGLE_GENAI_USE_ENTERPRISE=true
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=global
```

Or use a Gemini API key:

```sh
GEMINI_API_KEY=your-key
```

Do not commit real credentials. Use `apps/api/.env.example` as the local template.

## Deploy

```sh
gcloud run deploy spec-compass \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

See `docs/deploy/cloud-run.md` for the deployment contract and verification checklist.

## Documentation

- `docs/product/spec-compass.md`
- `docs/product/ui-layout-brief.md`
- `docs/engineering/stack-boundaries.md`
- `docs/engineering/report-schema.md`
- `docs/agent/operating-model.md`
- `docs/deploy/cloud-run.md`
