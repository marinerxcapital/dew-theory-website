# Dew Theory — Agent Continuity Instructions

Every coding agent (Cursor, Codex, Claude Code, Grok, etc.) working on this repository **must** maintain project memory automatically.

## Before work

1. Read `DEW-THEORY-CURRENT-STATUS.md` (canonical current state)
2. Read `OPEN_ITEMS.md` (unresolved business/engineering items)
3. Read `docs/memory/ACTIVE_WORK.md` if present
4. Verify Git truth: `git fetch origin && git status && git rev-parse HEAD && git log -5 --oneline`
5. Never assume old deployment SHA or production state from prior sessions

## During material work

- Record architecture, schema, config, and deployment decisions in implementation logs
- Record meaningful errors, fixes, and blockers
- Never fabricate test results, deployments, or external verification

## After material work

Update as applicable:

| File | When |
|------|------|
| `DEW-THEORY-CURRENT-STATUS.md` | Any material code/config change |
| `docs/implementation/SKIN_SCRIPT_RPA_IMPLEMENTATION_LOG.md` | RPA/fulfillment changes |
| `docs/deploy/SKIN_SCRIPT_RPA_DEPLOYMENT_LOG.md` | Deployment-related changes |
| `OPEN_ITEMS.md` | New blockers or resolved items |
| `docs/decisions/ADR-001-SKIN-SCRIPT-RPA.md` | Architecture decisions |

## Skin Script RPA docs

- `docs/SKIN_SCRIPT_RPA_ARCHITECTURE.md`
- `docs/SKIN_SCRIPT_RPA_RUNBOOK.md`
- `docs/SKIN_SCRIPT_RPA_SECURITY.md`
- `docs/SKIN_SCRIPT_RPA_TESTING.md`
- `docs/SKIN_SCRIPT_RPA_DEPLOYMENT.md`
- `docs/SKIN_SCRIPT_RPA_TROUBLESHOOTING.md`

## Never

- Commit secrets, storageState, PAN/CVV, or supplier credentials
- Invent supplier selectors, SKUs, or order confirmations
- Leave memory stale after material commerce/fulfillment changes
- Bypass CAPTCHA/MFA or duplicate supplier purchases

## Continuity CI

Run `node scripts/check-project-continuity.mjs` — material changes to commerce/fulfillment should update memory files.
