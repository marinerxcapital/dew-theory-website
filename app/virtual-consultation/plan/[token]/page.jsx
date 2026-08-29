import Link from 'next/link';
import { getConsultationByPlanToken } from '@/lib/consultations/service.js';

export const metadata = {
  title: 'Your skincare plan',
  robots: { index: false, follow: false }
};

function Block({ title, body }) {
  if (!body) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-normal text-graphite">{title}</h2>
      <div className="mt-4 whitespace-pre-wrap font-body text-sm font-light leading-relaxed text-charcoal/80">
        {body}
      </div>
    </section>
  );
}

export default function PlanPage({ params }) {
  const result = getConsultationByPlanToken(params?.token);
  if (!result || result.plan?.status !== 'published') {
    return (
      <section className="mx-auto max-w-shell px-6 pb-24 pt-32 lg:px-10">
        <h1 className="font-display text-2xl text-graphite">Plan not available</h1>
        <p className="mt-4 font-body text-sm font-light text-charcoal/70">
          This link is invalid, expired, or the plan has not been published yet.
        </p>
        <Link href="mailto:hello@dewtheory.studio" className="mt-8 inline-block font-label text-[0.7rem] uppercase tracking-lockup">
          Email us
        </Link>
      </section>
    );
  }

  const { consultation, plan } = result;
  const first = (consultation.client_name || '').split(/\s+/)[0] || 'there';
  const products = (plan.products || []).filter((p) => p.product_id || p.display_name || p.product_url);

  return (
    <article className="mx-auto max-w-shell px-6 pb-24 pt-32 sm:pt-36 lg:px-10">
      <p className="eyebrow-line font-label text-[0.68rem] font-light uppercase tracking-[0.28em] text-charcoal/70">
        Personalized plan
      </p>
      <h1 className="mt-5 font-display text-[clamp(2rem,4.5vw,3rem)] font-normal text-graphite">
        Your routine, {first}
      </h1>
      <p className="mt-3 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
        {consultation.public_ref}
        {plan.sent_at || plan.updated_at
          ? ` · ${new Date(plan.sent_at || plan.updated_at).toLocaleDateString()}`
          : ''}
      </p>

      <Block title="Summary from Emily" body={plan.overview} />
      <Block title="Morning routine" body={plan.morning_routine} />
      <Block title="Evening routine" body={plan.evening_routine} />
      <Block title="Weekly schedule" body={plan.weekly_schedule} />
      <Block title="Layering order" body={plan.layering_instructions} />
      <Block title="Expectations & timeline" body={plan.expectations} />
      <Block title="Maintenance plan" body={plan.maintenance_plan} />
      <Block title="Additional notes" body={plan.additional_notes} />

      {products.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-normal text-graphite">Recommended products</h2>
          <ul className="mt-6 space-y-4">
            {products
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((p, i) => {
                const href = p.product_id
                  ? `/shop/${p.product_id}`
                  : p.product_url || null;
                return (
                  <li key={`${p.product_id || i}`} className="glass-1 rounded-[3px] p-5">
                    <p className="font-label text-[0.58rem] uppercase tracking-lockup text-chrome">
                      {p.routine_phase || 'routine'}
                    </p>
                    <p className="mt-2 font-display text-lg text-graphite">
                      {p.display_name || p.product_id}
                    </p>
                    {p.usage_instructions ? (
                      <p className="mt-2 font-body text-sm font-light text-charcoal/75">
                        {p.usage_instructions}
                      </p>
                    ) : null}
                    {p.note ? (
                      <p className="mt-1 font-body text-sm font-light text-charcoal/65">{p.note}</p>
                    ) : null}
                    {href ? (
                      <Link
                        href={href}
                        className="mt-4 inline-block font-label text-[0.66rem] font-light uppercase tracking-lockup text-charcoal"
                        onClick={() => {
                          // analytics via beacon is client-only; server already tracks open
                        }}
                      >
                        Shop this product →
                      </Link>
                    ) : null}
                  </li>
                );
              })}
          </ul>
        </section>
      ) : null}

      <p className="mt-14 max-w-xl font-body text-xs font-light leading-relaxed text-charcoal/55">
        Virtual consultations provide aesthetic skincare guidance and do not replace evaluation,
        diagnosis, or treatment by a licensed medical professional. Questions?{' '}
        <Link href="mailto:hello@dewtheory.studio" className="underline decoration-chrome/40">
          Email Dew Theory
        </Link>
        .
      </p>
    </article>
  );
}
