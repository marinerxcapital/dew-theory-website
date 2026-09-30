# Build and deployment log

September 30, 2026 UTC — continuing the September 2026 Green system revamp.

Original active Worker version: 2815c88a-6d37-4ead-b0e6-c6bbde9da72f, 100%, deployed September 28 21:03:41 UTC. This remains the rollback target. Cloudflare/OpenNext is the detected release path.

Isolated C worktree and private C Git object storage preserve the active DeepSeek main source and avoid the full D drive. Existing source snapshot includes 594 hashed files, 115 referenced product images, 36 catalog records / 35 visible. Staged catalog artwork, secrets and runtime data were excluded deliberately. Existing original photos are retained; no replacement catalog rollout occurs here.

Executed builds have exit 0 and 121 prerendered pages. Lint, metadata/token typecheck and 396 unit tests pass. Contrast has 20 tests (14 role ratios plus 6 source/data integrity checks). Initial corrected 294-case crawl: zero axe violations, overflow, broken images or dark sections. Overlay repairs pass search/mobile/concierge axe; focus trapping passes. Commerce 22/22 with simulated redirect contract, separate local customer/favorites test 9/9. External Stripe test-account handoff is NOT verified. Mobile Lighthouse improvements and the final crawl are still being measured; see dated subsequent entries and machine-readable reports.

No green production deployment has happened at this checkpoint. No failed gate will be described as a pass. The original rollback target and source consistency must be rechecked immediately before any release. After release, the main folder needs a git pull after DeepSeek commits or stashes its own work, and orphaned main metadata must be repaired deliberately rather than overwritten.
