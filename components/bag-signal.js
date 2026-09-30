'use client';

/** Event name the bag indicator listens on. */
export const BAG_ADDED_EVENT = 'dew:bag-added';

/**
 * Announce that an item just landed in the bag.
 *
 * The bag badge in the header is a sibling of every add-to-bag control, so a
 * DOM event is the lightest way to trigger the badge bounce without threading
 * extra state through the cart context for a purely cosmetic beat.
 */
export function signalBagAdded() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(BAG_ADDED_EVENT));
}
