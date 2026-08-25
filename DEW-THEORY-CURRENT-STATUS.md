# DEW-THEORY-CURRENT-STATUS.md

> Canonical continuity file for Dew Theory (`dewtheoryco.com`).
> Written for a fresh ChatGPT / Codex / Cursor / Claude / Grok session with **no prior memory**.
> Re-verify Git SHAs, CI, and production after every handoff — they can change.

---

## CURRENT BRAND SYSTEM

### Authoritative five colors (do not alter hex values)

| Semantic | Hex | Role |
|---|---|---|
| Forest | `#1E2B22` | Main text; inverse surfaces; primary CTAs; footer; category rail |
| Sage deep | `#5B7356` | Botanical accent, decorative rules, selected/hover accents |
| Sage | `#93A890` | Signature sage surfaces, editorial bands, `.btn-dew` fill |
| Ivory | `#EDEDE6` | Page ground; inverse text on forest |
| Stone | `#C9C4B8` | Warm alternate section surfaces |

### Token wiring (preserve classname aliases)

Defined in `app/globals.css` `:root` and `tailwind.config.js`:

- `forest` / `ink` / `graphite` / `charcoal` / `black` → `#1E2B22`
- `sage-deep` / `dew` → `#5B7356`
- `sage` / `dew-mid` → `#93A890`
- `ivory` / `pearl` → `#EDEDE6`
- `stone` → `#C9C4B8`
- `surface` / `white` → `#FFFFFF` (product cards / lift only; page ground is ivory)
- `muted` → `#5A655C` (derived secondary text for AA on ivory)
- `promo` → restrained `#8B3A3A` (alerts only)

**Contrast rule:** Use `#1E2B22` on `#EDEDE6`, `#C9C4B8`, and `#93A890`. Use `#EDEDE6` on `#1E2B22`. Do **not** put normal-size `#5B7356` text on ivory/sage without verifying AA. Do not change the five brand hexes to “fix” contrast — change pairings instead.

### Typography

- Display: **Bodoni Moda** (`next/font/google` → `--font-display`) — H1–H3, editorial quotes, selected italics
- Label: **Jost** — uppercase tracked UI / nav / buttons
- Body: **Karla** — body, forms, policies

### Emily’s approved copy motifs (use thoughtfully; do not spam)

- “this and no stress”
- “I’d rather be exhausted building my dream than comfortable watching it pass me by”
- “a calm monday”
- “what is PDRN?”
- “salmon DNA skin booster”
- “tiktok made me do it... and now my barrier is ruined”
- “let’s debunk the worst advice going viral rn”
- “by emily | hydration specialist”
- “relax. i’ve got you covered”
- “this is what you need”
- Editorial label pattern: `DEW THEORY / MYTH BUSTING`

### PDRN accuracy

PDRN is **not** in `lib/services.js` and is **not** a catalog SKU. Homepage treats it as **education only** with an explicit “not a menu item” note. Do not invent a bookable PDRN treatment.

---

## CURRENT PRODUCTION STATE

