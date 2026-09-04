# Project Memory — Dew Theory

Canonical current state: **`DEW-THEORY-CURRENT-STATUS.md`**

## Structure

| Path | Purpose |
|------|---------|
| `DEW-THEORY-CURRENT-STATUS.md` | Single source of truth for current state |
| `OPEN_ITEMS.md` | Unresolved business/engineering items |
| `docs/implementation/` | Implementation logs (append-only history) |
| `docs/deploy/` | Deployment logs |
| `docs/decisions/` | ADRs |
| `AGENTS.md` | Cross-agent continuity protocol |

## Skin Script RPA (2026-08-31)

See `docs/SKIN_SCRIPT_RPA_ARCHITECTURE.md` and `DEW-THEORY-CURSOR-TO-CODEX-HANDOFF.md`.

## Future services / booking (do not publish)

- Placeholder menu data lives in `lib/services.js` (`SERVICES` array + helpers). Extend that module or a future D1/catalog table when Emily confirms a real menu — **do not** resurrect public `/book` or `/services` storefront pages until owner publishes them.
- Virtual Consultation is the live paid consult path (`/virtual-consultation`); in-person booking remains unpublished (see `tests/public-removals.test.mjs`).
