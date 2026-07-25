import Link from 'next/link';
import Hero from '@/components/Hero';
import ProductImage from '@/components/ProductImage';
import Rule from '@/components/Rule';
import { getFeaturedProducts } from '@/lib/products-server';
import { SERVICES, formatDuration, formatServicePrice } from '@/lib/services';
import { formatMoney } from '@/lib/shipping';

export const metadata = {
  title: 'Dew Theory — Skin Care',
  description:
    'Skin Script formulations and in-studio facials with licensed aesthetician Emily Mitchener.',
  openGraph: {
    title: 'Dew Theory — Skin Care',
    description:
      'Skin Script formulations and in-studio facials with licensed aesthetician Emily Mitchener.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Dew Theory',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Dew Theory' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dew Theory — Skin Care',
    description:
      'Skin Script formulations and in-studio facials with licensed aesthetician Emily Mitchener.',
    images: ['/logo.png']
  }
};

export const revalidate = 60;

// Real Skin Script catalog (data/products.json). Starter-routine pick — not ranked by sales.
const FEATURED_IDS = [
  'green-tea-citrus-cleanser',
  'mandelic-brightening-serum',
  'ageless-moisturizer'
];

// Shared with Services / Book — OPEN_ITEMS: menu still placeholder until Emily confirms.
const services = SERVICES.slice(0, 4).map((s) => ({
  id: s.id,
  name: s.name,
  duration: formatDuration(s.duration_minutes),
  price: formatServicePrice(s.price),
  note: s.note
}));

const doors = [
  {
    href: '/book',
    eyebrow: 'Primary path',
    title: 'Book with Emily',
    copy: 'A licensed aesthetician reads your skin, then builds the plan around it.',
    cta: 'Book a facial',
    primary: true
  },
  {
    href: '/shop',
    eyebrow: 'Take home',
    title: 'Shop Skin Script',
    copy: 'Professional-grade actives, sold by the same person who uses them on you.',
    cta: 'Shop the collection',
    primary: false
  }
];

