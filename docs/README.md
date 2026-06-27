# Documentation Map

This directory keeps the durable product, engineering, deployment, and architecture notes for Spec Compass.

## Read Order

1. `docs/product/spec-compass.md`
2. `docs/product/ui-layout-brief.md`
3. `docs/engineering/stack-boundaries.md`
4. `docs/engineering/report-schema.md`
5. `docs/engineering/quality-maintenance.md`
6. `docs/agent/operating-model.md`
7. `docs/deploy/cloud-run.md`

Optional context:

- `docs/decisions/ADR-001-demo-stack-google-cloud.md`
- `docs/decisions/ADR-002-agent-operating-model.md`
- `docs/decisions/ADR-003-multilingual-i18n-and-gemini-translation.md`

## Folder Boundaries

- `product/`: product goal, users, MVP flow, demo story, and judging angle.
- `engineering/`: allowed stack, cloud/local boundaries, schemas, and implementation contracts.
- `agent/`: product-facing agent roles, orchestration, workflow guardrails, and Launch Packet rules.
- `deploy/`: Cloud Run and release operation notes.
- `decisions/`: ADRs that explain why major technical choices were made.
