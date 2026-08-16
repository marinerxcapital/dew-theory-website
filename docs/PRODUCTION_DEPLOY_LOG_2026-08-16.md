# Production deploy log — 2026-08-16

**Domain:** https://dewtheoryco.com (+ https://www.dewtheoryco.com)  
**Worker:** `dew-theory` (Cloudflare Workers via OpenNext)  
**Repo:** `marinerxcapital/dew-theory-website`

## Deployed artifact

| Item | Value |
|---|---|
| Main SHA | `1e56d6c96d0075811e806af952673e1d6a09e4ba` |
| Cloudflare Worker version / deploy ID | `e6bc265f-97d8-4518-a96b-6f37a0983bca` |
| Deploy timestamp (UTC) | `2026-08-16T05:54:19Z` |
| Auth | Wrangler OAuth token (`skyler@marinerxcapital.com`), workers/write scopes |

Merged PRs in this deploy chain:

- PR #5 `cursor/legal-pdfs-fixed-v2-2e1c` → merge `a5fef35735e72d8ca2cabf86bb4fcda4d4d19c3a` (FIXED V2 legal PDFs)
- PR #6 `cursor/landing-hero-motion-2e1c` → merge `1e56d6c96d0075811e806af952673e1d6a09e4ba` (full-bleed dew-motion landing hero)

## Commands run

```bash
npm ci            # 406 packages, 8 audit findings (1 moderate, 7 high) — deferred, out of scope
npm test          # 192 pass / 0 fail
npm run build     # pass (67/67 pages)
npm run deploy    # opennextjs-cloudflare build && deploy → succeeded
```

## Live verification checklist

| Check | Result | Evidence |
|---|---|---|
| Apex `/` 200 | PASS | `curl` 200 |
| `www` root 200 | PASS | `curl` 200 |
| 8 legal HTML routes 200 | PASS | `/privacy /terms /shipping /returns /booking-policy /aesthetic-disclaimer /cookies /accessibility` all 200 |
| 10 public FIXED V2 PDFs 200 + `application/pdf` | PASS | privacy, terms, shipping, returns, booking, aesthetic, cookies, accessibility, VC terms, photo/intake |
| PDF logo (full, not cropped) | PASS | Privacy + Terms SHA256-match local `public/legal/pdfs/`; embedded page-1 logo is 1054×318 RGBA with ~10px transparent inset on all sides |
| Footer Help links present | PASS | Terms, Privacy, Shipping, Returns, Booking / Cancellation, Aesthetic Disclaimer, Accessibility, Cookies |
| Footer forbidden labels absent | PASS | Legal Open Items, Claims Audit, Implementation Guide, Complete Legal Package, Minor Guardian Consent, Treatment Informed Consent, Consumer Health Data all absent |
| `/virtual-consultation` docs before consent | PASS | "Review before you agree" block precedes consent checkbox |
| `/services` booking/aesthetic/treatment docs | PASS | 3 PDFs present in server HTML |
| `/book` confirm-step docs | PASS | `BookingFlow` renders booking + aesthetic + treatment consent at confirm step |
| `/cart` checkout policies | PASS | Terms, Privacy, Shipping, Returns via `getCheckoutLegalDocuments()` |
| `/membership` pre-launch interest list | PASS | "Pre-launch terms", "not in effect", interest list |
| Homepage hero motion | PASS | `hero-stage` + `<canvas>` present; `hero-ken`/`hero-caustic`/`hero-dew-fade` keyframes in deployed CSS; reduced-motion guarded |
| `npm run smoke:routes -- https://dewtheoryco.com` | PASS | `all clear` (28 routes + PDFs) |

## PDF logo verification method

No browser frame was available for a human visual render, so verification is deterministic:
the live Privacy/Terms PDFs are byte-identical (SHA256) to the local FIXED V2 originals, and the
embedded page-1 logo image is a single 1054×318 RGBA asset whose visible content is fully inset
with ~10px transparent padding on every edge (bbox `10,10,1044,308`), matching the full-resolution
reference logo aspect ratio. This rules out a cropped/edge-clipped earlier generation.

## Remaining blockers

None introduced by this deploy. Business facts still unresolved and unchanged:
studio address, license number, service menu finals, deposit/cancellation amounts, membership
prices, SPF retail confirm, lip SKU structure, promo economics. Stripe/Resend/Google Calendar/Skin
Script live credentials remain owner-only env drops. See `OPEN_ITEMS.md`.
