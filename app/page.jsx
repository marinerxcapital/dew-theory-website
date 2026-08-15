import Link from 'next/link';
import { Suspense } from 'react';
import Hero from '@/components/Hero';
import ProductRail from '@/components/ProductRail';
import StickyCtaBar from '@/components/StickyCtaBar';
import AddRoutineKit from '@/components/AddRoutineKit';
import { getFeaturedProducts, getProducts } from '@/lib/products-server';
import { listResolvedKits } from '@/lib/routine-kits';
import { SERVICES, formatDuration, formatServicePrice } from '@/lib/services';
import {
  formatMoney,
  FREE_SHIPPING_THRESHOLD_USD,
  FLAT_SHIPPING_USD
} from '@/lib/shipping';
import { isShopVisible } from '@/lib/shop';
import { collectConcerns, presentCategories } from '@/lib/shop-filters';
import { productById } from '@/lib/products';

export const metadata = {
  title: 'Clinical Skin Care & Facials',
  description:
    'Shop Skin Script professional skincare and book facials or virtual consultations with licensed aesthetician Emily Mitchener. Free shipping at $49+.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Dew Theory — Clinical Skin Care & Facials',
    description:
      'Skin Script actives for home and in-studio facials with Emily Mitchener. Free shipping at $49+.',
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Dew Theory',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Dew Theory' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dew Theory — Clinical Skin Care & Facials',
    description:
      'Skin Script actives for home and in-studio facials with Emily Mitchener.',
    images: ['/logo.png']
  }
};

export const revalidate = 60;

const EMILY_PICK_IDS = [
  'green-tea-citrus-cleanser',
  'hydrating-skin-serum',
  'ageless-moisturizer',
  'mandelic-brightening-serum',
  'sheer-protection-spf'
];

const services = SERVICES.slice(0, 4).map((s) => ({
  id: s.id,
  name: s.name,
  duration: formatDuration(s.duration_minutes),
  price: formatServicePrice(s.price),
  note: s.note
}));

