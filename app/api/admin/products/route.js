import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { audit, mutateStore } from '@/lib/store';

export async function POST(request) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  try {
    const body = await request.json();
    if (!body.id || !body.name) {
      return NextResponse.json({ error: 'id and name required' }, { status: 400 });
    }
    const wholesale = Number(body.wholesale_price);
    const retail =
      body.retail_price != null && body.retail_price !== ''
        ? Number(body.retail_price)
        : wholesale * 2;

    let created;
    mutateStore((s) => {
      if (s.products.some((p) => p.id === body.id)) {
        throw new Error('Product id already exists');
      }
      created = {
        id: body.id,
        name: body.name,
        category: body.category || 'Serum',
        size: body.size || '',
        wholesale_price: wholesale,
        retail_price: retail,
        retail_price_confirmed: true,
        description_short: body.description_short || '',
        how_to_use: body.how_to_use || '',
        key_actives: body.key_actives || [],
        skin_types: body.skin_types || [],
        conditions_addressed: body.conditions_addressed || [],
        stock_status: body.stock_status || 'in_stock',
        source: 'manual',
        skin_script_sku: body.skin_script_sku || null,
        active: body.active !== false,
        variants: body.variants || null
      };
      s.products.push(created);
      return s;
    });

    audit(admin.id, 'product.create', 'Products', created.id, { after: created });
    return NextResponse.json({ product: created });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Create failed' }, { status: 400 });
  }
}
