import Link from 'next/link';
import { formatRoutinePosition, ROUTINE_ORDER } from '@/lib/routine';

/**
 * Visual routine position for PDP — where this product sits in layering order.
 */
export default function RoutinePosition({ product, className = '' }) {
  if (!product?.category) return null;

  const pos = formatRoutinePosition(product);
  const activeCategory = product.category;
  const inOrder = ROUTINE_ORDER.includes(activeCategory);

  return (
    <section
      className={`border border-border bg-white px-4 py-5 sm:px-5 ${className}`.trim()}
      aria-labelledby="routine-position-heading"
    >
      <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
        Routine position
      </p>
      <h2
        id="routine-position-heading"
        className="mt-2 font-display text-xl font-normal text-ink sm:text-2xl"
      >
        {pos.headline}
      </h2>
      <p className="mt-2 font-label text-[0.58rem] uppercase tracking-lockup text-sage-deep">
        {pos.timeLabel}
      </p>
      <p className="mt-3 font-body text-sm font-normal leading-relaxed text-muted">
        {pos.detail}
      </p>

      {inOrder ? (
        <ol
          className="mt-5 flex flex-wrap gap-1.5"
          aria-label="Typical layering order"
        >
          {ROUTINE_ORDER.map((cat) => {
            const active = cat === activeCategory;
            return (
              <li key={cat}>
                <Link
                  href={`/shop?type=${encodeURIComponent(cat)}`}
                  className={`inline-flex rounded-card border px-2.5 py-1.5 font-label text-[0.55rem] uppercase tracking-lockup transition-colors ${
                    active
                      ? 'border-ink bg-green-300 text-ivory'
                      : 'border-border bg-surface-light text-muted hover:border-ink/40 hover:text-ink'
                  }`}
                  aria-current={active ? 'step' : undefined}
                >
                  {cat}
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 font-body text-xs text-muted">
          This category sits outside the core daily sequence — follow the product directions.
        </p>
      )}

      {(pos.neighbors.before || pos.neighbors.after) && (
        <p className="mt-4 font-body text-xs leading-relaxed text-muted">
          {pos.neighbors.before ? (
            <>
              After <span className="text-ink">{pos.neighbors.before}</span>
              {pos.neighbors.after ? ' · ' : ''}
            </>
          ) : null}
          {pos.neighbors.after ? (
            <>
              Before <span className="text-ink">{pos.neighbors.after}</span>
            </>
          ) : null}
        </p>
      )}
    </section>
  );
}