export default function Home() {
  const products = getFeaturedProducts(FEATURED_IDS).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    images: p.images || [],
    price: formatMoney(p.retail_price),
    note: p.description_short
  }));

  return (
    <>
      <Hero />

      {/* Virtual consultation — post-hero feature block */}
      <section className="border-y border-chrome/15 bg-ivory/60">
        <div
          className="mx-auto flex max-w-shell flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-14 lg:px-10"
          data-reveal-group="vc-feature"
        >
          <div className="min-w-0 max-w-xl">
            <p
              data-reveal
              className="eyebrow-line font-label text-[0.68rem] font-light uppercase tracking-[0.28em] text-charcoal/70 sm:text-[0.62rem] sm:tracking-lockup"
            >
              One-on-one · Online
            </p>
            <h2
              data-reveal
              className="mt-4 font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-normal leading-[1.15] text-graphite"
            >
              Prefer a virtual consultation?
            </h2>
            <p
              data-reveal
              className="mt-3 font-body text-sm font-light leading-relaxed text-charcoal/75 sm:text-base"
            >
              Meet Emily by Zoom for a focused skin review, then receive a personalized morning and
              evening routine with product links.
            </p>
          </div>
          <Link
            data-reveal
            href="/virtual-consultation"
            className="sweep btn-ghost inline-flex min-h-[44px] shrink-0 items-center justify-center px-8 py-4 text-center font-label text-[0.7rem] font-light uppercase tracking-lockup"
          >
            Virtual consultation
          </Link>
        </div>
      </section>

      {/* Thesis — editorial band */}
      <section className="section-veil relative">
        <div className="relative z-[1] mx-auto max-w-shell px-6 py-20 sm:py-28 lg:px-10" data-reveal-group="thesis">
          <p
            data-reveal
            className="eyebrow-line font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
          >
            The theory
          </p>
          <p
            data-reveal
            className="mt-8 max-w-4xl font-display text-[clamp(1.75rem,4.2vw,3.15rem)] font-normal leading-[1.28] text-graphite"
          >
            Most skin problems are a sequencing problem. We sell the actives that work, and the
            appointment that tells you the order to use them in.
          </p>
          <Rule left="Products" right="Services" className="mt-12" data-reveal />
        </div>
      </section>

      {/* Two doors — book primary, shop secondary */}
      <section className="mx-auto max-w-shell px-6 py-28 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 md:gap-7" data-reveal-group="doors">
          {doors.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              data-reveal
              className={`sweep glass-1 glass-lift group relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-[3px] p-10 sm:min-h-[24rem] sm:p-12 ${
                d.primary ? 'md:col-span-1 ring-1 ring-graphite/15' : ''
              }`}
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl ${
                  d.primary ? 'bg-blush/40' : 'bg-ice/35'
                }`}
                aria-hidden="true"
              />
              <p className="eyebrow-line font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
                {d.eyebrow}
              </p>
              <div className="mt-12">
                <h2 className="font-display text-[clamp(2.1rem,4.2vw,3.1rem)] font-normal leading-[1.08] text-graphite">
                  {d.title}
                </h2>
                <p className="mt-5 max-w-sm font-body text-sm font-light leading-relaxed text-charcoal/75 sm:text-base">
                  {d.copy}
                </p>
                <span
                  className={`mt-10 inline-flex items-center gap-3 font-label text-[0.68rem] font-light uppercase tracking-lockup ${
                    d.primary ? 'text-graphite' : 'text-charcoal'
                  }`}
                >
                  {d.cta}
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-chrome/50 transition-[width] duration-500 group-hover:w-14"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-shell px-6 pb-28 lg:px-10" aria-labelledby="home-products">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal-group="products-head">
          <div>
            <p
              data-reveal
              className="eyebrow-line font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
            >
              Starter routine
            </p>
            <h2
              id="home-products"
              data-reveal
              className="mt-4 font-display text-[clamp(2rem,4.2vw,3rem)] font-normal text-graphite"
            >
              Where most people start
            </h2>
          </div>
          <Link
            data-reveal
            href="/shop"
            className="font-label text-[0.68rem] font-light uppercase tracking-lockup text-charcoal/70 transition-colors hover:text-charcoal"
          >
            Shop all
          </Link>
        </div>

        {products.length === 0 ? (
          <div data-reveal className="glass-1 mt-14 rounded-[3px] p-12 text-center" role="status">
            <p className="font-display text-xl font-normal text-graphite">Collection loading</p>
            <p className="mx-auto mt-3 max-w-md font-body text-sm font-light text-charcoal/70">
              Featured products will appear here once the catalog is available.
            </p>
            <Link
              href="/shop"
              className="sweep btn-ghost mt-8 inline-block px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7" data-reveal-group="products">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.id}`}
                data-reveal
                className="sweep glass-1 glass-lift group flex flex-col rounded-[3px] p-7 sm:p-8"
              >
                <div className="mb-7 sm:mb-8">
                  <ProductImage
                    product={p}
                    framed
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
                  {p.category}
                </p>
                <h3 className="mt-3 font-display text-xl font-normal text-graphite transition-colors group-hover:text-charcoal">
                  {p.name}
                </h3>
                <p className="mt-3 flex-1 font-body text-sm font-light leading-relaxed text-charcoal/70">
                  {p.note}
                </p>
                <p className="mt-6 border-t border-chrome/15 pt-5 font-label text-sm font-light tracking-wide2 text-charcoal">
                  {p.price}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Emily — warm ivory band */}
      <section className="section-ivory relative">
        <div
          className="relative z-[1] mx-auto grid max-w-shell gap-14 px-6 py-28 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20 lg:px-10"
          data-reveal-group="emily"
        >
          <div data-reveal className="relative mx-auto w-full max-w-md lg:mx-0">
            <div
              className="pointer-events-none absolute -inset-6 -z-10 opacity-80"
              aria-hidden="true"
            >
              <div className="absolute inset-10 rounded-full bg-blush/30 blur-3xl" />
              <div className="absolute right-0 top-8 h-32 w-32 rounded-full bg-lavender/35 blur-2xl" />
            </div>
            <div className="chrome-frame relative aspect-[4/5] overflow-hidden rounded-[3px]">
              <div className="iridescent absolute inset-0" aria-hidden="true" />
              <div
                className="absolute inset-0 bg-gradient-to-t from-graphite/20 via-transparent to-pearl/10"
                aria-hidden="true"
              />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-label text-[0.58rem] font-light uppercase tracking-lockup text-graphite/70">
                  Portrait pending
                </p>
              </div>
            </div>
          </div>
          <div>
            <Rule left="Aesthetician" right="Licensed" data-reveal />
            <h2
              data-reveal
              className="mt-8 font-display text-[clamp(2.15rem,4.6vw,3.4rem)] font-normal leading-[1.08] text-graphite"
            >
              Emily Mitchener
            </h2>
            <p
              data-reveal
              className="mt-7 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75 sm:text-[1.05rem]"
            >
              Emily treats skin the way a good technician treats an engine: look first, change one
              variable at a time, and don&apos;t sell you a part you don&apos;t need. Every
              appointment starts with a read of where your barrier actually is that week.
            </p>
            <Link
              data-reveal
              href="/about"
              className="sweep btn-ghost mt-10 inline-block px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup"
            >
              Meet Emily
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-shell px-6 py-28 lg:px-10" aria-labelledby="home-services">
        <div data-reveal-group="services-head">
          <p
            data-reveal
            className="eyebrow-line font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
          >
            In studio
          </p>
          <h2
            id="home-services"
            data-reveal
            className="mt-4 font-display text-[clamp(2rem,4.2vw,3rem)] font-normal text-graphite"
          >
            The treatment menu
          </h2>
        </div>

        {services.length === 0 ? (
          <div className="glass-1 mt-14 rounded-[3px] p-12" role="status">
            <p className="font-display text-xl font-normal text-graphite">Menu coming soon</p>
            <p className="mt-3 max-w-md font-body text-sm font-light text-charcoal/70">
              Appointment types will list here once Emily confirms the live menu.
            </p>
            <Link
              href="/contact"
              className="sweep btn-ghost mt-8 inline-block px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup"
            >
              Ask about booking
            </Link>
          </div>
        ) : (
          <>
            <ul
              className="mt-14 overflow-hidden rounded-[3px] border border-chrome/20 bg-pearl/25 backdrop-blur-sm"
              data-reveal-group="services"
            >
              {services.map((s) => (
                <li key={s.id} data-reveal className="border-b border-chrome/15 last:border-b-0">
                  <Link
                    href={`/book?service=${s.id}`}
                    className="sweep group grid gap-4 px-5 py-9 transition-colors hover:bg-pearl/55 md:grid-cols-[1.15fr_1.45fr_auto] md:items-center md:px-8"
                  >
                    <h3 className="font-display text-xl font-normal text-graphite transition-colors group-hover:text-charcoal sm:text-2xl">
                      {s.name}
                    </h3>
                    <p className="font-body text-sm font-light leading-relaxed text-charcoal/70">
                      {s.note}
                    </p>
                    <Rule left={s.duration} right={s.price} className="md:justify-end" />
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/services"
              className="mt-12 inline-flex items-center gap-3 font-label text-[0.68rem] font-light uppercase tracking-lockup text-charcoal/70 transition-colors hover:text-charcoal"
            >
              See all services
              <span aria-hidden="true" className="h-px w-10 bg-chrome/45" />
            </Link>
          </>
        )}
      </section>

      {/* FAQ teaser */}
      <section className="border-t border-chrome/15 bg-pearl/40">
        <div
          className="mx-auto flex max-w-shell flex-col gap-6 px-6 py-16 sm:flex-row sm:items-end sm:justify-between lg:px-10"
          data-reveal-group="faq-teaser"
        >
          <div className="max-w-xl">
            <p
              data-reveal
              className="eyebrow-line font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome"
            >
              Help
            </p>
            <h2
              data-reveal
              className="mt-4 font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-normal text-graphite"
            >
              Shipping, appointments, products
            </h2>
            <p
              data-reveal
              className="mt-3 font-body text-sm font-light leading-relaxed text-charcoal/70"
            >
              Free shipping at $49+ pre-discount, Skin Script authenticity, and how virtual
              consults work — answered without inventing studio policies.
            </p>
          </div>
          <Link
            data-reveal
            href="/faq"
            className="sweep btn-ghost inline-flex min-h-[44px] shrink-0 items-center px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup"
          >
            Read the FAQ
          </Link>
        </div>
      </section>
    </>
  );
}