export default function Home() {
  const all = getProducts().filter(isShopVisible);
  const emilyPicks = getFeaturedProducts(EMILY_PICK_IDS);
  const kits = listResolvedKits(all, { isVisible: isShopVisible });
  const concerns = collectConcerns(all).slice(0, 8);
  const types = presentCategories(all);

  const sampleAm = [
    productById('green-tea-citrus-cleanser'),
    productById('hydrating-skin-serum'),
    productById('ageless-moisturizer'),
    productById('sheer-protection-spf')
  ].filter(Boolean);

  return (
    <>
      <Hero />
      <StickyCtaBar />

      {/* Trust strip */}
      <section className="border-b border-border bg-white" aria-label="Trust signals">
        <div className="mx-auto grid max-w-shell gap-6 px-5 py-7 sm:grid-cols-2 sm:gap-8 sm:px-6 lg:grid-cols-4 lg:px-10">
          {[
            ['Free shipping $49+', `Flat ${formatMoney(FLAT_SHIPPING_USD)} below threshold`],
            ['Skin Script professional', 'The actives Emily uses in treatment'],
            ['In-studio + virtual', 'Facials and Zoom consults'],
            ['Aesthetician-led', 'Barrier-first guidance from Emily']
          ].map(([title, copy]) => (
            <div key={title}>
              <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-ink">
                {title}
              </p>
              <p className="mt-1.5 font-body text-sm font-normal leading-relaxed text-muted">
                {copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Emily's Picks rail */}
      <section className="border-b border-border bg-surface-light py-14 sm:py-16">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-label text-[0.62rem] uppercase tracking-lockup text-dew">
                Emily&apos;s picks
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
                Where most people start
              </h2>
            </div>
            <Link
              href="/shop"
              className="font-label text-[0.65rem] uppercase tracking-lockup text-ink underline-offset-4 hover:underline"
            >
              Shop all
            </Link>
          </div>
          <Suspense fallback={null}>
            <ProductRail products={emilyPicks} label="Emily's picks" />
          </Suspense>
        </div>
      </section>

      {/* Shop by concern */}
      <section className="border-b border-border bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
            Shop by concern
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
            What are you working on?
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {concerns.map((c) => (
              <Link
                key={c}
                href={`/shop?concern=${encodeURIComponent(c)}`}
                className="group border border-border bg-white p-5 transition-colors hover:border-ink hover:bg-surface-light"
              >
                <p className="font-display text-xl text-ink group-hover:text-dew-dark">{c}</p>
                <p className="mt-2 font-label text-[0.58rem] uppercase tracking-lockup text-muted">
                  Shop →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by type */}
      <section className="border-b border-border bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
            Shop by type
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
            Build your shelf
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {types.map((t) => (
              <Link
                key={t}
                href={`/shop?type=${encodeURIComponent(t)}`}
                className="filter-chip rounded-[2px] px-4 py-2.5 font-label text-[0.65rem] uppercase tracking-lockup text-charcoal hover:bg-ink hover:text-white"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz feature */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-shell lg:grid-cols-2">
          <div className="dew-panel flex flex-col justify-center px-5 py-14 sm:px-10 sm:py-16 lg:px-12">
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-dew">
              ~2 minutes · teens to 60+
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.1] text-ink">
              A quiz that listens
            </h2>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-charcoal/80">
              Four gentle questions. A morning and evening Skin Script sequence shaped by how your
              skin feels today — not a one-size script.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/quiz"
                className="btn-dew px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
              >
                Find my routine
              </Link>
              <Link
                href="/routine"
                className="btn-ghost px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
              >
                Build AM / PM
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-border lg:border-l lg:border-t-0">
            {[
              ['Teens', 'First routines, calmer actives'],
              ['20s–30s', 'Clarity, prevention, glow'],
              ['40s–50s', 'Resilience through change'],
              ['60+', 'Comfort, barrier, light']
            ].map(([title, copy]) => (
              <div key={title} className="border-b border-r border-border bg-white p-6 last:border-b-0 even:border-r-0 sm:p-8">
                <p className="font-label text-[0.62rem] uppercase tracking-lockup text-dew">{title}</p>
                <p className="mt-2 font-body text-sm text-charcoal/75">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Routine builder feature */}
      <section className="border-b border-border bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
                AM · PM builder
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
                Layer in professional order
              </h2>
              <p className="mt-4 max-w-md font-body text-base leading-relaxed text-muted">
                Choose each step. Thin to thick. SPF last by day. Add the full sequence in one tap.
              </p>
              <Link
                href="/routine"
                className="btn-primary mt-8 inline-flex px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
              >
                Build my routine
              </Link>
            </div>
            <ol className="space-y-3">
              {sampleAm.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-4 border border-border bg-surface-light px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dew text-sm font-label text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm text-ink">{p.name}</p>
                    <p className="font-label text-[0.55rem] uppercase tracking-lockup text-muted">
                      {p.category}
                    </p>
                  </div>
                  <p className="font-label text-sm text-ink">{formatMoney(p.retail_price)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Starter kits */}
      {kits.length > 0 ? (
        <section className="border-b border-border bg-surface-light py-14 sm:py-16">
          <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-dew">
              Emily would start you here
            </p>
            <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
              Starter kits
            </h2>
            <p className="mt-3 max-w-xl font-body text-sm text-muted">
              Full retail pricing — add every step to your bag in one tap, then edit in cart.
            </p>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {kits.map((kit) => (
                <article
                  key={kit.id}
                  className="flex flex-col border border-border bg-white p-6 sm:p-8"
                >
                  <p className="font-label text-[0.58rem] uppercase tracking-lockup text-muted">
                    {kit.eyebrow}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-ink">{kit.name}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-muted">
                    {kit.description}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2 border-t border-border pt-5">
                    {kit.products.map((p) => (
                      <li key={p.id} className="flex justify-between gap-3 font-body text-sm">
                        <span className="text-charcoal">{p.name}</span>
                        <span className="shrink-0 text-muted">{formatMoney(p.retail_price)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <p className="font-label text-sm uppercase tracking-wide2 text-ink">
                      Kit total {formatMoney(kit.subtotal)}
                    </p>
                    <AddRoutineKit productIds={kit.products.map((p) => p.id)} label="Add kit to bag" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Services */}
      <section className="border-b border-border bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
                In studio
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
                Treatment menu
              </h2>
              <p className="mt-3 max-w-lg font-body text-sm text-muted">
                Menu details are being finalized — request an appointment and Emily will confirm
                timing and investment.
              </p>
            </div>
            <Link
              href="/services"
              className="font-label text-[0.65rem] uppercase tracking-lockup text-ink underline-offset-4 hover:underline"
            >
              See all services →
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/book?service=${encodeURIComponent(s.id)}`}
                className="group flex flex-col border border-border bg-white p-5 transition-colors hover:border-dew"
              >
                <p className="font-display text-xl text-ink group-hover:text-dew-dark">{s.name}</p>
                <p className="mt-2 flex-1 font-body text-sm text-muted">{s.note}</p>
                <p className="mt-4 font-label text-[0.6rem] uppercase tracking-lockup text-muted">
                  {s.duration} · {s.price}
                </p>
                <span className="mt-3 font-label text-[0.62rem] uppercase tracking-lockup text-dew">
                  Request booking →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual consultation + Emily */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-shell lg:grid-cols-2">
          <div className="border-b border-border bg-ink px-5 py-14 text-white sm:px-10 sm:py-16 lg:border-b-0 lg:border-r lg:px-12">
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-white/55">
              From anywhere
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.6rem)] text-white">
              Virtual consultation
            </h2>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-white/75">
              Secure intake, private photos, and a personalized AM/PM plan — without leaving home.
            </p>
            <Link
              href="/virtual-consultation"
              className="btn-ghost mt-8 inline-flex border-white/30 bg-transparent px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup text-white hover:border-white hover:bg-white/10"
            >
              Book virtual consult
            </Link>
          </div>
          <div className="bg-ivory px-5 py-14 sm:px-10 sm:py-16 lg:px-12">
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
              Aesthetician · Licensed
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.6rem)] text-ink">
              Emily Mitchener
            </h2>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-charcoal/80">
              Evidence-informed and barrier-first. Look first, change one variable at a time, and
              don&apos;t sell a product you don&apos;t need.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="btn-primary px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
              >
                Meet Emily
              </Link>
              <Link
                href="/book"
                className="btn-dew-outline px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup"
              >
                Book a facial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / help + membership */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-shell gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">Help</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Shipping, appointments, products</h2>
            <p className="mt-3 font-body text-sm text-muted">
              Free shipping at {formatMoney(FREE_SHIPPING_THRESHOLD_USD)}+ product subtotal before
              discount. Flat {formatMoney(FLAT_SHIPPING_USD)} below.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/faq" className="btn-ghost px-6 py-3 font-label text-[0.65rem] uppercase tracking-lockup">
                FAQ
              </Link>
              <Link href="/contact" className="btn-ghost px-6 py-3 font-label text-[0.65rem] uppercase tracking-lockup">
                Contact
              </Link>
            </div>
          </div>
          <div className="dew-panel p-6 sm:p-8">
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-dew">
              Stay in the plan
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">Membership interest</h2>
            <p className="mt-3 font-body text-sm text-charcoal/80">
              Membership is not for sale yet. Join the interest list for updates when Emily opens
              packages.
            </p>
            <Link
              href="/membership"
              className="btn-dew mt-6 inline-flex px-6 py-3 font-label text-[0.65rem] uppercase tracking-lockup"
            >
              Join interest list
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
