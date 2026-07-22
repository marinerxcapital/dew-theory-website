import { revalidatePath } from 'next/cache';

/**
 * Invalidate public storefront surfaces that render product catalog data.
 * @param {string | string[] | null | undefined} productIds
 */
export function revalidateProductSurfaces(productIds) {
  revalidatePath('/');
  revalidatePath('/shop');

  const ids = productIds == null
    ? []
    : Array.isArray(productIds)
      ? productIds
      : [productIds];

  if (ids.length === 0) {
    revalidatePath('/shop/[id]', 'page');
    return;
  }

  for (const id of ids) {
    if (id) revalidatePath(`/shop/${id}`);
  }
}
