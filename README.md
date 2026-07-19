# Dew Theory

Motion-first skincare site. Next.js 15 (App Router), Tailwind CSS, GSAP + ScrollTrigger.

Full storefront + admin portal: shop, product detail, cart/checkout, booking, and
`/admin` (products, orders, discounts, analytics, Skin Script CSV import).

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

### Admin (local)

- URL: http://localhost:3000/admin/login
- Defaults: `admin@dewtheory.local` / `dew-admin-dev` (override in `.env.local` — see `.env.example`)
- Promo code seed: `DEW15` (15% placeholder — not a confirmed client rate)

### Checkout (mock vs Stripe)

| Keys | Behavior |
|---|---|
| No `STRIPE_SECRET_KEY` | **Mock** — order saved as paid, confirmation via `?order=` |
| `STRIPE_SECRET_KEY` set | **Stripe Checkout** — redirect; success uses `?session_id=` |

Webhook (paid → order status): `POST /api/webhooks/stripe` needs `STRIPE_WEBHOOK_SECRET`.  
Full notes: [`docs/STRIPE.md`](docs/STRIPE.md). Env template: [`ENV.md`](ENV.md).

### Tests & smoke

```bash
npm test                          # unit + offline order-path
npm run dev                       # then in another terminal:
npm run smoke                     # HTTP: checkout → admin status update
```

Order path docs: [`docs/ORDER_PATH.md`](docs/ORDER_PATH.md).

## Design tokens

Every colour was sampled directly from the wordmark artwork with k-means clustering,
not chosen by eye.

| Token | Hex | Role |
|---|---|---|
| `pearl` | `#F4F6F7` | Ground |
| `ivory` | `#F1ECE6` | Warm alternate band — the Emily section only |
| `chrome` | `#828F9A` | Mercury mid-tone: labels, rules, eyebrows |
| `graphite` | `#2D2F3A` | Headlines and the primary CTA |
| `ice` | `#C4DAE9` | Cool highlight |
| `lavender` | `#CECDE1` | Opal highlight |
| `blush` | `#DEC2CF` | Warm highlight |
| `charcoal` | `#24262C` | Body text only |

No pure black, no pure white, no saturated colour anywhere.

**Type**
- Display — Bodoni Moda. The didone thick/thin modulation matches the wordmark's hairline serifs.
- Label — Jost 300, uppercase, tracked to `0.34em`, mirroring the `SKIN —— CARE` lockup.
- Body — Karla 300. Chosen to recede.

## Where the motion lives

- `components/Hero.jsx` — the signature moment. Pointer-tracked specular highlight
  (`--sweep-x` / `--sweep-y` CSS variables) plus the wordmark catching light on load.
- `components/MotionRoot.jsx` — all sitewide motion. Scroll reveals, staggering, nav frosting,
  route cross-fade. One `gsap.matchMedia()` call splits animated and reduced-motion behaviour.
- `app/globals.css` — the material language: `.chrome-text`, `.specular`, `.iridescent`,
  `.glass-1` / `.glass-2`, `.sweep`.

`prefers-reduced-motion` is handled in three places: the GSAP matchMedia branch, a CSS
override that collapses all durations, and an early return in the hero's pointer listener.

## Structural device

`components/Rule.jsx` reproduces the logo's `SKIN —— CARE` lockup. It is used **only** where two
things are genuinely paired — `Products —— Services`, `60 min —— $145`, `Aesthetician —— Licensed` —
never as decoration.

## Assets

| File | Notes |
|---|---|
| `public/logo.webp` | 520 px wide, used by `components/Wordmark.jsx` |
| `public/logo.png` | Full-resolution original |
| `public/hero.mp4` | Web-optimised, 872 KB, H.264 faststart, silent |
| `public/hero-original.mp4` | Your untouched 3.1 MB original |
| `public/hero-poster.webp` | Poster frame for slow connections |

`Wordmark.jsx` probes for `/logo.webp` at runtime. If it is ever missing, the component falls back
to live chrome-gradient type — so the brand never disappears.

See `OPEN_ITEMS.md` before putting this in front of a customer.

## Product catalog and admin-system spec

`data/products.json` holds the real eight-product Skin Script catalog: categorized per the client's
own instructions, priced at wholesale × 2, with ingredients and usage researched from Skin Script's
own listings — not invented. `lib/products.js` reads it; the Home page's three feature cards pull from
it directly.

`DEW_THEORY_BUILD_PROMPT_ADDENDUM.md` extends the original build prompt with three subsystems not in
the original brief: pricing/discount/shipping logic, an admin portal (`/admin`, separate auth, product
CRUD, order queue, discount codes), and an analytics dashboard — plus an honest breakdown of what's
actually buildable today versus what depends on Skin Script confirming a real integration exists
(Section 16). Read this alongside the original prompt, not instead of it.

