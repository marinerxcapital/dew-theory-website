import Link from 'next/link';
import ProductImage from '@/components/ProductImage';
import { formatMoney } from '@/lib/shipping';
import { isOutOfStock, stockLabel } from '@/lib/shop';

export default function ProductCard({ product }) {
  const oos = isOutOfStock(product);
  const badge = stockLabel(product);

  return (
    <article data-reveal className="sweep glass-1 glass-lift group flex flex-col rounded-[3px]">
      <Link
        href={`/shop/${product.id}`}
        className="flex flex-1 flex-col p-7 sm:p-8"
        aria-label={oos ? `${product.name}, out of stock` : product.name}
      >
        <div className={`relative mb-7 sm:mb-8 ${oos ? 'opacity-60' : ''}`}>
          <ProductImage
            product={product}
            framed
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {badge && (
            <span className="absolute left-3 top-3 z-[2] border border-chrome/40 bg-pearl/92 px-3 py-1.5 font-label text-[0.58rem] font-light uppercase tracking-lockup text-charcoal shadow-[0_8px_24px_-12px_rgba(45,47,58,0.35)] backdrop-blur-sm">
              {badge}
            </span>
          )}
        </div>
        <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
          {product.category}
        </p>
        <h3 className="mt-3 font-display text-xl font-normal text-graphite transition-colors group-hover:text-charcoal">
          {product.name}
        </h3>
        <p className="mt-3 flex-1 font-body text-sm font-light leading-relaxed text-charcoal/70">
          {product.description_short}
        </p>
        <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-chrome/15 pt-5">
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
