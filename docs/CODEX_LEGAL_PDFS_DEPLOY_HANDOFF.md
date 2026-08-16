# Codex production deploy — Dew Theory FIXED V2 legal PDFs (+ redesign if not live)

You have Cloudflare credentials. Deploy canonical `main` of `marinerxcapital/dew-theory-website` to the live domain and verify FIXED V2 legal PDFs.

## Mission

1. Sync and deploy latest `main` to Cloudflare Worker `dew-theory` via `npm run deploy`.
2. Verify https://dewtheoryco.com serves the new legal HTML routes and FIXED V2 PDFs.
3. Confirm no stale/cropped-logo PDF references remain on the live site.

## Repo truth (update SHA after merge)

| Item | Value |
|---|---|
| Repo | `https://github.com/marinerxcapital/dew-theory-website` |
| Branch | `main` |
| Hosting | Cloudflare Workers + OpenNext |
| Worker | `dew-theory` |
| Deploy | `npm run deploy` |
| Docs | `docs/DEPLOY_DEWTHEORYCO.md` |

## Exact steps

```bash
git fetch origin main
git checkout main
git reset --hard origin/main
git rev-parse HEAD
git status   # clean
npx wrangler whoami
npm ci
npm test
npm run build
npm run deploy
```

## Live verification (must all pass)

### Legal HTML routes (200)

```bash
for p in /privacy /terms /shipping /returns /booking-policy /aesthetic-disclaimer /cookies /accessibility; do
  curl -sI "https://dewtheoryco.com$p" | head -1
done
```

### FIXED V2 PDFs (200 + application/pdf)

```bash
for f in \
  DEW_THEORY_PRIVACY_POLICY.pdf \
  DEW_THEORY_TERMS_OF_USE_AND_SALE.pdf \
  DEW_THEORY_SHIPPING_AND_DELIVERY_POLICY.pdf \
  DEW_THEORY_RETURNS_REFUNDS_AND_EXCHANGES_POLICY.pdf \
  DEW_THEORY_BOOKING_CANCELLATION_AND_NO_SHOW_POLICY.pdf \
  DEW_THEORY_AESTHETIC_SERVICES_AND_SKINCARE_DISCLAIMER.pdf \
  DEW_THEORY_COOKIE_AND_TRACKING_TECHNOLOGIES_NOTICE.pdf \
  DEW_THEORY_ACCESSIBILITY_STATEMENT.pdf \
  DEW_THEORY_VIRTUAL_CONSULTATION_TERMS_AND_INFORMED_CONSENT.pdf \
  DEW_THEORY_CONSULTATION_PHOTO_AND_INTAKE_AUTHORIZATION.pdf
do
  url="https://dewtheoryco.com/legal/pdfs/$f"
  code=$(curl -s -o /tmp/dt.pdf -w "%{http_code}" "$url")
  ctype=$(curl -sI "$url" | tr -d '\r' | grep -i content-type)
  magic=$(xxd -l 5 -p /tmp/dt.pdf)
  echo "$code $magic $ctype $f"
done
```

Expect HTTP 200, Content-Type containing `pdf` (or octet-stream), magic `255044462d` (`%PDF-`).

### Visual logo check

Open at least Privacy + Terms PDFs in a browser and confirm the **full Dew Theory logo** (FIXED V2), not a cropped earlier generation.

### Footer

On homepage footer Help column, confirm links:

Terms, Privacy, Shipping, Returns, Booking / Cancellation, Aesthetic Disclaimer, Accessibility, Cookies

Confirm **absent** from footer:

- Legal Open Items
- Claims Audit
- Implementation Guide
- Complete Legal Package
- Minor Guardian Consent
- Treatment Informed Consent
- Consumer Health Data (still conditional / unpublished)

### Flows

- Cart: Policies list → Terms, Privacy, Shipping, Returns
- `/virtual-consultation`: documents listed **before** consent checkbox
- `/book` confirm step: booking + aesthetic + treatment consent PDFs
- `/membership`: pre-launch terms note (membership not live billing)

### Smoke script

```bash
npm run smoke:routes -- https://dewtheoryco.com
```

## Do not

- Rewrite legal PDF contents
- Publish internal docs from `legal/internal/`
- Enable consumer-health footer without explicit publish flag
- Invent membership pricing or enable recurring billing

## Done when

Live domain returns 200 for all public legal routes + FIXED V2 PDFs, footer is correct, VC/booking/cart links resolve, and visual PDF logo check passes.
