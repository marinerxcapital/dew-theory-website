# Skin Script RPA Troubleshooting

| Symptom | Likely cause | Action |
|---------|----------------|--------|
| `blocked_supplier_mapping` | Unverified/missing mapping | Admin verify mappings; see mapping.js |
| `blocked_human_verification` | CAPTCHA/MFA on portal | Complete bootstrap-session; do not bypass |
| `blocked_payment_authentication` | CVV/challenge required | Escalate — may need saved token flow |
| `submission_ambiguous` | Click succeeded, confirmation lost | Reconcile order history before retry |
| `rpa_disabled` | Kill switch | Set `SKIN_SCRIPT_RPA_ENABLED=true` when safe |
| `hmac_replay` | Duplicate request nonce | Expected protection — use fresh nonce |
| Orders lost on Worker | D1 not provisioned | Provision DEW_THEORY_D1 binding |
| `supplier_layout_changed` | Selector drift | Update selectors.json after portal recon |

Logs: structured JSON via `lib/log.js` and RPA service stdout.

Admin: `/admin/orders/[id]` + `GET /api/admin/orders/[id]/fulfillment`
