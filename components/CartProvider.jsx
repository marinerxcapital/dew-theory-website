'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartTotals } from '@/lib/discounts';
import { productById } from '@/lib/products';

const CartContext = createContext(null);
const STORAGE_KEY = 'dew_theory_cart_v1';

function load() {
  if (typeof window === 'undefined') return { items: [], discountCode: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], discountCode: null };
    return JSON.parse(raw);
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
    setItems(data.items || []);
    setDiscountCode(data.discountCode || null);
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

    setItems((prev) => {
      const key = `${productId}::${variant || ''}`;
      const existing = prev.find((i) => `${i.product_id}::${i.variant || ''}` === key);
      if (existing) {
        return prev.map((i) =>
          `${i.product_id}::${i.variant || ''}` === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          product_id: productId,
          name: product.name,
          unit_price: product.retail_price,
          quantity,
          variant,
          category: product.category,
          size: product.size
        }
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId, variant, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter(
          (i) => !(i.product_id === productId && (i.variant || null) === (variant || null))
        );
      }
      return prev.map((i) =>
        i.product_id === productId && (i.variant || null) === (variant || null)
          ? { ...i, quantity }
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

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const totals = useMemo(() => cartTotals(items, discountCode), [items, discountCode]);

  const value = useMemo(
    () => ({
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
