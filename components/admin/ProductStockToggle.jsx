'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STOCK = ['in_stock', 'out_of_stock', 'discontinued'];

export default function ProductStockToggle({ productId, stockStatus, active }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(body) {
    setLoading(true);
    await fetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={stockStatus || 'in_stock'}
        disabled={loading}
        onChange={(e) => patch({ stock_status: e.target.value })}
        className="border border-chrome/30 bg-pearl/90 px-2 py-1.5 font-body text-xs font-light"
        aria-label="Stock status"
      >
        {STOCK.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-1.5 font-body text-xs font-light text-charcoal/70">
        <input
          type="checkbox"
          checked={active !== false}
          disabled={loading}
          onChange={(e) => patch({ active: e.target.checked })}
          className="size-3.5 accent-graphite"
        />
        Active
      </label>
    </div>
  );
}
