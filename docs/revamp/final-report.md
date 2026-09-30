# Dew Theory Green Revamp — release report, September 30, 2026

**Status: incomplete; public deployment held.** Required QA gates do not pass. GitHub CI cannot start because the account is locked due to a billing issue. No main push or public traffic switch occurred.

## Release and commits
- Live URL remains https://dewtheoryco.com on original production/rollback Worker **2815c88a-6d37-4ead-b0e6-c6bbde9da72f**, 100% traffic.
- Latest candidate **54592990-4358-4771-af41-58ce70bb75d9**, 0% public traffic. Preview deployment: **2026-09-30T14:04:07.342964Z**, provider readback provider-hydration-readback.json. It is tested using a same-origin version override header; no public version URL exists for this Durable Objects Worker.
- Local source checkpoint **1dc3424af886038ee8f8d485f54029a25ec287ac**; remote source checkpoint **92c65047afc267fefd9bf6df8806c89bbdda09f8**. Exact tree matches **1f7fd9c3997f50888266d796ade9e5f86fb7ecb6**.
- Earlier checkpoint **4bd78d4a03ffc295fab3f68780fb68f5eea04f81** published as **b45ff05a904829a24b54cb91d8362d15f8169e60**, equal tree 22f550a7395d8e5415ef61e9cf7936cc4aa47f78. Native Git authentication unavailable; authenticated connector publication fast-forwarded the branch without rewriting existing remote history.
- Local commits: commits-local.txt; source/publication mappings: publication-update.json. Review: https://github.com/marinerxcapital/dew-theory-website/pull/27 (draft, unmerged).
- Final report/evidence updates are preserved in a further local documentation commit; no claim that main or production received them.

## Files and design
Complete changed/deleted path listing: files-checkpoint.tsv. Shared layout, green tokens, typography, metadata, product presentation, consultation copy, data normalization, QA/release scripts, icons/OG, preserved serving-source additions, photos and append-only continuity files are included. Original logo artwork, catalog photos, prices, stock, names/URLs, ingredient facts, shipping/checkout rules, provider variables/secrets and legal PDF bytes are preserved. Retired legacy artwork/FAQ paths are archived with their hashes; see legacy asset manifests. No main-folder files were deleted or edited.

## Latest executed QA
| Check | Result |
|---|---|
| Lint / typecheck / OpenNext production build | Pass, zero errors |
| Unit tests | 396/396, 130 suites |
| Contrast / integrity | 20/20: 14 declared color roles, six integrity checks |
| Catalog assets | 115/115 resolve, byte-identical; no packaged fixtures/secrets; legal PDF hashes unchanged |
| Source preservation | 594 snapshot files unchanged, protected files and product projections equal |
| Live catalog comparison | 115 photo hashes and 35 storefront prices match original production |
| Latest edge commerce | 22/22; add/quantity/shipping, quiz AM/PM routines, consultation validation and simulated redirect contract |
| Real external Stripe handoff | Existing sandbox hosted page loaded; no charge/card input; separate real evidence retained |
| Favorites | Earlier local authenticated test 9/9; production guard audited, authenticated owner session not used |
| Full latest edge crawl | 98 routes x 3 widths = 294 cases, zero navigation failures |
| Axe / overflow / broken images / dark bands | Zero across 294 cases |
| Console | Four unexpected React hydration errors; three intentional missing-route 404 messages |
| Metadata / unified chrome | Present across crawl; cart/account noindex retained; active UI raw-hex scan passes |
| CI | Jobs did not start: account locked due to billing issue; run 36722802894, ci-annotations.json |

| Mobile Lighthouse page | Performance | Accessibility | LCP | CLS |
|---|---:|---:|---:|---:|
| Home | 87 | 100 | 3.396 s | 0 |
| Shop | 82 | 100 | 3.235 s | 0 |
| Green Tea Citrus Cleanser | 86 | 100 | 3.236 s | 0 |

Performance/LCP targets fail. Four hydration recoveries remain: /help at 390, /admin/analytics at 1440, /shop/charcoal-clay-cleanser at 1440, /shop/lip-balm-with-spf-15 at 390. Browser-only diagnostic located an unconsumed streamed Suspense comment at root main during navigation. Deferring cart startup did not fully resolve it; it is not reported as fixed. Release-gates.json remains false.

## Screenshots and comparison
- Existing baseline: docs/revamp/before/ (preserved; no recapture).
- Latest candidate: docs/revamp/after/hydration-transition/ (294 captures at 390, 768, 1440).
- Font-hint and earlier failed candidate reports retained for comparison.
- Intentional differences and screenshot export correction: screenshot-comparison.md. Original mobile full-page baseline includes an oversized canvas; latest exports clip to the exact viewport width and expand offscreen content only for capture. Manual home comparison plus automated route checks; no claim of manual review of all images.

## Concurrency and reconciliation
Work performed only in C:\Users\Skyler B. Brown\Desktop\dew-theory-codex. DeepSeek V4 Pro serving-source folder retained read-only. Snapshot newer serving source deliberately differs from origin/main; those source/assets were preserved and protected projections verified rather than deploying the older remote tree. The D: Git hub main retains 128 tracked dirty files at fa0e6bd. Last fetch had zero origin-only commits relative to local branch; no conflicts encountered. No rebase/merge occurred because release gates remain failed. No Node/npm/DeepSeek process killed. C: space checked before every build; no main cleanup.

After the DeepSeek session commits or stashes its work, the main folder needs git pull once a release is actually merged. Its serving-source checkout has an orphan Git link; preserve its changes before repairing that link. Do not pull/rebase/reset its dirty tree during concurrent work.

## Owner review
- Shipping contains internal operations copy; Returns contains confirmation placeholders. Both preserved under the legal-text rule.
- Acai Berry Moisturizer needs real description; placeholder is hidden.
- Review consultation price display without changing configured amounts.
- Confirm hello@dewtheory.studio versus dewtheoryco.com contact identity.
- Twenty-seven catalog records have empty declared concerns/actives; preserved without inventing facts.
- Existing production Stripe configuration is sandbox/test mode; unchanged under the secrets/config rule.
- Resolve GitHub account billing lock before CI can satisfy the required acceptance gate.
- Authenticated production admin/account/favorites content and customer-specific intake/plan were not opened with real owner credentials. Guards and synthetic local flows were verified; real protected content remains unverified.

## Held or skipped
Main push, rebase for release, public green deployment, production-wide post-release crawl and CDN purge are held because mandatory performance/console/CI gates fail. No public rollout means no rollback was necessary; original Worker remains the rollback target. Historical documentation/artwork/logo/SQL colors remain immutable exceptions to the active-UI token scan. Cookie banner/cart drawer/toast variants absent from source were not invented. Actual charge/webhook mutation was not performed. No successful completion or deployment claim is made.
