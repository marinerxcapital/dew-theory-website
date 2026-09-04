# Active Work — Dew Theory

**Signed:** Cursor (SuperGrok master prompt author)  
**Last updated (UTC):** 2026-09-04T13:50:00Z  
**Branch:** `main` @ `a11626f` (audit baseline); prompt on `cursor/supergrok-master-prompt-e021`

## Status

- Full repository audit completed for SuperGrok handoff (2026-09-04).
- Master prompt: `docs/handoffs/DEW-THEORY-SUPERGROK-MASTER-EXECUTION-PROMPT.md`
- Live probes: homepage 200; `/admin` 307→login; Stripe webhook **503** (secrets unset); robots disallow admin.
- Deployed Stripe code (PR #17) present; Worker Stripe secrets still owner-gated.
- RPA Fly app configured, not deployed; production `SKIN_SCRIPT_MODE=mock`, `AUTO_FULFILL=false`.
- Highest eng risk called out for SuperGrok: **pending Stripe orders in ephemeral `lib/store.js` on Workers**.

## Remaining (for SuperGrok / owner)

1. Durable pending-order persistence (D1) before live Stripe traffic
2. `wrangler secret put` Stripe + RPA secrets + `npm run deploy`
3. Fly RPA deploy + Emily saved payment + authorized live order
4. Skin Script product-image ZIP package for ChatGPT transforms
5. Reconcile stale OPEN_ITEMS / status SHA rows

## Commands

```bash
npm test && npm run build && npm run continuity
npm run smoke:routes -- https://dewtheoryco.com
```

See `docs/handoffs/DEW-THEORY-SUPERGROK-MASTER-EXECUTION-PROMPT.md`.
