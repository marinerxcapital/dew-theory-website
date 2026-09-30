# Screenshot comparison — September 30, 2026

Evidence: original retained captures in docs/revamp/before; final-width candidate captures in docs/revamp/after/font-hints. Earlier before and after full-page exports included a 1,155-pixel canvas for a 390-pixel viewport. The final capture explicitly clips to the requested viewport width; its mobile home image is 390 x 13,804. Baselines are preserved unchanged. Home before/after manually viewed; route-wide correctness is measured by crawler rather than a claim of manual inspection of every image.

Intentional differences:
- Stone/ivory and dark-shop surfaces become the specified light green page, section and card scale; dark surfaces removed.
- Home section bands alternate pale greens; feature cards use green 300 and products green 50. Original transparent product photos remain byte-identical.
- Unified glass wordmark, icon utilities, direct consultation navigation and four-column footer replace split chrome.
- Fraunces SOFT100 headings, Figtree UI and Newsreader article bodies replace mixed legacy typography; body/focus/spacing rules unify routes.
- Buttons use green 700, with visible green focus and accessible UI borders. Decorative green 400 remains separate from functional borders.
- Concern labels follow the shared taxonomy and link to detail pages; live catalog count replaces hardcoded count.
- Placeholder Acai description is hidden, ingredient truncation and multi-product links corrected, one consistently formatted size appears only when known.
- Consultation developer notes are suppressed in production; duplicated heading and Emily markup unified.
- Policy copy and PDFs preserved; duplicate PDF controls collapsed to View/Download; metadata corrected.
- Reduced-motion behavior, static loaded media, lazy closed search and optimized gallery thumbnails reduce startup work without replacing photos or logo originals.
- All offscreen sections expand only during screenshot export, avoiding blank bands; captures retain the requested width.

Unresolved differences are not accepted: intermittent edge hydration recovery; one transient horizontal-overflow result on glycolic-and-retinol-pads (subsequent direct measurement width/scroll 390/390); mobile Lighthouse below required target. CSS-inlining experiment was reversed; failed candidate evidence is retained. Final rollout comparison remains pending because production is still the original version.
