import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/admin-auth';
import { requireCustomerApi } from '@/lib/customers/guards';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/customers/store';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';

export const dynamic = 'force-dynamic';

/** Only real, shop-visible catalog ids may be stored. */
function isRealProduct(productId) {
  if (!productId || typeof productId !== 'string') return false;
  return getProducts()
    .filter(isShopVisible)
    .some((p) => p.id === productId);
}

export async function GET() {
  const guard = await requireCustomerApi();
  if (!guard.ok) return guard.response;

  const rows = await listFavorites(guard.customer.id);
  return NextResponse.json({ ok: true, productIds: rows.map((r) => r.product_id) });
}

export async function POST(request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) return NextResponse.json({ error: origin.error }, { status: 403 });

  const guard = await requireCustomerApi();
  if (!guard.ok) return guard.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!isRealProduct(body?.productId)) {
    return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
  }

  await addFavorite(guard.customer.id, body.productId);
  return NextResponse.json({ ok: true, saved: true });
}

export async function DELETE(request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) return NextResponse.json({ error: origin.error }, { status: 403 });

  const guard = await requireCustomerApi();
  if (!guard.ok) return guard.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!isRealProduct(body?.productId)) {
    return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
  }

  await removeFavorite(guard.customer.id, body.productId);
  return NextResponse.json({ ok: true, saved: false });
}
