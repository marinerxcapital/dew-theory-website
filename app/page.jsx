import Link from 'next/link';
import Hero from '@/components/Hero';
import Rule from '@/components/Rule';
import { featured } from '@/lib/products';
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

// Real Skin Script catalog (data/products.json). Starter-routine pick — not ranked by sales.
const FEATURED_IDS = [
  'green-tea-citrus-cleanser',
  'mandelic-brightening-serum',
  'ageless-moisturizer'
];

const products = featured(FEATURED_IDS).map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: formatMoney(p.retail_price),
  note: p.description_short
}));

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
    href: '/shop',
    eyebrow: 'Take home',
    title: 'Shop Skin Script',
    copy: 'Professional-grade actives, sold by the same person who uses them on you.',
    cta: 'Shop the collection'
  },
  {
    href: '/book',
    eyebrow: 'In studio',
    title: 'Book with Emily',
    copy: 'A licensed aesthetician reads your skin, then builds the plan around it.',
    cta: 'Book a facial'
  }
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Thesis */}
      <section className="border-y border-chrome/15 bg-pearl/80">
        <div className="mx-auto max-w-shell px-6 py-24 lg:px-10" data-reveal-group="thesis">
          <p
            data-reveal
            className="max-w-3xl font-display text-[clamp(1.6rem,3.6vw,2.75rem)] font-normal leading-[1.32] text-graphite"
          >
            Most skin problems are a sequencing problem. We sell the actives that work, and the
            appointment that tells you the order to use them in.
          </p>
          <Rule left="Products" right="Services" className="mt-10" data-reveal />
        </div>
      </section>

      {/* Two doors — the site's two jobs, weighted equally */}
      <section className="mx-auto max-w-shell px-6 py-24 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2" data-reveal-group="doors">
          {doors.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              data-reveal
              className="sweep glass-1 group flex min-h-[22rem] flex-col justify-between p-10"
            >
              <p className="font-label text-[0.66rem] font-light uppercase tracking-lockup text-chrome">
                {d.eyebrow}
              </p>
              <div className="mt-10">
                <h2 className="font-display text-[clamp(2rem,4vw,2.9rem)] font-normal leading-tight text-graphite">
                  {d.title}
                </h2>
                <p className="mt-4 max-w-sm font-body text-sm font-light leading-relaxed text-charcoal/75">
                  {d.copy}
                </p>
                <span className="mt-8 inline-block font-label text-[0.68rem] font-light uppercase tracking-lockup text-charcoal underline-offset-8 group-hover:underline">
                  {d.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-shell px-6 pb-24 lg:px-10" aria-labelledby="home-products">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            id="home-products"
            className="font-display text-[clamp(1.9rem,4vw,2.8rem)] font-normal text-graphite"
          >
            Where most people start
          </h2>
          <Link
            href="/shop"
            className="font-label text-[0.68rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
          >
            Shop all
          </Link>
        </div>

        {products.length === 0 ? (
          <div
            data-reveal
            className="glass-1 mt-12 p-10 text-center"
            role="status"
          >
            <p className="font-display text-xl font-normal text-graphite">Collection loading</p>
            <p className="mx-auto mt-3 max-w-md font-body text-sm font-light text-charcoal/70">
              Featured products will appear here once the catalog is available.
            </p>
            <Link
              href="/shop"
              className="sweep mt-8 inline-block border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group="products">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.id}`}
                data-reveal
                className="sweep glass-1 flex flex-col p-8"
              >
                <div
                  className="iridescent mb-8 aspect-[4/5] w-full rounded-[2px]"
                  aria-hidden="true"
                />
                <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
                  {p.category}
                </p>
                <h3 className="mt-3 font-display text-xl font-normal text-graphite">{p.name}</h3>
                <p className="mt-3 flex-1 font-body text-sm font-light leading-relaxed text-charcoal/70">
                  {p.note}
                </p>
                <p className="mt-6 font-label text-sm font-light tracking-wide2 text-charcoal">
                  {p.price}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Emily — warm ivory band */}
      <section className="border-y border-chrome/15 bg-ivory">
        <div
          className="mx-auto grid max-w-shell gap-14 px-6 py-24 lg:grid-cols-[0.8fr_1fr] lg:items-center lg:px-10"
          data-reveal-group="emily"
        >
          <div
            data-reveal
            className="iridescent aspect-[4/5] w-full max-w-sm rounded-[2px]"
            aria-hidden="true"
          />
          <div>
            <Rule left="Aesthetician" right="Licensed" data-reveal />
            <h2
              data-reveal
              className="mt-8 font-display text-[clamp(2rem,4.4vw,3.2rem)] font-normal leading-tight text-graphite"
            >
              Emily Mitchener
            </h2>
            <p
              data-reveal
              className="mt-6 max-w-lg font-body text-base font-light leading-relaxed text-charcoal/75"
            >
              Emily treats skin the way a good technician treats an engine: look first, change one
              variable at a time, and don&apos;t sell you a part you don&apos;t need. Every
              appointment starts with a read of where your barrier actually is that week.
            </p>
            <Link
              data-reveal
              href="/about"
              className="sweep mt-9 inline-block border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
            >
              Meet Emily
            </Link>
          </div>
        </div>
      </section>

      {/* Services — same source as /services and /book */}
      <section className="mx-auto max-w-shell px-6 py-24 lg:px-10" aria-labelledby="home-services">
        <h2
          id="home-services"
          className="font-display text-[clamp(1.9rem,4vw,2.8rem)] font-normal text-graphite"
        >
          The treatment menu
        </h2>

        {services.length === 0 ? (
          <div className="glass-1 mt-12 p-10" role="status">
            <p className="font-display text-xl font-normal text-graphite">Menu coming soon</p>
            <p className="mt-3 max-w-md font-body text-sm font-light text-charcoal/70">
              Appointment types will list here once Emily confirms the live menu.
            </p>
            <Link
              href="/contact"
              className="sweep mt-8 inline-block border border-graphite/25 px-8 py-4 font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal hover:border-graphite/60"
            >
              Ask about booking
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-12 border-t border-chrome/25" data-reveal-group="services">
              {services.map((s) => (
                <li key={s.id} data-reveal className="border-b border-chrome/20">
                  <Link
                    href={`/book?service=${s.id}`}
                    className="sweep grid gap-4 py-8 transition-colors hover:bg-pearl/50 md:grid-cols-[1.1fr_1.4fr_auto] md:items-center md:px-4"
                  >
                    <h3 className="font-display text-xl font-normal text-graphite">{s.name}</h3>
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
              className="mt-10 inline-block font-label text-[0.68rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
            >
              See all services
            </Link>
          </>
        )}
      </section>
    </>
  );
}
