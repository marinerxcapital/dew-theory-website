import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import ProductCard from '@/components/ProductCard';
import AddAllToBag from '@/components/AddAllToBag';
import { IconArrowRight } from '@/components/Icons';
import { getProducts } from '@/lib/products-server';
import { isShopVisible } from '@/lib/shop';
import { getConcernFamily, productsForFamily } from '@/lib/concerns';
import {
  CONSULTATION_STEPS,
  concernFamiliesFromAnswers,
  decodeAnswers,
  routineDepth
} from '@/lib/consultation-questions';

export const metadata = withPageMetadata('/consultation/results', {
  title: 'Your starting routine',
  description:
    'The Skin Script products that match the concerns you selected, with the order to introduce them in.',
  alternates: { canonical: '/consultation/results' },
  robots: { index: false, follow: true }
});

export const revalidate = 60;

/** Products that should not be layered in the morning. Derived from real data. */
const EVENING_ACTIVE = /retinol|glycolic|mandelic|salicylic|lactic|aha\b|bha\b|exfoli/i;

function slotFor(product) {
  const category = String(product.category || '').toLowerCase();
  if (category.includes('spf') || category.includes('sunscreen')) return 'AM';
  const actives = (product.key_actives || [])
    .map((a) => String(typeof a === 'string' ? a : a?.name || ''))
    .join(' ');
  if (category.includes('exfoliant') || EVENING_ACTIVE.test(actives)) return 'PM';
  return 'BOTH';
}

/**
 * Consultation results (mockup DT-10).
 *
 * Answers arrive in the URL, so this page is server-rendered from the live
 * catalog and is refresh-safe and shareable. Recommendations are the union of
 * the products that declare the selected concerns — ranked by how many of the
 * visitor's families a product addresses, then trimmed to the routine length
 * they said they would keep up with.
 *
 * Nothing here is invented: a product only appears if its own
 * `conditions_addressed` list overlaps a concern the visitor chose.
 */
export default async function ConsultationResultsPage({ searchParams }) {
  const params = await searchParams;
  const answers = decodeAnswers(params?.a);
  const families = concernFamiliesFromAnswers(answers);
  const visible = getProducts().filter(isShopVisible);

  // Rank by how many of the visitor's families each product addresses.
  const scored = new Map();
  for (const slug of families) {
    const family = getConcernFamily(slug);
    if (!family) continue;
    for (const product of productsForFamily(family, visible)) {
      const entry = scored.get(product.id) || { product, hits: 0 };
      entry.hits += 1;
      scored.set(product.id, entry);
    }
  }

  let picks = [...scored.values()]
    .sort((a, b) => b.hits - a.hits || a.product.name.localeCompare(b.product.name))
    .map((entry) => entry.product);

  // Protection is the one step the questionnaire can add regardless of concern:
  // if they are not already using daily SPF, an SPF belongs in the routine.
  const weakProtection =
    answers.protection === 'rarely' || answers.protection === 'none' || answers.protection === 'sometimes';
  if (weakProtection) {
    const spf = visible.filter((p) => String(p.category).toLowerCase().includes('spf'));
    const missing = spf.filter((p) => !picks.some((x) => x.id === p.id));
    picks = [...picks, ...missing];
  }

  picks = picks.slice(0, routineDepth(answers));

  const morning = picks.filter((p) => slotFor(p) !== 'PM');
  const evening = picks.filter((p) => slotFor(p) !== 'AM');
  const hasAnswers = families.length > 0;

  if (!hasAnswers) {
    return (
      <PageShell
        eyebrow="Consultation"
        title="We need a little more to go on."
        intro="This page is the end of the questionnaire, so it needs your answers. Start at step one and it takes about two minutes."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href={'/consultation/' + CONSULTATION_STEPS[0].key}
            className="btn-primary inline-flex min-h-[56px] items-center gap-3 px-9 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup"
          >
            Begin the consultation
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/skin-concerns"
            className="btn-ghost inline-flex min-h-[56px] items-center px-9 py-4 font-body text-[0.7rem] font-medium uppercase tracking-lockup"
          >
            Shop by skin concern
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Your consultation"
      title="Your starting routine"
      intro={
        picks.length
          ? 'Built from the concerns you selected, using what the catalog actually declares. Start with the morning set, add one new product at a time, and give each a fortnight before judging it.'
          : 'Nothing in the current catalog declares the combination you selected. That is useful information — book a session and we will work it out with you.'
      }
      actions={
        <>
          <Link
            href="/virtual-consultation"
            className="btn-ghost inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
          >
            Book 1:1 with Emily
          </Link>
          <Link
            href={'/consultation/' + CONSULTATION_STEPS[0].key}
            className="btn-ghost inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
          >
            Start over
          </Link>
        </>
      }
    >
      <div className="border-b border-border pb-8">
        <h2 className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
          You asked about
        </h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {families.map((slug) => {
            const family = getConcernFamily(slug);
            if (!family) return null;
            return (
              <li
                key={slug}
                className="border border-hairline px-3 py-1.5 font-body text-[0.72rem] uppercase tracking-eyebrow text-muted"
              >
                {family.label}
              </li>
            );
          })}
        </ul>
      </div>

      {morning.length ? (
        <section className="mt-14" aria-labelledby="routine-morning">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2
              id="routine-morning"
              className="font-display text-[clamp(1.6rem,3vw,2.3rem)] font-normal leading-[1.08] text-ink"
            >
              Morning
            </h2>
            <AddAllToBag
              productIds={morning.map((p) => p.id)}
              label="Add morning routine to bag"
              doneLabel="Morning routine added"
            />
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
            {morning.map((product, i) => (
              <li key={product.id} className="h-full">
                <ProductCard product={product} revealIndex={i} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {evening.length ? (
        <section className="mt-20" aria-labelledby="routine-evening">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2
              id="routine-evening"
              className="font-display text-[clamp(1.6rem,3vw,2.3rem)] font-normal leading-[1.08] text-ink"
            >
              Evening
            </h2>
            <AddAllToBag
              productIds={evening.map((p) => p.id)}
              label="Add evening routine to bag"
              doneLabel="Evening routine added"
            />
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
            {evening.map((product, i) => (
              <li key={product.id} className="h-full">
                <ProductCard product={product} revealIndex={i} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-20 border-t border-border pt-10">
        <h2 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-normal leading-[1.1] text-ink">
          Before you buy anything
        </h2>
        <ul className="mt-6 space-y-3 font-body text-[0.96rem] leading-[1.72] text-muted">
          <li>Introduce one new product at a time, and give it a fortnight before adding the next.</li>
          <li>
            This is cosmetic guidance from a questionnaire, not a diagnosis. See the{' '}
            <Link
              href="/aesthetic-disclaimer"
              className="underline decoration-border underline-offset-4 hover:decoration-ink"
            >
              aesthetic disclaimer
            </Link>
            .
          </li>
          <li>
            For a full read — photo review, product-by-product plan, and the order to introduce
            things in —{' '}
            <Link
              href="/virtual-consultation"
              className="underline decoration-border underline-offset-4 hover:decoration-ink"
            >
              book the 1:1 session
            </Link>
            .
          </li>
        </ul>
      </div>
    </PageShell>
  );
}
