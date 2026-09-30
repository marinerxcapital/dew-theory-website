import { ROUTINE_TIMELINE, routinePlacement } from '@/lib/routine';

/**
 * Routine position — where this product sits in the professional layering order.
 *
 * Categories, step order, and AM/PM labels all come from `ROUTINE_TIMELINE`
 * (real catalog categories only, time labels taken from product copy). Products
 * that are not a routine step — a kit, for instance — render nothing.
 *
 * Rendered as an ordered list so the sequence is meaningful without CSS, and the
 * current step carries `aria-current="step"` rather than relying on colour.
 */
export default function RoutinePlacement({ product, className = '' }) {
  const placement = routinePlacement(product?.category);
  if (!placement) return null;

  const where = placement.before
    ? `After ${placement.before}${placement.after ? `, before ${placement.after}` : ''}`
    : `First step${placement.after ? `, before ${placement.after}` : ''}`;

  return (
    <section
      className={`mt-16 border-t border-border pt-12 ${className}`}
      aria-labelledby="routine-placement-heading"
    >
      <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew">
        Where it fits
      </p>
      <h2
        id="routine-placement-heading"
        className="mt-2 font-display text-[clamp(1.7rem,3.2vw,2.2rem)] font-normal text-ink"
      >
        Step {placement.position} of {placement.total}
      </h2>
      <p className="mt-3 max-w-xl font-body text-sm font-normal leading-relaxed text-muted">
        Professional layering order, thin to thick. {where}
        {placement.time ? ` · ${placement.time}` : ''}
      </p>

      <ol className="mt-8 flex flex-wrap items-stretch gap-x-2 gap-y-3">
        {ROUTINE_TIMELINE.map((step, i) => {
          const current = i === placement.index;
          return (
            <li key={step.category} className="flex items-stretch">
              <div
                aria-current={current ? 'step' : undefined}
                className={
                  current
                    ? 'flex min-h-[48px] min-w-[7.5rem] flex-col justify-center border border-pink/50 bg-pink-wash px-3 py-2'
                    : 'flex min-h-[48px] min-w-[7.5rem] flex-col justify-center border border-border px-3 py-2'
                }
              >
                <span
                  className={
                    current
                      ? 'font-label text-[0.7rem] font-normal uppercase tracking-lockup text-pink-bright'
                      : 'font-label text-[0.7rem] font-normal uppercase tracking-lockup text-muted'
                  }
                >
                  {step.category}
                </span>
                <span className="mt-1 font-label text-[0.55rem] font-normal uppercase tracking-lockup text-muted">
                  {current ? (
                    <>
                      <span className="sr-only">Current step. </span>
                      This product
                      {step.time ? ` · ${step.time}` : ''}
                    </>
                  ) : (
                    step.time || '\u00A0'
                  )}
                </span>
              </div>
              {i < ROUTINE_TIMELINE.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="self-center px-1 font-label text-[0.7rem] text-muted"
                >
                  →
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
