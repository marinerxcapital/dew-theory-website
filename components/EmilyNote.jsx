/**
 * Emily / studio note for PDP.
 * Only uses authentic product fields (emily_note, studio_note, description).
 * Never invents personal endorsement quotes. Generic barrier-first guidance
 * is unlabeled as a quote when no authentic note exists.
 */
export default function EmilyNote({ product, className = '' }) {
  if (!product) return null;

  const authentic = [
    product.emily_note,
    product.studio_note,
    product.description
  ]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .find(Boolean);

  if (authentic) {
    return (
      <aside
        className={`border border-border bg-sage-soft/40 px-4 py-4 sm:px-5 ${className}`.trim()}
        aria-labelledby="emily-note-heading"
      >
        <p
          id="emily-note-heading"
          className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-sage-deep"
        >
          Emily&apos;s note
        </p>
        <p className="mt-3 font-display text-lg font-normal leading-snug text-ink sm:text-xl">
          {authentic}
        </p>
      </aside>
    );
  }

  // No authentic note — generic barrier-first guidance only (not a personal quote).
  const generic = genericBarrierGuidance(product.category);
  if (!generic) return null;

  return (
    <aside
      className={`border border-border bg-surface-light px-4 py-4 sm:px-5 ${className}`.trim()}
      aria-labelledby="studio-guidance-heading"
    >
      <p
        id="studio-guidance-heading"
        className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted"
      >
        Barrier-first guidance
      </p>
      <p className="mt-3 font-body text-sm font-normal leading-relaxed text-muted">
        {generic}
      </p>
    </aside>
  );
}

function genericBarrierGuidance(category) {
  switch (category) {
    case 'Exfoliant':
      return 'Introduce acids slowly and always follow with moisturizer. Use SPF in the morning when this is in your routine.';
    case 'Serum':
      return 'Apply on clean, slightly damp skin, then seal with moisturizer so hydration does not evaporate.';
    case 'Cleanser':
      return 'Cleanse without stripping — if skin feels tight after rinse, follow promptly with toner or serum and cream.';
    case 'SPF':
      return 'Last step in the morning only. Apply after moisturizer has settled.';
    case 'Moisturizer':
      return 'Seal water-based layers. If you are using actives, moisturizer comes after — not before.';
    case 'Toner':
      return 'Use after cleanse to prep absorption. Keep the rest of the routine gentle if your barrier feels reactive.';
    case 'Mask':
      return 'Treat as an as-needed step around your daily cleanse → treat → moisturize sequence.';
    default:
      return 'Build around barrier support: cleanse, treat, moisturize — and SPF every morning.';
  }
}
