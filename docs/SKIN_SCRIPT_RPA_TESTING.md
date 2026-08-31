# Skin Script RPA Testing

## Node (Dew Theory)

```bash
npm test                    # includes tests/commerce-fulfillment.test.mjs
npm run build
node scripts/check-project-continuity.mjs
```

Coverage: state machine, commerce idempotency, HMAC auth, verified mapping rejection, dropship mock path.

## Python (RPA service)

```bash
cd services/skin-script-rpa
pip install -e ".[dev]"
python3 -m pytest -q
ruff check app tests
```

## CI

`.github/workflows/ci.yml` — Node tests/build, Python tests, Docker build.

## Mock portal scenarios

Append `?scenario=` to mock portal URLs:

| Scenario | Effect |
|----------|--------|
| `oos` | Out of stock |
| `price_drift` | Excessive price |
| `captcha` | CAPTCHA block |
| `mfa` | MFA block |

## Failure injection matrix

Implemented in architecture (Codex handoff for live portal E2E):

- Duplicate Stripe event → idempotent job
- Missing verified mapping → blocked_supplier_mapping
- Kill switch → rpa_disabled
- CAPTCHA/MFA → blocked_human_verification
