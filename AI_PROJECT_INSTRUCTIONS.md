# AI Project Instructions (cross-agent)

Canonical continuity: **`AGENTS.md`** and **`DEW-THEORY-CURRENT-STATUS.md`**.

Agents must read and update Dew Theory memory/logs after material work without owner reminders. See `.cursor/rules/dew-theory-project-continuity.mdc`.

Skin Script production fulfillment uses **`SKIN_SCRIPT_MODE=rpa`** with durable commerce DB (`DEW_THEORY_D1` on Cloudflare) and private RPA service (`services/skin-script-rpa/`).

Never use derived/mock SKUs in production RPA — verified mappings only (`lib/suppliers/skin-script/mapping.js`).
