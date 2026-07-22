import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { validateAndNormalizeProduct } from '@/lib/product-admin';
import { revalidateProductSurfaces } from '@/lib/revalidate-storefront';
import { audit, mutateStore, readStore } from '@/lib/store';

export async function PUT(request, { params }) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  try {
    const body = await request.json();
    const before = readStore().products.find((p) => p.id === params.id);
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Merge so partial updates still validate; form sends full body
    const merged = {
      ...before,
      ...body,
      id: before.id
    };
    const result = validateAndNormalizeProduct(merged, { isNew: false });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, code: result.code, field: result.field },
        { status: result.status }
      );
    }

    let after;
    mutateStore((s) => {
      const idx = s.products.findIndex((p) => p.id === params.id);
      after = {
        ...s.products[idx],
        ...result.product,
        id: params.id,
        source: s.products[idx].source || 'manual',
        variants: body.variants !== undefined ? body.variants : s.products[idx].variants
      };
      s.products[idx] = after;
      return s;
    });

    audit(admin.id, 'product.update', 'Products', params.id, { before, after });
    revalidateProductSurfaces(params.id);
    return NextResponse.json({ product: after });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  const before = readStore().products.find((p) => p.id === params.id);
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Soft-delete option via ?soft=1 → inactive + discontinued; hard delete is default
  const url = new URL(request.url);
  const soft = url.searchParams.get('soft') === '1';

  if (soft) {
    let after;
    mutateStore((s) => {
      const idx = s.products.findIndex((p) => p.id === params.id);
      after = {
        ...s.products[idx],
        active: false,
        stock_status: 'discontinued'
      };
      s.products[idx] = after;
      return s;
    });
    audit(admin.id, 'product.soft_delete', 'Products', params.id, { before, after });
    revalidateProductSurfaces(params.id);
    return NextResponse.json({ ok: true, product: after, soft: true });
  }

  mutateStore((s) => {
    s.products = s.products.filter((p) => p.id !== params.id);
    return s;
  });
  audit(admin.id, 'product.delete', 'Products', params.id, { before });
  revalidateProductSurfaces(params.id);
  return NextResponse.json({ ok: true });
}

/** PATCH stock_status and/or active only (quick toggles) */
export async function PATCH(request, { params }) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  const before = readStore().products.find((p) => p.id === params.id);
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const stock = body.stock_status;
  const hasActive = Object.prototype.hasOwnProperty.call(body, 'active');

  if (stock != null && !['in_stock', 'out_of_stock', 'discontinued'].includes(stock)) {
    return NextResponse.json({ error: 'Invalid stock status', code: 'stock_invalid' }, { status: 400 });
  }

  let after;
  mutateStore((s) => {
    const idx = s.products.findIndex((p) => p.id === params.id);
    after = { ...s.products[idx] };
    if (stock != null) after.stock_status = stock;
    if (hasActive) after.active = Boolean(body.active);
    s.products[idx] = after;
    return s;
  });

  audit(admin.id, 'product.patch', 'Products', params.id, {
    before: { stock_status: before.stock_status, active: before.active },
    after: { stock_status: after.stock_status, active: after.active }
  });
  revalidateProductSurfaces(params.id);
  return NextResponse.json({ product: after });
}
