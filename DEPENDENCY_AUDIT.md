# Dependency audit — polish A3

**Date:** 2026-07-19  
**Command baseline:** `npm audit` after upgrades

## Changes made

| Package | From | To | Why |
|---|---|---|---|
| `next` | 15.1.6 | **15.5.20** | Critical advisories (RCE flight protocol, middleware bypass, cache poisoning, DoS, etc.) |
| `react` / `react-dom` | 19.0.0 | **19.2.7** | Stay current on React 19 line with Next 15.5 |
| `postcss` | 8.4.49 | **8.5.19** | Moderate XSS in CSS stringify (`GHSA-qx2v-qp2m-jg93`) |
| `overrides.postcss` | — | **^8.5.19** | Force nested `next` postcss off vulnerable range |

## Audit result

```
found 0 vulnerabilities
```

## Intentionally not bumped (this pass)

| Package | Current | Latest noted | Reason |
|---|---|---|---|
| `gsap` | 3.12.5 | 3.15.x | Animation API may change; no security flag |
| `tailwindcss` | 3.4.17 | 4.x | Major rewrite; out of scope for A3 |
| `autoprefixer` | 10.4.20 | 10.5.x | No advisory |
| `next` 16.x | — | 16.2.x | Major major; stay on 15.5 LTS-style line until planned upgrade |

## Residual notes

- No medium/high/critical remain after overrides.
- Re-run `npm audit` after any future `npm install`.
- Parent folder `C:\Users\Skyler B. Brown\package-lock.json` can confuse Next tracing; mitigated via `outputFileTracingRoot` in `next.config.mjs`.

This section is folded into `POLISH_REPORT.md` at N3.
