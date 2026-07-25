import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/require-admin';
import {
  consultationForAdmin,
  getConsultationById
} from '@/lib/consultations/service.js';
import { getProducts } from '@/lib/products-server.js';
import ConsultationDetail from '@/components/admin/ConsultationDetail';

export default async function AdminConsultationDetailPage({ params }) {
  await requireAdmin();
  const c = getConsultationById(params.id);
  if (!c) notFound();

  const catalog = getProducts()
    .filter((p) => p.active !== false && p.stock_status !== 'discontinued')
    .map((p) => ({ id: p.id, name: p.name, category: p.category }));

  return (
    <div>
      <Link
        href="/admin/consultations"
        className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome hover:text-charcoal"
      >
        ← All consultations
      </Link>
      <div className="mt-6">
        <ConsultationDetail consultation={consultationForAdmin(c)} catalog={catalog} />
      </div>
    </div>
  );
}
