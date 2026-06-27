# ADR-002: Add an Agent Operating Model Before Real Multi-Provider Execution

## Status

Accepted

## Date

2026-06-27

## Context

Spec Compass should help users supervise AI coding work. A natural extension is to let the product describe an organization of agents that can use different model providers for different strengths.

The risky version is to build a large multi-agent runtime too early: many providers, many API keys, agents talking freely, and no clear evidence trail. That would be hard to demo, hard to trust, and easy to confuse with generic prompt engineering.

The useful version is simpler: show the user which agents should exist, why they exist, which capability each one needs, and what evidence each one must produce.

## Decision

Add an Agent Operating Model as a first-class product concept.

For the MVP, implement it as a structured planning and supervision layer, not as a full multi-provider execution platform.

Default AI Team Map:

- Human Owner.
- Orchestrator / PM Agent.
- Scanner Agent.
- Architect Agent.
- Frontend Agent.
- Backend Agent.
- Analogy Agent.
- Critic Agent.
- Release Agent.

Each agent must have a contract:

- Role.
- Allowed tools.
- Input schema.
- Output schema.
- Evidence required.
- Stop condition.
- Escalation rule.
- Preferred model capability.
- Fallback model capability.

Route tasks by model capability rather than by brand:

- Long context, multimodal explanation, Google Cloud context, and analogy images.
- Architecture reasoning, critique, and hard trade-off analysis.
- Code implementation and refactoring.
- Low-risk classification, summarization, tagging, and repeated checks.

Real provider API calls are optional for the MVP. The first demo should show the organization chart, routing recommendation, Launch Packet handoff, Critic review, and evidence timeline. Provider adapters can be added later behind a typed interface.

## Alternatives Considered

### Full multi-agent runtime now

- Pros: more impressive if everything works.
- Cons: high implementation cost, API key complexity, unclear demo reliability, hard to audit, and easy to become a black box.
- Rejected for the MVP.

### Single-agent only

- Pros: simplest to build.
- Cons: misses the product insight that users need to manage AI work, not just prompt a single assistant.
- Rejected as the long-term direction, but the first implementation may simulate multiple roles through one orchestrated backend.

### Provider-specific routing

- Pros: easy to explain with familiar model names.
- Cons: locks the product to current vendors and encourages brand arguments instead of capability reasoning.
- Rejected. Route by capability first, then map configured providers to those capabilities.

## Consequences

- The product can demonstrate a richer supervision story without depending on many API keys.
- Non-technical users see an understandable AI team structure instead of a hidden prompt chain.
- Engineers get typed contracts, boundaries, and evidence requirements for each agent role.
- Future provider adapters can be added without changing the product model.
- The Orchestrator must record task inputs, outputs, evidence, and stop conditions before any specialist result is treated as complete.
