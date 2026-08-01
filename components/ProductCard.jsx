import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { formatMoney } from '@/lib/shipping';
import { isOutOfStock, stockLabel } from '@/lib/shop';

export default function ProductCard({ product }) {
  const oos = isOutOfStock(product);
  const badge = stockLabel(product);

  return (
    <article
      data-reveal
      className="group flex flex-col overflow-hidden rounded-[2px] border border-chrome/15 bg-surface shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <Link
        href={`/shop/${product.id}`}
        className="flex flex-1 flex-col"
        aria-label={oos ? `${product.name}, out of stock` : product.name}
      >
        <div className={`relative ${oos ? 'opacity-55' : ''}`}>
          <ProductImage
            product={product}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {badge && (
            <span className="absolute left-3 top-3 z-[2] border border-chrome/20 bg-surface/95 px-2.5 py-1 font-label text-[0.6rem] font-normal uppercase tracking-lockup text-charcoal">
              {badge}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-6">
          <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome">
            {product.category}
          </p>
          <h3 className="mt-2 font-display text-xl font-normal leading-snug text-graphite transition-colors group-hover:text-charcoal">
            {product.name}
          </h3>
          <p className="mt-2.5 flex-1 font-body text-sm font-normal leading-relaxed text-charcoal/70">
            {product.description_short}
          </p>
          <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-chrome/12 pt-4">
            <p
              className={`font-label text-sm font-normal tracking-wide2 ${
                oos ? 'text-charcoal/45 line-through' : 'text-graphite'
              }`}
            >
              {formatMoney(product.retail_price)}
            </p>
            {product.size && (
              <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome">
                {product.size}
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
