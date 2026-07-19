import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { validateAndNormalizeProduct } from '@/lib/product-admin';
import { audit, mutateStore, readStore } from '@/lib/store';

export async function POST(request) {
  const gate = await requireAdminApi(request);
  if (!gate.ok) return gate.response;
  const { admin } = gate;

  try {
    const body = await request.json();
    const existingIds = (readStore().products || []).map((p) => p.id);
    const result = validateAndNormalizeProduct(body, { isNew: true, existingIds });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, code: result.code, field: result.field },
        { status: result.status }
      );
    }

    let created;
    mutateStore((s) => {
      if (s.products.some((p) => p.id === result.product.id)) {
        throw new Error('Product id already exists');
      }
      created = {
        ...result.product,
        source: 'manual',
        key_actives: result.product.key_actives || [],
        skin_types: result.product.skin_types || [],
        conditions_addressed: result.product.conditions_addressed || []
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
