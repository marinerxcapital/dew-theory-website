import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { audit, mutateStore } from '@/lib/store';

export async function POST(request) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  try {
    const body = await request.json();
    const products = Array.isArray(body.products) ? body.products : [];
    if (!products.length) {
      return NextResponse.json({ error: 'No products' }, { status: 400 });
    }

    let created = 0;
    let updated = 0;

    mutateStore((s) => {
      for (const raw of products) {
        if (!raw.name) continue;
        const id =
          raw.id ||
          String(raw.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const wholesale = Number(raw.wholesale_price) || 0;
        const retail =
          raw.retail_price != null ? Number(raw.retail_price) : wholesale * 2;

        const payload = {
          id,
          name: raw.name,
          category: raw.category || 'Serum',
          size: raw.size || '',
          wholesale_price: wholesale,
          retail_price: retail,
          retail_price_confirmed: true,
          description_short: raw.description_short || raw.description || '',
          how_to_use: raw.how_to_use || '',
          key_actives: raw.key_actives || [],
          skin_types: raw.skin_types || [],
          conditions_addressed: raw.conditions_addressed || [],
          stock_status: raw.stock_status || 'in_stock',
          source: 'csv_import',
          skin_script_sku: raw.skin_script_sku || raw.sku || null,
          active: true,
          variants: raw.variants || null
        };

        const idx = s.products.findIndex((p) => p.id === id);
        if (idx >= 0) {
          s.products[idx] = { ...s.products[idx], ...payload };
          updated += 1;
        } else {
          s.products.push(payload);
          created += 1;
        }
      }
      return s;
    });

    audit(admin.id, 'product.csv_import', 'Products', 'batch', { created, updated });
    return NextResponse.json({ created, updated });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500 });
  }
}
