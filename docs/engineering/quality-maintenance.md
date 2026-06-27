# Quality Maintenance Notes

This file tracks engineering issues that should stay visible after the demo submission.

## 2026-06-27 Test And Fallback Pass

Resolved:

- Root `npm test` now runs explicit workspace tests for `@spec-compass/shared` and `@spec-compass/api`.
- `@spec-compass/api` declares its own `test` script and direct `vitest` dev dependency.
- `@spec-compass/shared` declares its own `test` script and direct `vitest` dev dependency.
- Scanner Gemini fallback scoring now documents why generation fallback and three-language review are separate product gaps.
- Gemini fallback vocabulary now localizes `job`, `role`, and `evidence` fields for English, Japanese, and Simplified Chinese.

Verified:

- `npm test`
- `npm run build`

Remaining P2 Refactor Targets:

- `apps/web/src/App.tsx` is still a large single file. Split it by feature surface when the next UI change lands:
  - App shell and data orchestration.
  - Project Scan tab.
  - Analogy View tab.
  - Launch Packet tab.
  - Agent Operating Model panel.
  - Shared metrics, evidence, and status components.
- UI copy has two parallel sources: inline `localeCopy` in `App.tsx` and `apps/web/src/locales/*/common.json`.
  - Pick one source of truth before adding more languages or large copy changes.
  - Preferred direction: move reusable UI copy into locale JSON files, keep generated/scanner-derived text in typed runtime helpers.
  - Add a small validation test that every required locale key exists in English, Japanese, and Simplified Chinese.
