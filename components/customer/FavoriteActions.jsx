'use client';

import AddAllToBag from '@/components/AddAllToBag';

// Adds every saved product to the bag. Delegates to the shared control so the
// cart behaviour lives in exactly one place.
export default function FavoriteActions({ productIds }) {
  return <AddAllToBag productIds={productIds} label="Add all to bag" doneLabel="Added to bag" />;
}
