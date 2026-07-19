import { NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/admin-auth';
import { audit, mutateStore, readStore } from '@/lib/store';

export async function PUT(request, { params }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const before = readStore().products.find((p) => p.id === params.id);
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let after;
    mutateStore((s) => {
      const idx = s.products.findIndex((p) => p.id === params.id);
      after = {
        ...s.products[idx],
        name: body.name ?? s.products[idx].name,
        category: body.category ?? s.products[idx].category,
        size: body.size ?? s.products[idx].size,
        wholesale_price:
          body.wholesale_price != null
            ? Number(body.wholesale_price)
            : s.products[idx].wholesale_price,
        retail_price:
          body.retail_price != null ? Number(body.retail_price) : s.products[idx].retail_price,
        description_short: body.description_short ?? s.products[idx].description_short,
        how_to_use: body.how_to_use ?? s.products[idx].how_to_use,
        stock_status: body.stock_status ?? s.products[idx].stock_status,
        skin_script_sku: body.skin_script_sku ?? s.products[idx].skin_script_sku,
        active: body.active !== false
      };
      s.products[idx] = after;
      return s;
    });

    audit(admin.id, 'product.update', 'Products', params.id, { before, after });
    return NextResponse.json({ product: after });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const before = readStore().products.find((p) => p.id === params.id);
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  mutateStore((s) => {
    s.products = s.products.filter((p) => p.id !== params.id);
    return s;
  });
  audit(admin.id, 'product.delete', 'Products', params.id, { before });
  return NextResponse.json({ ok: true });
}
