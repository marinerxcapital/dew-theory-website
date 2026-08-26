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
| Live production SHA (verified deployed) | `32e22dbe739861e6781ec32dbb9448cb76323c91` (2026-08-26, owner-removal correction) |
| Worker | `dew-theory` (Cloudflare Workers via OpenNext) |
| Current Worker version ID | `f9322bb9-7560-4e1e-8058-219bf663c5d1` |
| Revamp branch | `cursor/brand-revamp-editorial-5502` |
| Revamp commit (implementation) | `e4e036df18fccccbf36157de343419fce07218f1` on `cursor/brand-revamp-editorial-5502` (PR #7); squash merge `17d4849a0c3bb502d2341552ee5573a12f46472f` has an empty tree diff vs this audited head |
| Live design as of 2026-08-26 correction deploy | **Simplified + sage hero live**: sage `#93A890` hero, forest text, Bodoni motifs, and the Dew Theory logo artwork. Homepage is hero + Emily's Picks product rail only; primary menu is Shop / Skin Quiz / Virtual Consult / Emily / Contact / FAQ. Removed offerings (`/routine`, `/services`, `/membership`, `/book`) are unpublished and return the application 404. |
| Deploy blocker this session | Cleared in Codex environment via existing Wrangler OAuth for `skyler@marinerxcapital.com`; no secret values exposed |

**Live smoke (production, 2026-08-26 correction):** `https://dewtheoryco.com` and `www` return HTTP 200 over HTTPS and serve the simplified build (removed homepage copy absent; `Shop Skin Script` + `Take the Skin Quiz` + `Emily's picks` present; sage `#93A890` hero compiled into the CSS). Removed routes `/routine`, `/services`, `/membership`, `/book` return the application 404 (verified with and without cache-busting). Cloudflare deployment readback shows Worker version `f9322bb9-7560-4e1e-8058-219bf663c5d1`.

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

`/`, `/shop`, `/shop/[id]`, `/cart`, `/cart/confirmation`, `/quiz`, `/virtual-consultation` (+ intake/plan/success), `/about`, `/contact`, `/faq`, `/studio` (redirects to `/about`), legal: `/privacy` `/terms` `/shipping` `/returns` `/booking-policy` `/aesthetic-disclaimer` `/cookies` `/accessibility`, `/admin/*`.

**Unpublished (return the application 404):** `/routine`, `/services`, `/membership`, `/book`.

### What this revamp changed

- Design tokens remapped to forest/sage/ivory/stone
- Hero + chrome (nav/footer/announcement/category) retinted
- Homepage editorial IA with Emily motifs + myth-busting education
- About page quote + sage philosophy band
- Contrast fixes for sage bands, `.btn-dew`, footer ivory opacities, shop quiz tile
- Docs: README tokens, this status file, Codex deploy handoff

### What must happen next for “complete”

1. PR #7 merged into `main` as squash merge `17d4849a0c3bb502d2341552ee5573a12f46472f`
2. `npm run deploy` completed for Worker `dew-theory`
3. https://dewtheoryco.com verified live with ivory ground + forest text + Bodoni motifs
4. `npm run smoke:routes -- https://dewtheoryco.com` passed; browser smoke passed cart/checkout handoff and mobile checks
5. Final deployed SHA + Worker version ID recorded here and in `docs/PRODUCTION_DEPLOY_LOG_2026-08-25.md`

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
| Production deploy | completed from `main` `17d4849a0c3bb502d2341552ee5573a12f46472f` (revamp) then `bb3a48c8e42bb0583e700ef9d4b11e765c2577f6` (logo) |
| Live brand verification of revamp | passed on apex production domain |
| Live logo verification | passed on apex + www: `logo-dewtheory-20260825.webp` (hero), `logo-dewtheory-mark-20260825.webp` (nav/favicon), `logo-dewtheory-ivory-20260825.webp` (footer), `logo-dewtheory-og-20260825.png` (OG) all served with transparent lossless alpha |

### Issues found and fixed this session
- Contrast failures on sage bands / `.btn-dew` / footer ivory opacities → fixed
- Shop quiz tile white-on-sage-deep → forest/ivory
- Late-mounted `[data-reveal]` product cards could stay invisible → MotionRoot MutationObserver + rescan

### 2026-08-25 Codex production deploy closeout

- PR #7 is merged. GitHub reports merge commit `17d4849a0c3bb502d2341552ee5573a12f46472f`; remote branch head `e4e036df18fccccbf36157de343419fce07218f1`; tree diff between them is empty.
- Local gates rerun after fresh clone: `npm ci` completed with 8 existing audit findings (1 moderate, 7 high); `npm test` passed 192/192; `npm run build` passed and generated 67/67 pages.
- `npm run deploy` completed via OpenNext/Cloudflare. Worker `dew-theory` Current Version ID: `c76d0236-07e4-47b1-9e49-e413664e80e9`; deployment created `2026-08-25T22:57:41.090Z` and read back at 100%.
- Apex and www roots returned HTTP 200 from Cloudflare. Route smoke passed all configured public routes and PDFs.
- Browser smoke passed: editorial brand signals, computed brand token wiring, shop card reveal after scroll, add-to-cart, cart quantity update/remove, checkout handoff without paid order, checkout policy links, mobile nav, and no horizontal overflow on `/`, `/shop`, `/cart`, `/privacy`, `/terms`.

### 2026-08-25 Codex logo replacement closeout

- Commit `bb3a48c8e42bb0583e700ef9d4b11e765c2577f6` (`feat(brand): replace Dew Theory logo assets`) replaced the wordmark lockup, nav mark, footer ivory lockup, favicon, and OG/social image across `Nav`, `Hero`, `Footer`, `Wordmark`, `layout`, home/shop/virtual-consultation metadata, `site.webmanifest`, and `_headers`.
- Deployed as Worker version `2f3d66be-106a-4c52-9060-26b5ee3a94bf` (`2026-08-25T23:33:19.034Z`), read back at 100%.
- Verified live on apex + www: all logo asset URLs return HTTP 200; the new WEBP assets are lossless (`VP8L`) with alpha so they blend into the ivory/forest/sage surfaces without a bounding box; the `1200x630` OG PNG is a full-bleed social card (opaque by design).
- No code references the legacy `/logo.webp`, `/logo.png`, or `/logo-mark.webp` paths except the backwards-compatible cache rules in `public/_headers`; the legacy files remain as in-place copies of the new artwork.

### 2026-08-26 Codex owner simplification closeout

- Commit `4b69747e7ef2fdc65c54e108d57624946fb71269` (`feat: simplify Dew Theory site per owner feedback`) shipped the owner's reduction pass and deployed as Worker version `98313824-e97d-480a-ba84-059be65de309` (`2026-08-26T00:51:15.450Z`), read back at 100%.
- Sage hero: `.hero-stage` now uses the approved sage token `#93A890` with a subtle `#5B7356` radial accent; the pale product-photo/wash/caustic background was removed.
- Homepage reduced to hero + `Emily's picks` product rail. Removed: philosophy (`a calm monday`), trust strip, reassurance band, myth-busting/viral-caution block, PDRN card, shop-by-concern/type, quiz feature, routine builder, starter kits, services, virtual-consultation/Emily, and FAQ/membership homepage sections.
- Primary menu simplified to Shop / Skin Quiz / Virtual Consult / Emily / Contact / FAQ. `Book a Facial`/`Book` removed from mobile menu, desktop utilities nav, footer CTA/Services column, and the sticky mobile bar.
- Mobile sticky CTA collapsed to a single full-width `Shop` button with safe-area handling intact.
- Preserved routes `/routine`, `/services`, `/membership`, `/book`, `/virtual-consultation`, and catalog/checkout/search/legal remain live and indexable.
- Gates: `npm test` 192/192, `npm run build` success, production route/PDF smoke `all clear`.

### 2026-08-26 Codex owner-removal correction closeout (this pass supersedes the prior one)

The prior "simplification" closeout above is **incomplete**. It removed Routine/Services/Membership/Book a Facial from the primary menu while leaving the same features publicly reachable through the footer, the global search index, the sitemap, internal cross-links, and the live `/routine` `/services` `/membership` `/book` routes (all returned HTTP 200). That directly contradicted Emily's annotated request.

Correction commit `32e22dbe739861e6781ec32dbb9448cb76323c91` (`fix: complete Dew Theory owner-requested removals`) removes the four offerings from the current public experience:

- **Routes unpublished:** deleted `app/routine/page.jsx`, `app/services/page.jsx`, `app/membership/page.jsx`, and `app/book/page.jsx`. All four paths now return the application 404. Source for later restoration is preserved in git history; backend API routes and dead `RoutineBuilder`/`BookingFlow`/`MembershipInterestForm` components were intentionally left as archived code.
- **Footer corrected:** removed `Routine builder`, the `Services` column, and `Membership`. `Virtual consultation` moved into the `Dew Theory` column. Grid reduced from 5 to 4 columns. Removed the "in-studio facials" tagline phrase.
- **Search index cleaned:** removed the Routine Builder / Services / Book a Facial / Membership static pages and the `SERVICES` loop from `lib/search.js`.
- **Sitemap cleaned:** removed `/routine`, `/services`, `/book`, `/membership` from `app/sitemap.js`.
- **Cross-links removed:** cleared `/routine`, `/services`, `/membership`, `/book` links and CTAs from shop/PDP, quiz, about, FAQ, skin-quiz results, "Emily pairs with", cart, cart confirmation, contact form topic, 404 page, booking-policy/aesthetic-disclaimer related links, and the (redirected) studio page.
- **Metadata/structured data:** removed "book treatments / book facials" from homepage/layout metadata and removed the `In-studio facial` offer (`/book`) from the `BeautySalon` JSON-LD.
- **Sticky CTA:** confirmed single full-width `Shop` action (no `Book a Facial`).
- **Mobile menu:** confirmed exactly Shop / Skin Quiz / Virtual Consult / Emily / Contact / FAQ plus Shop-by-type catalog categories.

**Live verification (production):** apex + www return HTTP 200; `/routine`, `/services`, `/membership`, `/book` return 404; sage `#93A890` hero confirmed in compiled CSS; homepage removed copy (`a calm monday`, `worst advice`, `tiktok made me do it`, `what is PDRN`, trust-strip copy) absent; `Shop Skin Script` + `Take the Skin Quiz` + `Emily's picks` present. Browser verification (headless Chromium, 390px + 1280px) confirmed the mobile menu, desktop category nav, footer, and sticky CTA match the owner request.

**Do not reintroduce** Routine, Services, Membership, or Book a Facial into the public site unless Emily explicitly asks. Git history is the restore point.

### Remaining technical debt

- Placeholder service menu prices (`OPEN_ITEMS.md`)
- `/studio` still omitted from sitemap
- Stripe / Resend / Calendar secrets for full production commerce email
- Sephora redesign doc (`docs/SEPHORA_INSPIRED_REDESIGN_2026-08.md`) is historical; brand SoT is this file
- GSAP listed in package.json but unused by components
- Homepage is intentionally minimal per owner direction; prior editorial/educational sections are preserved in git history for later reintroduction

### Chronology (this revamp)

1. Verified repo `marinerxcapital/dew-theory-website`, branch `main` @ `e9f64da`, clean tree
2. Audited architecture, routes, commerce, SEO, production Cloudflare path
3. Created `cursor/brand-revamp-editorial-5502`
4. Remapped tokens; retinted chrome/hero; editorial homepage + about
5. Independent audits found contrast issues → fixed
6. Tests + build + local smoke passed; pushed branch
7. Production deploy blocked → Codex handoff written
8. PR #7 merged; `npm run deploy` shipped revamp as Worker `c76d0236-07e4-47b1-9e49-e413664e80e9`
9. Brand logo replacement committed (`bb3a48c`) and deployed as Worker `2f3d66be-106a-4c52-9060-26b5ee3a94bf`; verified live on apex + www
10. Owner simplification committed (`4b69747`) and deployed as Worker `98313824-e97d-480a-ba84-059be65de309`; verified live on apex + www
