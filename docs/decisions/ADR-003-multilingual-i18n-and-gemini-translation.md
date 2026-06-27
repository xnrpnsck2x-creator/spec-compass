# ADR-003: Use i18next And Gemini Translation Review For Multilingual UI

## Status

Accepted

## Date

2026-06-27

## Context

Spec Compass is being prepared for a Gemini Tokyo event and needs to be understandable to English, Japanese, and Chinese audiences. The product also explains technical concepts to non-technical users, so translation quality matters more than simple word substitution.

The UI needs a real localization system so the team can switch language at runtime without hard-coded conditional text. Event-facing copy also needs model-assisted precision translation so technical terms such as framework, API, Cloud Run, Launch Packet, evidence, and scanner stay consistent across languages.

## Decision

Use `i18next` plus `react-i18next` for frontend internationalization.

Support these first locales:

- English: `en`
- Japanese: `ja`
- Chinese: `zh-CN`

Use Gemini API as a translation review gate for event-facing copy. The model should translate or review UI copy, analogy explanations, vocabulary definitions, Launch Packet labels, and deploy-readiness messages against a shared glossary.

Do not claim multilingual readiness unless the translation review has run and the result is marked in locale metadata or readiness checks.

## Alternatives Considered

### Manual language conditionals

- Pros: fastest for a tiny prototype.
- Cons: spreads copy across components, makes review hard, and creates drift between languages.
- Rejected because the demo needs credible multilingual switching.

### Browser-only auto-translation

- Pros: zero implementation work.
- Cons: not product-owned, not stable, and cannot guarantee glossary consistency.
- Rejected because the event demo needs controlled English, Japanese, and Chinese copy.

### Only Gemini-generated text without an i18n library

- Pros: flexible for dynamic explanation text.
- Cons: does not solve UI labels, navigation, buttons, statuses, or predictable locale switching.
- Rejected. Gemini handles translation quality; i18next handles runtime localization.

## Consequences

- Frontend code must route primary user-facing copy through translation keys.
- The project needs locale resources for `en`, `ja`, and `zh-CN`.
- The UI needs a language switcher and translation readiness status.
- Gemini translation review becomes part of event readiness.
- Code identifiers, package names, paths, commands, API routes, and environment variables should not be translated unless explicitly listed in the glossary.
