import Link from 'next/link';
import Rule from '@/components/Rule';
import Accordion from '@/components/Accordion';
import JsonLd from '@/components/JsonLd';
import {
  formatMoney,
  FREE_SHIPPING_THRESHOLD_USD,
  FLAT_SHIPPING_USD
} from '@/lib/shipping';

export const metadata = {
  title: 'Help Center — Orders & Virtual Consultations',
  description:
    'Answers about shipping, returns, Skin Script products, the skin quiz, and virtual consultations at Dew Theory.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Help Center — Dew Theory',
    description: 'Shipping, returns, products, and virtual consultations — answered plainly.',
    url: '/faq'
  }
};

const CATEGORIES = [
  {
    id: 'orders',
    label: 'Orders & Shipping',
    items: [
      {
        id: 'free-shipping',
        q: 'What is free shipping?',
        a: `Orders with a product subtotal of ${formatMoney(FREE_SHIPPING_THRESHOLD_USD)} or more ship free. Below that, shipping is a flat ${formatMoney(FLAT_SHIPPING_USD)}. The threshold is calculated on your pre-discount subtotal, so applying a promo code never removes free shipping once you qualify.`
      },
      {
        id: 'order-status',
        q: 'How do I check on my order?',
        a: 'Reach out through the contact form with your order reference and email address, and Emily will follow up with the current status.'
      },
      {
        id: 'address',
        q: 'What address do you ship to?',
        a: 'Checkout collects a complete shipping address — street, city, state, and postal code — so your order can be fulfilled correctly. Incomplete addresses are flagged before payment goes through.'
      }
    ]
  },
  {
    id: 'returns',
    label: 'Returns',
    items: [
      {
        id: 'return-window',
        q: 'Can I return a product?',
        a: 'Yes — see the Returns page for eligibility and how to start a request. Skincare items may have hygiene-related limits on opened or used products.'
      },
      {
        id: 'damaged',
        q: 'What if my order arrives damaged or incorrect?',
        a: 'Contact the studio as soon as you can with photos and your order reference, and Emily will help sort out a replacement or refund.'
      }
    ]
  },
  {
    id: 'products',
    label: 'Products',
    items: [
      {
        id: 'skin-script',
        q: 'Are these real professional formulas?',
        a: 'Yes. The shop carries Skin Script formulations — the same professional line Emily uses in-studio, sold at published retail pricing.'
      },
      {
        id: 'discount-codes',
        q: 'How do promo codes work?',
        a: "Enter your code at checkout — active, valid codes apply automatically to your subtotal. If a code doesn't apply, it may be expired, inactive, or fully redeemed."
      },
      {
        id: 'shelf-life',
        q: 'How do I know what to use, and when?',
        a: 'Take the skin quiz for a suggested morning and evening sequence. For anything beyond home care, a virtual consultation gives you a real barrier read.'
      }
    ]
  },
  {
    id: 'quiz',
    label: 'Skin Quiz',
    items: [
      {
        id: 'quiz-how',
        q: 'How does the skin quiz work?',
        a: 'A few quick questions about your age range, how your skin feels, and your main concern build a suggested AM/PM sequence from real Skin Script products — never invented SKUs.'
      },
      {
        id: 'quiz-medical',
        q: 'Is the quiz a substitute for a professional read?',
        a: 'No. It is an educational starting point, not a diagnosis. Sensitive, reactive, or medical skin conditions deserve an in-person or virtual read with Emily.'
      }
    ]
  },
  {
    id: 'virtual',
    label: 'Virtual Consultation',
    items: [
      {
        id: 'virtual-what',
        q: 'What is a virtual consultation?',
        a: 'A Zoom-based session with Emily: a focused review of your skin, current products, and goals. You will complete a secure intake with private photo upload beforehand, then receive a personalized morning and evening routine afterward.'
      },
      {
        id: 'virtual-privacy',
        q: 'Are my intake photos private?',
        a: 'Yes. Photos are stored privately with no public gallery, and access is limited to Emily and the secure intake session tied to your consultation.'
      },
      {
        id: 'virtual-payment',
        q: 'How does payment work?',
        a: 'Checkout runs securely on Stripe\u2019s hosted payment page — your card details never touch this site directly.'
      }
    ]
  }
];

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a
        }
      }))
    )
  };

  return (
    <section className="mx-auto max-w-shell px-6 pb-24 pt-12 sm:pb-28 sm:pt-14 lg:px-10 lg:pt-16">
      <JsonLd data={jsonLd} />

      <div data-reveal-group="faq-head">
        <Rule left="Help center" right="FAQ" data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.05] text-ink"
        >
          Questions, answered plainly
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
        >
          Browse by topic, or use the contact form for anything specific to your order or
          appointment.
        </p>
      </div>

      <nav
        aria-label="Help topics"
        data-reveal
        className="mt-12 flex flex-wrap gap-2 sm:mt-14"
      >
        {CATEGORIES.map((cat) => (
          <a
            key={cat.id}
            href={`#${cat.id}`}
            className="filter-chip rounded-full px-4 py-2 font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted"
          >
            {cat.label}
          </a>
        ))}
      </nav>

      <div className="mt-14 space-y-14 sm:mt-16 sm:space-y-16" data-reveal-group="faq-categories">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} id={cat.id} data-reveal className="scroll-mt-28">
            <h2 className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-dew">
              {cat.label}
            </h2>
            <div className="mt-4 rounded-[3px] border border-border bg-white px-5 sm:px-8">
              <Accordion items={cat.items} idPrefix={cat.id} />
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-16 flex flex-col gap-6 rounded-[3px] border border-border bg-surface-light p-8 sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:p-10"
        data-reveal
      >
        <div>
          <p className="font-display text-xl font-normal text-ink sm:text-2xl">
            Still have a question?
          </p>
          <p className="mt-2 max-w-md font-body text-sm font-normal leading-relaxed text-muted">
            The contact form reaches the studio directly — Emily replies to what you write in.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="btn-primary min-h-[44px] px-8 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
