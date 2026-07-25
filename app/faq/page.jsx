import Link from 'next/link';
import Rule from '@/components/Rule';
import JsonLd from '@/components/JsonLd';
import {
  formatMoney,
  FREE_SHIPPING_THRESHOLD_USD,
  FLAT_SHIPPING_USD
} from '@/lib/shipping';

export const metadata = {
  title: 'FAQ',
  description:
    'Shipping, appointments, Skin Script products, and virtual consultations at Dew Theory — practical answers without invented studio policies.'
};

const FAQS = [
  {
    q: 'What is free shipping?',
    a: `Orders with a product subtotal of ${formatMoney(FREE_SHIPPING_THRESHOLD_USD)} or more (before discount codes) ship free. Below that, shipping is a flat ${formatMoney(FLAT_SHIPPING_USD)}. The threshold uses the pre-discount subtotal so a promo cannot remove free shipping once you qualify.`
  },
  {
    q: 'Are the products real professional formulas?',
    a: 'Yes. The shop carries Skin Script formulations — the same professional line Emily uses in-studio. Retail prices follow wholesale × 2 unless a sticker price is confirmed otherwise.'
  },
  {
    q: 'How do facials work?',
    a: 'Every visit starts with a barrier read. Treatment names, durations, and prices on the menu are a working draft until Emily publishes the live list — book to hold a slot; deposit terms publish before live deposits open.'
  },
  {
    q: 'Can I meet online instead?',
    a: 'Yes. Virtual consultation is a Zoom-based review with secure intake and private photo upload, then a personalized morning and evening routine. Checkout uses Stripe when configured.'
  },
  {
    q: 'How do discounts work?',
    a: 'Enter a code at checkout. Launch promo values are admin-configured — the seeded DEW15 example is a placeholder percentage until Emily confirms launch economics.'
  },
  {
    q: 'Where do I send returns or order questions?',
    a: 'Use the contact form. Final return windows and non-returnable lists are published on the Returns page as operational policy is confirmed — we do not invent a 30-day guarantee.'
  }
];

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  };

  return (
    <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <JsonLd data={jsonLd} />

      <div data-reveal-group="faq-head">
        <Rule left="Help" right="FAQ" data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.05] text-graphite"
        >
          Questions, answered plainly
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75"
        >
          Shipping and product facts below match what the storefront implements. Studio deposit
          windows and final legal return terms still follow Emily&apos;s published policy.
        </p>
      </div>

      <ul className="mt-16 space-y-4" data-reveal-group="faq-list">
        {FAQS.map((item) => (
          <li key={item.q} data-reveal className="glass-1 rounded-[3px] p-6 sm:p-8">
            <h2 className="font-display text-xl font-normal text-graphite sm:text-2xl">{item.q}</h2>
            <p className="mt-4 font-body text-sm font-light leading-relaxed text-charcoal/75">
              {item.a}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-16 flex flex-wrap gap-4" data-reveal>
        <Link
          href="/contact"
          className="sweep btn-primary inline-flex min-h-[44px] items-center px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup"
        >
          Contact
        </Link>
        <Link
          href="/shipping"
          className="sweep inline-flex min-h-[44px] items-center border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
        >
          Shipping details
        </Link>
        <Link
          href="/book"
          className="sweep inline-flex min-h-[44px] items-center border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
        >
          Book a facial
        </Link>
      </div>
    </section>
  );
}
