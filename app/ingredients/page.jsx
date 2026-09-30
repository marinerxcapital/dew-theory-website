import { withPageMetadata } from '@/lib/page-metadata';
import PageShell, { ShellPrimary } from '@/components/PageShell';
import TextFilterList from '@/components/TextFilterList';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';

export const metadata = withPageMetadata('/ingredients', {
  title: 'Ingredient library',
  description:
    'Every key active in the Skin Script catalog, what it does, and which products contain it.',
  alternates: { canonical: '/ingredients' },
  openGraph: {
    title: 'Ingredient library — Dew Theory',
    description: 'Every key active in the catalog, what it does, and where it appears.',
    url: '/ingredients',
    type: 'website'
  }
});

export const revalidate = 60;

/**
 * Ingredient library.
 *
 * Built entirely from `key_actives` in the catalog — the name, the function
 * text and the products that list it. Nothing is added here that a product does
 * not already declare, so the library cannot drift from the catalog.
 */
export default function IngredientsPage() {
  const visible = getProducts().filter(isShopVisible);

  const byActive = new Map();
  for (const product of visible) {
    for (const active of product.key_actives || []) {
      const name = typeof active === 'string' ? active : active?.name;
      if (!name) continue;
      const fn = typeof active === 'object' ? active.function : null;
      if (!byActive.has(name)) byActive.set(name, { function: fn, products: [] });
      byActive.get(name).products.push(product);
    }
  }

  const items = [...byActive.entries()]
    .map(([name, { function: fn, products }]) => ({
      key: name,
      title: name,
      subtitle: fn || null,
      meta: `${products.length} ${products.length === 1 ? 'product' : 'products'}`,
      href: products.length > 1 ? `/shop?ingredient=${encodeURIComponent(name)}` : `/shop/${products[0].id}`
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <PageShell
      eyebrow="Library"
      title="Ingredient library"
      intro={`${items.length} key actives across the current catalog. Each entry is taken from the product records themselves — what the active is, what it is there to do, and which products carry it.`}
      actions={<ShellPrimary href="/skin-concerns">Shop by concern</ShellPrimary>}
    >
      <TextFilterList
        items={items}
        label="Search ingredients"
        placeholder="Search an ingredient"
        emptyMessage="No active in the catalog matches that. Try a shorter term, or browse the full collection."
      />

      <p className="mt-14 max-w-measure border-t border-border pt-8 font-body text-[0.9rem] leading-[1.7] text-muted">
        Ingredient descriptions reflect the product data currently held for the catalog and are
        shown for cosmetic guidance only. They are not medical advice.
      </p>
    </PageShell>
  );
}
