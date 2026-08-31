# ADR-001: Skin Script RPA Fulfillment Architecture

**Status:** Accepted (2026-08-31)  
**Branch:** `cursor/skin-script-rpa-fulfillment-5261`

## Context

Dew Theory needs automated Skin Script wholesale fulfillment after Stripe payment, with duplicate-order prevention, security controls, and durability on Cloudflare Workers.

## Decision

1. **Durable commerce store** via Cloudflare D1 (`DEW_THEORY_D1`) with file fallback for local dev/CI
2. **Fulfillment job outbox** created transactionally when order transitions to paid
3. **Private RPA microservice** (`services/skin-script-rpa`) — FastAPI + Playwright, HMAC auth
4. **Verified supplier mappings** required for RPA mode — no derived/mock SKUs in production
5. **Mock portal** for CI; real selectors bound after authenticated portal reconnaissance
6. **Kill switch** `SKIN_SCRIPT_RPA_ENABLED=false`

## Consequences

- RPA service requires separate container deployment (not Cloudflare Workers browser)
- D1 must be provisioned before production commerce durability
- Codex/owner must complete portal reconnaissance + mapping verification

## Alternatives rejected

- Playwright inside Cloudflare request path — isolate lifetime unsuitable
- In-memory store for production — data loss across isolates (existing issue)
