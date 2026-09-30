import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import QuickAdd from '@/components/QuickAdd';
import { formatMoney } from '@/lib/shipping';
import { isOutOfStock, stockLabel } from '@/lib/shop';
import { spectralStyle } from '@/lib/spectral';

/**
 * Product card.
 *
 * The photograph bleeds to the card edge with no padding around it, so the
 * product — not the frame — is the object. On hover the hairline turns pink, the
 * object tilts a few degrees toward the pointer (driven by the single delegated
 * controller in CardTilt via `data-tilt`), the name and price lift 2px, and a
 * ghost add-to-bag rises from the bottom edge.
 *
 * This stays a server component: the only interactive node is the add-to-bag
 * button, so a grid of thirty products costs one client boundary, not thirty.
 *
 * Accessibility note: the card link deliberately carries no `aria-label`. An
 * aria-label overrides the descendant text, which hid the price and concern from
 * assistive tech and failed the label/name-mismatch rule. The visible content is
 * already the correct accessible name.
 *
 * @param {{
 *   product: object,
 *   compact?: boolean,
 *   showQuickAdd?: boolean,
 *   emilyPick?: boolean,
 *   revealIndex?: number,
 *   priority?: boolean
 * }} props
 */
export default function ProductCard({
  product,
  compact = false,
  showQuickAdd = true,
  emilyPick = false,
  revealIndex,
  priority = false
}) {
  const oos = isOutOfStock(product);
  const badge = stockLabel(product);
  const concern = Array.isArray(product.conditions_addressed)
    ? product.conditions_addressed[0]
    : null;

  return (
    <article
      data-tilt
      data-reveal
      data-stagger={typeof revealIndex === 'number' ? String(revealIndex % 8) : undefined}
      style={spectralStyle()}
      className="product-card card-edge group flex h-full flex-col overflow-hidden rounded-card border bg-surface"
    >
      <Link prefetch={false}
        href={`/shop/${product.id}`}
        className="flex flex-1 flex-col"
      >
        <div className={`relative bg-void ${oos ? 'opacity-55' : ''}`}>
          <ProductImage
            product={product}
            priority={priority}
            sizes={
              compact
                ? '(max-width: 768px) 70vw, 20vw'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            }
          />

          {badge ? (
            <span className="absolute left-3 top-3 z-[2] border border-border bg-void/85 px-2.5 py-1 font-body text-[0.55rem] font-medium uppercase tracking-eyebrow text-ink backdrop-blur-sm">
              {badge}
            </span>
          ) : null}

          {product.category === 'SPF' ? (
            <span className="concern-pill absolute right-3 top-3 z-[2] px-2.5 py-1 font-body text-[0.55rem] font-medium uppercase tracking-eyebrow">
              SPF
            </span>
          ) : null}

          {emilyPick ? (
            <span className="absolute bottom-3 left-3 z-[2] border border-pink/40 bg-void/85 px-2.5 py-1 font-body text-[0.5rem] font-medium uppercase tracking-eyebrow text-pink-bright backdrop-blur-sm">
              Emily&apos;s pick
            </span>
          ) : null}
        </div>

        <div className={`card-micro flex flex-1 flex-col ${compact ? 'px-3.5 pb-4 pt-4' : 'px-5 pb-5 pt-5'}`}>
          {concern ? (
            <span className="concern-pill mb-3 w-fit px-2.5 py-1 font-body text-[0.55rem] font-medium uppercase tracking-eyebrow">
              {concern}
            </span>
          ) : (
            <span className="mb-3 font-body text-[0.55rem] font-medium uppercase tracking-eyebrow text-muted">
              Skin Script · {product.category}
            </span>
          )}

          <h3
            className={`font-display font-normal leading-[1.15] tracking-headline text-ink ${
              compact ? 'text-[1.25rem]' : 'text-[1.3125rem]'
            }`}
          >
            {product.name}
          </h3>

          {!compact && product.description_short ? (
            <p className="mt-2.5 line-clamp-2 flex-1 font-body text-[0.8125rem] font-normal leading-relaxed text-muted">
              {product.description_short}
            </p>
          ) : (
            <p className="mt-2 flex-1 font-body text-[0.75rem] text-muted">
              {product.category}
            </p>
          )}

          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-3.5">
            <p
              className={`font-body text-[0.9rem] font-medium tracking-wide2 ${
                oos ? 'text-muted line-through' : 'text-ink'
              }`}
            >
              {formatMoney(product.retail_price)}
            </p>
            {product.size ? (
              <p className="font-body text-xs font-medium text-muted">
                {product.size}
              </p>
            ) : null}
          </div>
        </div>
      </Link>

      {showQuickAdd ? (
        <div className={`card-add mt-auto ${compact ? 'px-3.5 pb-4' : 'px-5 pb-5'}`}>
          <QuickAdd product={product} />
        </div>
      ) : null}
    </article>
  );
}
