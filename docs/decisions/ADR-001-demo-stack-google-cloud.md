# ADR-001: Use TypeScript, MUI, and Cloud Run for the First Demo

## Status

Accepted

## Date

2026-06-27

## Context

Spec Compass needs a first demo that can be built quickly, shown clearly, and supervised by AI agents without framework drift. The demo has two audiences:

- Non-technical users who need a clear dashboard, analogy view, and progress story.
- Engineers and agents who need evidence, typed contracts, and a deployable backend path.

The demo also needs to fit a Google/Gemini event setting. It should work locally first, then have a credible Google Cloud path. The event constraints require more than a local prototype: the submission should include a deployed app or website URL through Cloud Run or Agent Runtime, plus a real Google Cloud or Gemini product integration.

## Decision

Use this stack for the first runnable demo:

- Frontend: Vite + React + TypeScript.
- UI system: Material UI (MUI).
- Figma resource library: Material 3 Design Kit.
- Backend: Node.js + TypeScript + Fastify.
- Schema layer: shared TypeScript types plus Zod validation.
- Local demo: frontend and backend run locally.
- Google Cloud path: Cloud Run for the backend API; Firebase Hosting may host the frontend later.
- Event submission path: deploy through Cloud Run or Agent Runtime and submit the deployed URL.

Use Gemini for interpretation, analogy generation, structured output, and Launch Packet drafting. Use deterministic code scanners for measured facts such as file count, language mix, framework detection, tests, and deploy evidence.

For the first event-ready slice, make Gemini API a real product feature rather than only a development tool. The safest feature is evidence-grounded analogy and Launch Packet generation from scanner output.

## Alternatives Considered

### Python backend

- Pros: strong ecosystem for data processing and ML workflows.
- Cons: weaker fit for sharing schemas with a React frontend in a fast demo; easier for agents to split logic across languages too early.
- Rejected for the first demo. Python can be introduced later only for a specific scanner or data-processing need.

### Go backend

- Pros: excellent Cloud Run fit, fast, simple deployment.
- Cons: slower iteration for UI-adjacent schema work during a hackathon-style demo.
- Rejected for the first demo. It remains a good later option if the backend becomes a production service.

### Full Firebase app

- Pros: fast hosting and Google ecosystem fit.
- Cons: the project needs a scanner API and possible long-running source analysis; Cloud Run gives more control over runtime, filesystem temp space, and containerized tools.
- Rejected as the primary backend target. Firebase Hosting can still be used for the frontend.

## Consequences

- Frontend and backend can share TypeScript schemas, reducing drift between UI, API, and Launch Packet output.
- MUI implementation aligns with the Material 3 Figma resource library.
- Cloud Run can run the Node.js API as a container without committing to a specific server framework beyond Fastify.
- The local demo can scan a local folder, but the cloud version must accept uploaded zip files, GitHub repositories, or Cloud Storage objects. A deployed backend must not assume access to the user's local filesystem.
- A local-only build is useful for development but not enough for final event submission. The final demo should have a reachable Cloud Run or Agent Runtime URL.
- If Gemini API credentials or event credits are not ready, keep the Gemini-backed feature behind a clear configuration gate and label any fallback output as demo fallback, not production evidence.
- Agents must not replace the approved UI system, backend language, or deploy target unless they update the project contract and explain the trade-off.
