# Agent Operating Model

Spec Compass should show how a project can be managed by a small AI team without becoming an uncontrolled multi-agent chat room.

For the first demo, build this as a visual and structured planning layer. Real multi-provider API calls are optional unless the provider is explicitly configured.

## Organization

```text
Human Owner
  -> Orchestrator / PM Agent
    -> Scanner Agent
    -> Architect Agent
    -> Frontend Agent
    -> Backend Agent
    -> Analogy Agent
    -> Critic Agent
    -> Release Agent
```

## Role Map

| Agent | Purpose | Preferred capability | Evidence required |
|---|---|---|---|
| Orchestrator / PM | Break work into bounded tasks, route to agents, enforce budget and stop conditions | Planning, tool coordination, context control | Task graph, routing reason, status summary |
| Scanner | Measure files, languages, frameworks, tests, docs, and deploy evidence | Deterministic tools first | Commands run, counts, detected files |
| Architect | Check stack fit, boundaries, risks, and forbidden drift | Strong reasoning and long-context review | Architecture claims tied to files or docs |
| Frontend | Build the user-facing MUI dashboard and interaction flow | UI implementation, component selection | Screenshots, build result, changed files |
| Backend | Build scanner API, report schema, and Cloud Run-ready service | Node.js, TypeScript, Fastify, cloud deployment | API checks, schema validation, command output |
| Analogy | Translate technical evidence into profession/object analogies and diagrams | Multimodal generation and explanation | Claim -> analogy -> evidence -> benefit -> limitation -> next action |
| Critic | Review for hallucination, missing evidence, scope drift, and weak tests | Independent reasoning and code review | Findings with severity and file references |
| Release | Prepare local demo, deploy checklist, and cloud handoff | CI/CD, Cloud Run/Firebase, verification | Runbook, environment gaps, deploy status |

## Agent Contract Fields

- Role.
- Allowed tools.
- Input schema.
- Output schema.
- Evidence required.
- Stop condition.
- Escalation rule.
- Preferred model capability.
- Fallback model capability.

## Routing Policy

Route by capability, not brand loyalty:

- Use Gemini-oriented capabilities for long context, multimodal explanation, Google Cloud context, and analogy images.
- Use strong reasoning models for architecture decisions, critique, and hard trade-off analysis.
- Use code-focused models for implementation and refactoring when the task is tightly scoped.
- Use cheaper or local models only for low-risk classification, summarization, tagging, or repeated checks.

## Guardrails

- Do not let agents talk to each other without the Orchestrator recording inputs, outputs, and evidence.
- Do not let a specialist agent modify files outside its task boundary.
- Do not call external model APIs unless the provider is explicitly configured.
- Do not store provider API keys, tokens, or secrets in project docs.
- Do not present model output as evidence unless it points back to measured facts.

## Workflow Event

Use a typed event shape before building a general-purpose workflow engine.

```ts
type WorkflowEvent = {
  id: string;
  phase: "scan" | "interpret" | "plan" | "build" | "review" | "release";
  agentId: string;
  taskId: string;
  status: "queued" | "running" | "done" | "blocked" | "failed";
  evidence: string[];
  summary: string;
};
```

## Launch Packet Contract

Template:

```text
You are the engineering agent for this project. Follow the project intent and do not drift from the approved stack.

Project goal:
<one paragraph>

Target stack:
- Frontend: <approved frontend>
- UI system: <approved UI system>
- Backend: <approved backend>
- Data: <approved data layer>
- Deploy: <approved deploy target>

Forbidden drift:
- Do not add unapproved frameworks or dependencies.
- Do not replace the approved data layer.
- Do not bypass the planned architecture.
- Do not use mock data as proof of completion unless the task is explicitly a prototype.
- Do not claim completion without verification evidence.

Operating mode:
- One Orchestrator routes all specialist work.
- Specialists must return evidence for every claim.
- Do not start the next phase until the current phase has verification evidence.
- Stop after repeated blockers, budget exhaustion, or missing required input.

Current status:
- Product completion: <score> with <evidence>
- Engineering completion: <score> with <evidence>
- Evidence confidence: <score> with <evidence>

Next tasks:
1. <task with evidence target>
2. <task with evidence target>
3. <task with evidence target>

Completion standard:
- The change runs locally or in the target environment.
- The smallest meaningful test/check has been run.
- The result is reported with exact evidence.
- Any skipped check or uncertainty is named.
```

## Loop Boundaries

Borrow these patterns:

- Deterministic phases.
- Journaled workflow events.
- Budget limits.
- Blocked and completion audits.

Do not copy CCB code or install CCB as a dependency for the first demo.
