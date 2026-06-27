# Report Schema

This schema is the first contract between the scanner, UI, Launch Packet generator, and agent supervision layer.

Use TypeScript plus Zod in implementation. Keep the JSON shape stable enough that the UI can render partial reports.

## Top-Level Shape

```json
{
  "project": {
    "name": "string",
    "goal": "string",
    "targetUsers": ["string"]
  },
  "detectedStack": {
    "frontend": ["string"],
    "backend": ["string"],
    "network": ["string"],
    "database": ["string"],
    "data": ["string"],
    "deploy": ["string"],
    "test": ["string"]
  },
  "git": {
    "isRepository": true,
    "branch": "string",
    "hasCommits": true,
    "latestCommit": "string|null",
    "isDirty": true,
    "untrackedCount": 0,
    "statusSummary": ["string"],
    "evidence": ["string"]
  },
  "inventory": {
    "files": 0,
    "lines": 0,
    "languages": [{"name": "string", "lines": 0}],
    "keyDirectories": [{"path": "string", "purpose": "string"}]
  },
  "completion": {
    "product": 0,
    "engineering": 0,
    "evidenceConfidence": 0
  },
  "areas": [
    {
      "name": "frontend",
      "score": 0,
      "status": "missing|partial|usable|verified",
      "evidence": ["string"],
      "gaps": ["string"],
      "nextActions": ["string"]
    }
  ],
  "drift": [
    {
      "severity": "low|medium|high",
      "claim": "string",
      "evidence": ["string"],
      "suggestedFix": "string"
    }
  ],
  "agentOperatingModel": {
    "agents": [
      {
        "id": "scanner",
        "label": "Scanner Agent",
        "role": "Measure project facts before interpretation",
        "allowedTools": ["filesystem", "git", "package-manager"],
        "preferredCapabilities": ["cheap-classification"],
        "evidenceRequired": ["command-output", "file-reference"],
        "stopCondition": "Stop if project input is unavailable or outside allowed root"
      }
    ],
    "routes": [
      {
        "taskType": "architecture-review",
        "agentId": "architect",
        "preferredCapabilities": ["reasoning", "long-context"],
        "routingReason": "Requires stack trade-off analysis and evidence review"
      }
    ],
    "timeline": [
      {
        "agentId": "critic",
        "claim": "Frontend stack drift detected",
        "evidence": ["package.json contains two UI libraries"],
        "nextAction": "Remove unapproved UI dependency or update project contract"
      }
    ]
  },
  "launchPacket": "string"
}
```

## Evidence Rules

- Every score must have at least one evidence item.
- Evidence should reference measured output, files, commands, screenshots, or schema output.
- Git claims must be backed by command output such as `git status --short --branch`, `git branch --show-current`, or `git log --oneline -1`.
- Model interpretation can appear in summaries, but it cannot replace measured evidence.
- Unknown or unscanned areas should reduce `evidenceConfidence`.

## Partial Report Behavior

The UI should render partial reports gracefully:

- Missing product goal: show an intent-needed prompt.
- Missing stack evidence: show unknown stack with scanner next action.
- Missing tests: show test evidence as absent, not failed.
- Missing deployment evidence: show deployment status as unverified.
