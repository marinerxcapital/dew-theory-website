import Link from 'next/link';
import { formatMoney } from '@/lib/shipping';
import { isOutOfStock, stockLabel } from '@/lib/shop';

export default function ProductCard({ product }) {
  const oos = isOutOfStock(product);
  const badge = stockLabel(product);

  return (
    <article data-reveal className="sweep glass-1 flex flex-col">
      <Link
        href={`/shop/${product.id}`}
        className="flex flex-1 flex-col p-8"
        aria-label={
          oos ? `${product.name}, out of stock` : product.name
        }
      >
        <div className="relative mb-8">
          <div
            className={`iridescent aspect-[4/5] w-full rounded-[2px] ${oos ? 'opacity-60' : ''}`}
            aria-hidden="true"
          />
          {badge && (
            <span className="absolute left-3 top-3 border border-chrome/40 bg-pearl/90 px-3 py-1.5 font-label text-[0.58rem] font-light uppercase tracking-lockup text-charcoal">
              {badge}
            </span>
          )}
        </div>
        <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
          {product.category}
        </p>
        <h3 className="mt-3 font-display text-xl font-normal text-graphite">{product.name}</h3>
        <p className="mt-3 flex-1 font-body text-sm font-light leading-relaxed text-charcoal/70">
          {product.description_short}
        </p>
        <div className="mt-6 flex items-baseline justify-between gap-4">
          <p
            className={`font-label text-sm font-light tracking-wide2 ${
              oos ? 'text-charcoal/50 line-through' : 'text-charcoal'
            }`}
          >
            {formatMoney(product.retail_price)}
          </p>
          {product.size && (
            <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
              {product.size}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