| Item | Verified value (re-check before acting) |
|---|---|
| Business | Dew Theory — Skin Script retail + Emily Mitchener aesthetician services |
| Production domain | https://dewtheoryco.com (+ www) |
| GitHub | `https://github.com/marinerxcapital/dew-theory-website` |
| Origin | `origin` → GitHub above |
| Default / production branch | `main` |
| Live production SHA (last known deployed) | `1e56d6c96d0075811e806af952673e1d6a09e4ba` (2026-08-16) |
| Worker | `dew-theory` (Cloudflare Workers via OpenNext) |
| Last known Worker version ID | `e6bc265f-97d8-4518-a96b-6f37a0983bca` |
| Revamp branch | `cursor/brand-revamp-editorial-5502` |
| Revamp commit (implementation) | `9f5da67c1f38a1a923e9c1d7d6916d8a27d8ff6b` on `cursor/brand-revamp-editorial-5502` (PR #7) — re-verify before deploy |
| Live design as of 2026-08-25 Cursor session | Still **pre-revamp** Sephora shell (`#111111` / `#FFFFFF`) until merge + `npm run deploy` |
| Deploy blocker this session | No `CLOUDFLARE_API_TOKEN` / Wrangler login in Cursor Cloud environment |

**Live smoke (production, 2026-08-25):** `https://dewtheoryco.com` and `www` return HTTP 200 over HTTPS. Brand tokens from this revamp are **not** live until deploy.

---

## FRESH-SESSION CONTINUATION BRIEF

### Stack

- Next.js 15 App Router, React 19, Tailwind 3.4, JS (jsconfig)
- Package manager: npm (`package-lock.json`)
- Commerce: local cart (`CartProvider` / `dew_theory_cart_v1`) → `POST /api/checkout` → mock paid **or** Stripe Checkout when keys set
- Catalog: `data/products.json` (8 Skin Script SKUs) + optional runtime store
- Hosting: Cloudflare Workers (`wrangler.jsonc` + `@opennextjs/cloudflare`)
- Fonts: Bodoni Moda / Jost / Karla via `next/font`

### Commands

```bash
npm install
npm run dev
npm test
npm run build
npm run start
npm run smoke -- http://localhost:3000
npm run smoke:routes -- http://localhost:3000
npm run smoke:routes -- https://dewtheoryco.com
npm run deploy   # requires Cloudflare auth
```

### Environment variable NAMES only (never commit values)

See `ENV.md` / `.env.example`. Key names: `NEXT_PUBLIC_SITE_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ADMIN_TOTP_SECRET`, `GOOGLE_CALENDAR_*`, `RESEND_API_KEY`, `EMAIL_FROM`, `SKIN_SCRIPT_*`, `AUTO_FULFILL`, `CRON_SECRET`, `XAI_API_KEY`, `STRIPE_VIRTUAL_CONSULTATION_PRICE_ID`, `CONSULTATION_*`, `MEMBERSHIP_PACKAGES_JSON`, `BOOKING_*`.

### Public route inventory

`/`, `/shop`, `/shop/[id]`, `/cart`, `/cart/confirmation`, `/quiz`, `/routine`, `/services`, `/book`, `/virtual-consultation` (+ intake/plan/success), `/about`, `/membership`, `/contact`, `/faq`, `/studio`, legal: `/privacy` `/terms` `/shipping` `/returns` `/booking-policy` `/aesthetic-disclaimer` `/cookies` `/accessibility`, `/admin/*`.

### What this revamp changed

- Design tokens remapped to forest/sage/ivory/stone
- Hero + chrome (nav/footer/announcement/category) retinted
- Homepage editorial IA with Emily motifs + myth-busting education
- About page quote + sage philosophy band
- Contrast fixes for sage bands, `.btn-dew`, footer ivory opacities, shop quiz tile
- Docs: README tokens, this status file, Codex deploy handoff

### What must happen next for “complete”

1. Merge PR for `cursor/brand-revamp-editorial-5502` into `main` (or push if protections allow)
2. `npm run deploy` with Cloudflare credentials → Worker `dew-theory`
3. Verify https://dewtheoryco.com shows ivory ground + forest text + Bodoni motifs
4. Run `npm run smoke:routes -- https://dewtheoryco.com` + manual cart/checkout handoff
5. Record final deployed SHA + Worker version ID in this file and `docs/PRODUCTION_DEPLOY_LOG_*`

If blocked, follow `DEW-THEORY-CODEX-PRODUCTION-DEPLOYMENT-HANDOFF.md`.

---

## HOW TO CONTINUE

1. `git fetch origin && git checkout cursor/brand-revamp-editorial-5502 && git pull`
2. `git status` / `git rev-parse HEAD` / `git log -5 --oneline` — do not trust this file’s SHA alone
3. `npm ci && npm test && npm run build`
4. Merge to `main` through the repo’s permitted PR workflow
5. Deploy: `npm run deploy` (needs `CLOUDFLARE_API_TOKEN` + account, or interactive `wrangler login`)
6. Live-verify dewtheoryco.com + www canonical/HTTPS
7. Update this file’s **CURRENT PRODUCTION STATE** with the new SHA and Worker version

---

## DO NOT FABRICATE

Future agents **must never invent**:

- Products, services, prices, inventory, ingredients, SKUs
- Credentials, licenses, locations, hours, phone numbers
- Testimonials, review counts, ratings, awards, press
- Medical/FDA claims, efficacy percentages, before/after results
- PDRN (or any viral ingredient) as a bookable treatment unless source truth adds it
- Deployment status, Git SHAs, CI results, or “live” claims without direct verification

Git SHAs and production state **change**. Always re-verify with `git`, GitHub, Wrangler/Cloudflare, and HTTPS fetches to https://dewtheoryco.com before declaring success.

Service menu entries in `lib/services.js` remain **placeholder** (see `OPEN_ITEMS.md`) — preserve the “being finalized” disclaimer; do not treat those prices as confirmed business facts.

---

## Architecture notes

| Area | Path / note |
|---|---|
| Shared chrome | `components/Nav.jsx`, `Footer.jsx`, `AnnouncementBar.jsx`, `CategoryNav.jsx` |
| Motion | `Hero.jsx` (canvas dew), `MotionRoot.jsx` (reveals), `MotionBackground.jsx` (ivory wash) |
| Cart | `components/CartProvider.jsx`, `CartView.jsx` |
| Products | `lib/products.js`, `lib/products-server.js`, `data/products.json` |
| SEO | `app/layout.jsx`, `app/sitemap.js`, `app/robots.js`, `components/JsonLd.jsx` |
| Legal | `lib/legal-documents.js`, `public/legal/pdfs/` |
| Deploy | `docs/DEPLOY_DEWTHEORYCO.md`, `wrangler.jsonc`, `open-next.config.ts` |

### Tests run this session (local)

| Gate | Result |
|---|---|
| `npm test` | 192 pass / 0 fail |
| `npm run build` | success |
| `npm run smoke:routes -- http://localhost:3000` | all clear |
| `npm run smoke` checkout | mock checkout OK; admin login 401 without local admin secrets (expected) |
| Production deploy | **not completed** — Cloudflare auth missing |
| Live brand verification of revamp | **blocked** pending deploy |

### Issues found and fixed this session
- Contrast failures on sage bands / `.btn-dew` / footer ivory opacities → fixed
- Shop quiz tile white-on-sage-deep → forest/ivory
- Late-mounted `[data-reveal]` product cards could stay invisible → MotionRoot MutationObserver + rescan

### Remaining technical debt

- Placeholder service menu prices (`OPEN_ITEMS.md`)
- `/studio` still omitted from sitemap
- Stripe / Resend / Calendar secrets for full production commerce email
- Sephora redesign doc (`docs/SEPHORA_INSPIRED_REDESIGN_2026-08.md`) is historical; brand SoT is this file
- GSAP listed in package.json but unused by components

### Chronology (this revamp)

1. Verified repo `marinerxcapital/dew-theory-website`, branch `main` @ `e9f64da`, clean tree
2. Audited architecture, routes, commerce, SEO, production Cloudflare path
3. Created `cursor/brand-revamp-editorial-5502`
4. Remapped tokens; retinted chrome/hero; editorial homepage + about
5. Independent audits found contrast issues → fixed
6. Tests + build + local smoke passed; pushed branch
7. Production deploy blocked → Codex handoff written
