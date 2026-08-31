# Skin Script RPA Security

## Authentication

- Dew Theory → RPA: HMAC-SHA256 with timestamp, nonce, body digest
- Replay protection via nonce store (`hmac_nonces` table / commerce backend)
- Clock skew bounded (`HMAC_CLOCK_SKEW_SEC`, default 300s)

## Credentials

Never commit: portal username/password, storageState, HMAC secret, Stripe secrets.

## Payment policy

RPA selects **saved/tokenized payment methods** on authorized wholesale account only.
Never store PAN/CVV in env, logs, or repo.

## Anti-bot policy

No CAPTCHA solvers, MFA bypass, fingerprint evasion, or proxy rotation.
Challenges → blocked state + alert.

## PII / artifacts

Screenshots/traces are sensitive — short retention, no CI artifacts, no payment screen captures.

## Financial circuit breakers

- `SKIN_SCRIPT_MAX_ORDER_TOTAL_CENTS`
- `SKIN_SCRIPT_MAX_LINE_QUANTITY`
- `SKIN_SCRIPT_PRICE_TOLERANCE_PERCENT`

## Network

RPA API exposes domain operations only — no generic `/navigate` or `/click` endpoints.
Supplier URLs server-controlled and allowlisted.
