'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartTotals } from '@/lib/discounts';
import { productById } from '@/lib/products';

const CartContext = createContext(null);
const STORAGE_KEY = 'dew_theory_cart_v1';
const MAX_QTY = 20;

function clampQty(n) {
  const q = Math.floor(Number(n));
  if (!Number.isFinite(q) || q <= 0) return 0;
  return Math.min(MAX_QTY, q);
}

/** Drop unknown SKUs; re-price from catalog; clamp quantities. */
function sanitizeItems(rawItems) {
  if (!Array.isArray(rawItems)) return [];
  const out = [];
  for (const li of rawItems) {
    const product = productById(li.product_id);
    if (!product) continue; // missing product — drop
    if (product.variants?.length) {
      if (!li.variant || !product.variants.includes(li.variant)) continue;
    }
    const quantity = clampQty(li.quantity);
    if (quantity <= 0) continue;
    out.push({
      product_id: product.id,
      name: product.name,
      unit_price: product.retail_price,
      quantity,
      variant: li.variant || null,
      category: product.category,
      size: product.size
    });
  }
  return out;
}

function load() {
  if (typeof window === 'undefined') return { items: [], discountCode: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], discountCode: null };
    const data = JSON.parse(raw);
    return {
      items: sanitizeItems(data.items || []),
      discountCode: data.discountCode || null
    };
  } catch {
    return { items: [], discountCode: null };
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [discountCode, setDiscountCode] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = load();
    setItems(data.items);
    setDiscountCode(data.discountCode);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, discountCode }));
  }, [items, discountCode, hydrated]);

  const addItem = useCallback((productId, { quantity = 1, variant = null } = {}) => {
    const product = productById(productId);
    if (!product) return;
    if (product.variants?.length && !variant) return;
    if (product.variants?.length && !product.variants.includes(variant)) return;

    const addQty = clampQty(quantity) || 1;

    setItems((prev) => {
      const key = `${productId}::${variant || ''}`;
      const existing = prev.find((i) => `${i.product_id}::${i.variant || ''}` === key);
      if (existing) {
        return prev.map((i) =>
          `${i.product_id}::${i.variant || ''}` === key
            ? { ...i, quantity: clampQty(i.quantity + addQty) || i.quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          product_id: productId,
          name: product.name,
          unit_price: product.retail_price,
          quantity: addQty,
          variant,
          category: product.category,
          size: product.size
        }
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId, variant, quantity) => {
    const q = clampQty(quantity);
    setItems((prev) => {
      if (q <= 0) {
        return prev.filter(
          (i) => !(i.product_id === productId && (i.variant || null) === (variant || null))
        );
      }
      return prev.map((i) =>
        i.product_id === productId && (i.variant || null) === (variant || null)
          ? { ...i, quantity: q, unit_price: productById(productId)?.retail_price ?? i.unit_price }
          : i
      );
    });
  }, []);

  const removeItem = useCallback((productId, variant) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.product_id === productId && (i.variant || null) === (variant || null))
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountCode(null);
  }, []);

  const setPromo = useCallback((codeObj) => {
    setDiscountCode(codeObj);
  }, []);

  const clearPromo = useCallback(() => setDiscountCode(null), []);

  // Re-sanitize if catalog changes between sessions (e.g. removed SKU)
  useEffect(() => {
    if (!hydrated) return;
    setItems((prev) => {
      const next = sanitizeItems(prev);
      if (next.length === prev.length && next.every((n, i) => n.quantity === prev[i].quantity && n.unit_price === prev[i].unit_price)) {
        return prev;
      }
      return next;
    });
  }, [hydrated]);

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const totals = useMemo(() => cartTotals(items, discountCode), [items, discountCode]);

  const value = useMemo(
    () => ({
      items,
      count,
      totals,
      discountCode,
      hydrated,
      maxQty: MAX_QTY,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setPromo,
      clearPromo
    }),
    [
      items,
      count,
      totals,
      discountCode,
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setPromo,
      clearPromo
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
