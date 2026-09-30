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
- `docs/deploy/SKIN_SCRIPT_RPA_GO_LIVE.md`
- `docs/SKIN_SCRIPT_RPA_TROUBLESHOOTING.md`

## Never

- Commit secrets, storageState, PAN/CVV, or supplier credentials
- Invent supplier selectors, SKUs, or order confirmations
- Leave memory stale after material commerce/fulfillment changes
- Bypass CAPTCHA/MFA or duplicate supplier purchases

## Continuity CI

Run `node scripts/check-project-continuity.mjs` — material changes to commerce/fulfillment should update memory files.

## September 2026 — Green system revamp

Authoritative active colors live in app/globals.css (dt-green 50, 100, 200, 300, 400, 700, 900); Tailwind reads their RGB channels. Page 100; raised cards and photos 50; bands 100/200; panels 300; body 900; controls and links 700. Strong decorative borders 400, input boundaries 700 for AA. Hairline uses green 900 at 14%; green shadows 6–12%; frosted surfaces 50 at 68%; radius 10/16/24/pill; 2px green-700 focus with green-50 offset.

Use the single root Nav, announcement and four-column Footer on every route, including shop and admin; admin keeps its authenticated owner navigation inside the shared shell. Tagline Clinical · Precise · Personal. Consultation nav points to /virtual-consultation; /consultation permanently redirects. Shared ProductCard, MeetEmily, button/chip/form roles and loading/error components must remain shared.

Typography: next/font Fraunces variable SOFT 100 for display/product names; Figtree for UI/body/tabular prices; Newsreader for journal prose only. Roman preload; swap. US English. Respect reduced motion; continuous loaded-image animation is avoided, glass hover interaction retained.

Never fabricate reviews, ratings, medical claims, stock people, awards or results. Preserve product names, IDs/slugs, prices, stock, ingredient facts, shipping ($12 below $49 product subtotal), Stripe/checkout/secrets/webhooks. Do not rewrite legal/policy wording or PDFs. Existing missing manufacturer facts remain empty. Sizes normalize oz without trailing period or duplicates; no size is invented. Alt: Skin Script [Name] product photo. Image cache revision green-20260929; original product artwork and logo originals unchanged. Staged catalog artwork is excluded from this release.

Worktree C:\Users\Skyler B. Brown\Desktop\dew-theory-codex; branch revamp/green-system. A DeepSeek V4 Pro session was active in the canonical main source. Never edit/clean/install/kill processes there. Local Git objects live on C using scripts/git-green.ps1 because D is full. Main serving source: Desktop\DewTheory\working\dew-theory-wt-zero-touch, with orphaned Git metadata; old valid Git hub is D:\OffloadedProjects\dew-theory and has dirty work. Preserve both. Hash manifest and concurrency comparisons are in docs/revamp. Route list: docs/revamp/routes.json, including 35 visible products, 7 concern details, 4 journal articles, protected/post-checkout states and intentional 404.

Deployment path: Cloudflare Worker dew-theory via OpenNext/Wrangler. Verified rollback Worker version 2815c88a-6d37-4ead-b0e6-c6bbde9da72f (100%, 2026-09-28T21:03:41Z). Do not deploy a missing-image build or a stale source over concurrent work. Verify 115 catalog references in final .open-next/assets; read back active version after deployment. Roll back to the recorded version if production fails. No environment/secrets changes are part of the revamp. Latest resume authorizes the specifically listed branch/PR/main release actions; do not add unrelated GitHub work.

Open owner items: Shipping operations wording; Returns placeholders; Acai Berry manufacturer description hidden until supplied; consultation price display; hello@dewtheory.studio versus dewtheoryco.com; 27 records lack supplied concern/active content; authentic Stripe test-account handoff is unavailable without test credentials. Authenticated admin production content needs appropriate access. Cart drawer and cookie banner are absent from canonical source; do not invent consent/legal behavior. Consult resume-state.md and executed reports for current gates; unfinished tests are not passing evidence.

