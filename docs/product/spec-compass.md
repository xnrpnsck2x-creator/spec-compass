# Spec Compass Product Spec

Spec Compass turns a software project into a shared control surface for non-technical users, engineers, and AI agents.

Core promise:

```text
Make the project understandable to humans, executable by agents, and auditable by evidence.
```

## Positioning

AI coding makes it easier to create code, but harder for teams to know whether the code still matches the original intent. Spec Compass translates project facts into two useful views:

- Non-technical view: what the project is, how complete it is, what risks exist, and what should happen next.
- Engineering view: target stack, architecture constraints, implementation evidence, drift detection, and an agent-ready work packet.

It should feel like a shared dashboard, not an outsider judging programmers.

## Target Users

- Founder or client: wants to understand whether a project is real, usable, risky, or drifting.
- Product manager: wants progress tied to concrete evidence.
- Engineer: wants architecture constraints and completion standards agents can follow.
- AI coding agent: needs a clean spec, allowed stack, forbidden drift, and verification rules.

## Core Demo Loop

```text
Project scan -> human explanation -> Launch Packet -> AI Team Map -> evidence timeline
```

## MVP Flow

### 1. Project Scan

Input:

- Local project folder, uploaded zip, or sample repo.
- Optional project intent markdown.
- Optional target stack and constraints.

Output:

- Framework and stack detection.
- Code size, file count, language mix, and key directories.
- Frontend, backend, API, data, network, deploy, tests, docs, and agent-rules inventory.
- Product completion score.
- Engineering completion score.
- Evidence confidence score.
- Risk list with evidence links.

The scan must rely on deterministic tools first. Gemini can interpret evidence, but must not invent measured facts.

### 2. Analogy View

Convert engineering facts into a user-selected profession/object analogy.

Examples:

- Bicycle: UI is handlebar/seat/brakes, backend/API is chain and cable routing, tests are repair checks, deployment is the road test.
- House: UI is rooms and exterior, backend/API is utility wiring and plumbing, schemas are building measurements, deployment is keys and move-in.
- Plant: UI is leaves and flowers, backend/API is nutrient flow, schemas are growth instructions, tests/Git are pruning and growth records.
- Human body: UI is skin and senses, backend/API is bloodstream and nerves, model foundation is heart, tests/Git are immune checks and medical record.

Required shape:

```text
Claim -> analogy -> evidence -> benefit -> limitation -> next action
```

Bad:

```text
The backend is weak.
```

Good:

```text
Backend is like a house utility room with power available but no finished switch panel.
Evidence: API directory exists, but no persistence layer, no auth, and no integration tests.
Benefit: The service layer is separated from the UI, so it can be tested and deployed independently.
Limitation: A utility room does not prove the house is safe to move into until inspection and deployment checks pass.
Next action: add one saved end-to-end flow and verify it with a request test.
```

### 3. Launch Packet

Generate a copyable packet for Gemini, Antigravity, or another coding agent. See `docs/agent/operating-model.md` for the detailed packet contract.

The packet must include:

- Project goal.
- Target user.
- Target stack.
- Architecture constraints.
- Forbidden drift.
- Current evidence-backed status.
- Next tasks.
- Completion standard.
- Required verification.

### 4. Agent Supervision

Let engineers define a project contract and continuously check whether agents drift.

Contract fields:

- Approved stack.
- Approved UI system.
- Approved data layer.
- Deployment target.
- Required tests.
- Required docs.
- Forbidden dependencies.
- Forbidden architecture changes.
- Completion weights.

Example drift alerts:

- Added an unapproved UI framework.
- Introduced a database not listed in the contract.
- Replaced a typed API boundary with direct component-side fetch logic.
- Added mock-only behavior while reporting feature completion.
- Changed deploy target without updating the contract.
- Removed tests or skipped verification.

### 5. AI Team Map

Show the project as supervised work by typed agents. The first demo does not need real multi-provider API execution. It needs a visual and structured planning layer with evidence.

See `docs/agent/operating-model.md`.

## First Demo Scope

Build the smallest demo that proves the product:

1. Scan the `tui-gui` project.
2. Show framework and file inventory.
3. Show completion bars for product, engineering, and evidence confidence.
4. Generate one analogy explanation.
5. Generate one Launch Packet.
6. Show one AI Team Map with model-capability routing.
7. Show one drift rule check and one Critic review.

This demonstrates:

```text
Project facts -> human explanation -> agent instructions -> AI team routing -> drift supervision
```

## Three Core Features

These are the non-negotiable product capabilities for the first event-ready build:

### 1. Project Scan / 项目体检

Scan a real project and report measured facts:

- Technology stack.
- Total code size.
- Frameworks.
- Frontend, backend, network, database, deployment, and test inventory.
- Git status: repository, branch, dirty/untracked state, recent commit or no-commit-yet state.
- Completion progress bars.
- Risk red lights.
- Evidence buttons or drawers for each major claim.
- Engineering Monitor for programmers: technical stack, architecture boundaries, framework drift, language mix, line/file growth since the previous scan, and performance baselines.

### 2. Analogy View / 类比解释

Turn scanner evidence into a user-chosen analogy:

- Profession preset selector: boss, designer, sales.
- Basic object selector: bicycle, house, plant, human body.
- Generate one visual analogy blueprint and one diagram.
- Explain framework, architecture, programming language, tools, benefits, and limitations.
- Map every analogy module back to a real engineering module.
- Support English, Japanese, and Chinese with Gemini-reviewed copy.

### 3. Launch Packet / 开工包

Produce a copyable work packet for Gemini, Antigravity, or another coding agent:

- Gemini / Antigravity start prompt.
- Supervision rules and stack boundaries.
- Next-round task list.
- Forbidden drift items.
- Completion standards.
- Current Git state.
- One-click copy for agent handoff.

Optional polish must not replace these capabilities. A beautiful UI without these three working features is not complete.

## Event Submission Requirements

For the Gemini Tokyo event, the demo should satisfy two hard constraints:

- Google integration: include at least one real Google Cloud or Gemini capability in the product flow. The preferred MVP path is Gemini API generating the analogy explanation and Launch Packet from deterministic scan evidence.
- Deployment: submit a deployed app or website URL through Cloud Run or Agent Runtime. Local-only execution is acceptable for development, but not enough for the final submission.
- Multilingual readiness: support English, Japanese, and Chinese UI copy through a real i18n library, and pass event-facing copy through a Gemini precision translation review.

Fallback behavior is allowed during development, but it must be visibly labeled as fallback. Do not present mock Gemini output or an unverified deployment as complete.

## UI Strategy

Use progressive disclosure.

Top layer:

- Overall status.
- Completion bars.
- Biggest risk.
- Next action.

Middle layer:

- Project Scan.
- Analogy View.
- Launch Packet.
- AI Team Map.

Deep layer:

- Evidence drawer.
- Files and commands.
- Raw schema.
- Agent supervision contract.

Do not force non-technical users to read engineering terms first. Let them enter through analogy and progress, then drill into evidence.

## Judging Angle

Strongest pitch:

```text
AI can write code faster than teams can understand it. Spec Compass turns codebases into an evidence-backed shared language so humans can supervise agents instead of blindly trusting them.
```

Demo-ready strengths:

- Clear before/after value.
- Uses Gemini for structured reasoning, generation, and agent handoff.
- Produces a concrete artifact that another agent can execute.
- Useful to both non-technical stakeholders and engineers.
- Grounded in evidence, not just prompt prose.

Main risk:

- If scan results are not evidence-backed, it looks like a generic code summarizer.

Mitigation:

- Always show source evidence beside every score and explanation.
