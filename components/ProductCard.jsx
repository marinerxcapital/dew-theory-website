import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import QuickAdd from '@/components/QuickAdd';
import { formatMoney } from '@/lib/shipping';
import { isOutOfStock, stockLabel } from '@/lib/shop';

export default function ProductCard({ product, compact = false, showQuickAdd = true }) {
  const oos = isOutOfStock(product);
  const badge = stockLabel(product);
  const concern = Array.isArray(product.conditions_addressed)
    ? product.conditions_addressed[0]
    : null;

  return (
    <article
      data-reveal
      className="group flex h-full flex-col overflow-hidden rounded-[2px] border border-border bg-white transition-[border-color,box-shadow] duration-300 hover:border-ink/30 hover:shadow-card"
    >
      <Link
        href={`/shop/${product.id}`}
        className="flex flex-1 flex-col"
        aria-label={oos ? `${product.name}, out of stock` : product.name}
      >
        <div className={`relative bg-surface-light ${oos ? 'opacity-55' : ''}`}>
          <ProductImage
            product={product}
            sizes={
              compact
                ? '(max-width: 768px) 70vw, 20vw'
                : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            }
          />
          {badge ? (
            <span className="absolute left-2 top-2 z-[2] border border-border bg-white/95 px-2 py-1 font-label text-[0.55rem] font-normal uppercase tracking-lockup text-ink">
              {badge}
            </span>
          ) : null}
          {product.category === 'SPF' ? (
            <span className="absolute right-2 top-2 z-[2] dew-badge px-2 py-1 font-label text-[0.55rem] uppercase tracking-lockup">
              SPF
            </span>
          ) : null}
        </div>
        <div className={`flex flex-1 flex-col ${compact ? 'px-3 pb-3 pt-3' : 'px-4 pb-4 pt-4'}`}>
          <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
            Skin Script · {product.category}
          </p>
          <h3
            className={`mt-1.5 font-display font-normal leading-snug text-ink transition-colors group-hover:text-charcoal ${
              compact ? 'text-lg' : 'text-xl'
            }`}
          >
            {product.name}
          </h3>
          {!compact && product.description_short ? (
            <p className="mt-2 line-clamp-2 flex-1 font-body text-sm font-normal leading-relaxed text-muted">
              {concern
                ? `Helps with ${concern}.`
                : product.description_short}
            </p>
          ) : (
            <p className="mt-1.5 flex-1 font-body text-xs text-muted">
              {concern ? `For ${concern}` : product.size}
            </p>
          )}
          <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-border pt-3">
            <p
              className={`font-label text-sm font-normal tracking-wide2 ${
                oos ? 'text-muted line-through' : 'text-ink'
              }`}
            >
              {formatMoney(product.retail_price)}
            </p>
            {product.size ? (
              <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
                {product.size}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
      {showQuickAdd ? (
        <div className={`mt-auto ${compact ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
          <QuickAdd product={product} />
        </div>
      ) : null}
    </article>
  );
}
