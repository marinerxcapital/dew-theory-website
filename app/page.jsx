import Link from 'next/link';
import Hero from '@/components/Hero';
import ProductImage from '@/components/ProductImage';
import StickyCtaBar from '@/components/StickyCtaBar';
import AddRoutineKit from '@/components/AddRoutineKit';
import { getFeaturedProducts, getProducts } from '@/lib/products-server';
import { listResolvedKits } from '@/lib/routine-kits';
import { SERVICES, formatDuration, formatServicePrice } from '@/lib/services';
import { formatMoney } from '@/lib/shipping';
import { isShopVisible } from '@/lib/shop';

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

const FEATURED_IDS = [
  'green-tea-citrus-cleanser',
  'hydrating-skin-serum',
  'ageless-moisturizer'
];

const services = SERVICES.slice(0, 4).map((s) => ({
  id: s.id,
  name: s.name,
  duration: formatDuration(s.duration_minutes),
  price: formatServicePrice(s.price),
  note: s.note
}));

export default function Home() {
  const products = getFeaturedProducts(FEATURED_IDS).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    images: p.images || [],
    price: formatMoney(p.retail_price),
    note: p.description_short
  }));

  const kits = listResolvedKits(getProducts(), { isVisible: isShopVisible });

  return (
    <>
      <Hero />
      <StickyCtaBar />

      {/* Trust strip */}
      <section className="border-b border-chrome/12 bg-surface">
        <div className="mx-auto grid max-w-shell gap-6 px-6 py-8 sm:grid-cols-3 sm:gap-8 lg:px-10">
          {[
            ['Professional actives', 'Skin Script formulas Emily uses in treatment'],
            ['In-studio + virtual', 'Facials and Zoom consults with a licensed aesthetician'],
            ['Free shipping $49+', 'Flat $7 below threshold, pre-discount']
          ].map(([title, copy]) => (
            <div key={title} className="text-center sm:text-left">
              <p className="font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome">
                {title}
              </p>
              <p className="mt-2 font-body text-sm font-normal leading-relaxed text-charcoal/75">
                {copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Skin quiz + routine — inclusive all ages */}
      <section className="relative overflow-hidden border-b border-chrome/12">
        <div className="mx-auto grid max-w-shell lg:grid-cols-2">
          <div className="flex flex-col justify-center bg-ivory px-6 py-16 sm:px-10 sm:py-20 lg:px-12">
            <p className="eyebrow-line font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome">
              For every chapter of skin
            </p>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-normal leading-[1.1] text-graphite">
              A quiz that listens —
              <br />
              teens to 60 & beyond
            </h2>
            <p className="mt-5 max-w-md font-body text-sm font-normal leading-relaxed text-charcoal/75 sm:text-base">
              Four gentle questions. A morning and evening Skin Script sequence shaped by how your
              skin feels today — not a one-size “anti-aging” script.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/quiz"
                className="btn-primary min-h-[48px] px-8 py-3.5 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
              >
                Take the skin quiz
              </Link>
              <Link
                href="/routine"
                className="btn-ghost min-h-[48px] px-8 py-3.5 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
              >
                Build AM / PM
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-chrome/12 lg:border-l lg:border-t-0">
            {[
              ['Teens', 'First routines, calmer actives'],
              ['20s–30s', 'Clarity, prevention, glow'],
              ['40s–50s', 'Resilience through change'],
              ['60+', 'Comfort, barrier, light']
            ].map(([age, line]) => (
              <div
                key={age}
                className="flex flex-col justify-end border-b border-r border-chrome/12 bg-surface p-6 last:border-r-0 even:border-r-0 sm:p-8 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r"
              >
                <p className="font-display text-2xl font-normal text-graphite sm:text-3xl">{age}</p>
                <p className="mt-2 font-body text-sm font-normal text-charcoal/65">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products — commercial first */}
      <section className="mx-auto max-w-shell px-6 py-20 sm:py-24 lg:px-10" aria-labelledby="home-products">
        <div className="flex flex-wrap items-end justify-between gap-6" data-reveal-group="products-head">
          <div>
            <p
              data-reveal
              className="eyebrow-line font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome"
            >
              Starter routine
            </p>
            <h2
              id="home-products"
              data-reveal
              className="mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-normal text-graphite"
            >
              Where most people start
            </h2>
          </div>
          <Link
            data-reveal
            href="/shop"
            className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-charcoal/75 transition-colors hover:text-charcoal"
          >
            Shop all →
          </Link>
        </div>

        {products.length === 0 ? (
          <div data-reveal className="mt-12 rounded-[2px] border border-chrome/15 bg-surface p-12 text-center">
            <p className="font-display text-xl font-normal text-graphite">Collection loading</p>
            <Link
              href="/shop"
              className="btn-ghost mt-8 inline-block px-8 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div
            className="content-auto mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            data-reveal-group="products"
          >
            {products.map((p, i) => (
              <Link
                key={p.id}
                href={`/shop/${p.id}`}
                data-reveal
                className="group flex flex-col overflow-hidden rounded-[2px] border border-chrome/15 bg-surface shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="relative">
                  <ProductImage
                    product={p}
                    priority={i === 0}
                    quality={70}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 360px"
                  />
                </div>
                <div className="flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-6">
                  <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-chrome">
                    {p.category}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-normal text-graphite group-hover:text-charcoal">
                    {p.name}
                  </h3>
                  <p className="mt-2 flex-1 font-body text-sm font-normal leading-relaxed text-charcoal/70">
                    {p.note}
                  </p>
                  <p className="mt-5 border-t border-chrome/12 pt-4 font-label text-sm font-normal tracking-wide2 text-graphite">
                    {p.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Two paths — book / shop */}
      <section className="border-y border-chrome/12 bg-surface">
        <div className="mx-auto grid max-w-shell md:grid-cols-2" data-reveal-group="doors">
          {[
            {
              href: '/book',
              eyebrow: 'In studio',
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
          ].map((d) => (
            <Link
              key={d.href}
              href={d.href}
              data-reveal
              className={`group flex min-h-[18rem] flex-col justify-between border-chrome/12 p-10 transition-colors sm:min-h-[20rem] sm:p-12 md:border-r md:last:border-r-0 ${
                d.primary ? 'bg-graphite text-pearl hover:bg-[#2a2d36]' : 'bg-surface hover:bg-pearl'
              }`}
            >
              <p
                className={`font-label text-[0.65rem] font-normal uppercase tracking-lockup ${
                  d.primary ? 'text-pearl/55' : 'text-chrome'
                }`}
              >
                {d.eyebrow}
              </p>
              <div className="mt-10">
                <h2
                  className={`font-display text-[clamp(1.85rem,3.5vw,2.5rem)] font-normal leading-[1.1] ${
                    d.primary ? 'text-pearl' : 'text-graphite'
                  }`}
                >
                  {d.title}
                </h2>
                <p
                  className={`mt-4 max-w-sm font-body text-sm font-normal leading-relaxed ${
                    d.primary ? 'text-pearl/70' : 'text-charcoal/70'
                  }`}
                >
                  {d.copy}
                </p>
                <span
                  className={`mt-8 inline-flex items-center gap-3 font-label text-[0.68rem] font-normal uppercase tracking-lockup ${
                    d.primary ? 'text-pearl' : 'text-graphite'
                  }`}
                >
                  {d.cta}
                  <span
                    aria-hidden="true"
                    className={`h-px w-8 transition-[width] duration-400 group-hover:w-12 ${
                      d.primary ? 'bg-pearl/50' : 'bg-chrome/50'
                    }`}
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Kits */}
      {kits.length > 0 && (
        <section className="mx-auto max-w-shell px-6 py-20 sm:py-24 lg:px-10" aria-labelledby="home-kits">
          <div data-reveal-group="kits-head">
            <p
              data-reveal
              className="eyebrow-line font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome"
            >
              Emily would start you here
            </p>
            <h2
              id="home-kits"
              data-reveal
              className="mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-normal text-graphite"
            >
              Starter kits
            </h2>
            <p
              data-reveal
              className="mt-4 max-w-xl font-body text-sm font-normal leading-relaxed text-charcoal/70"
            >
              Full retail pricing — add every step to your bag in one tap, then edit in cart.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 md:gap-6" data-reveal-group="kits">
            {kits.map((kit) => (
              <article
                key={kit.id}
                data-reveal
                className="flex flex-col rounded-[2px] border border-chrome/15 bg-surface p-8 shadow-card"
              >
                <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-chrome">
                  {kit.eyebrow}
                </p>
                <h3 className="mt-3 font-display text-2xl font-normal text-graphite">{kit.name}</h3>
                <p className="mt-3 font-body text-sm font-normal leading-relaxed text-charcoal/70">
                  {kit.description}
                </p>
                <ul className="mt-6 space-y-2.5 border-t border-chrome/12 pt-5">
                  {kit.products.map((p) => (
                    <li
                      key={p.id}
                      className="flex justify-between gap-4 font-body text-sm font-normal text-charcoal/80"
                    >
                      <span>{p.name}</span>
                      <span className="shrink-0 text-charcoal/55">{formatMoney(p.retail_price)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup text-graphite">
                  Kit total {formatMoney(kit.subtotal)}
                  {!kit.complete ? ' · partial (stock)' : ''}
                </p>
                <AddRoutineKit productIds={kit.products.map((p) => p.id)} label="Add kit to bag" />
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Emily — typography-led, no “portrait pending” emptiness */}
      <section className="section-ivory relative">
        <div
          className="relative z-[1] mx-auto max-w-shell px-6 py-20 sm:py-24 lg:px-10"
          data-reveal-group="emily"
        >
          <div className="max-w-3xl">
            <p
              data-reveal
              className="eyebrow-line font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome"
            >
              Aesthetician · Licensed
            </p>
            <h2
              data-reveal
              className="mt-4 font-display text-[clamp(2.1rem,4.5vw,3.2rem)] font-normal leading-[1.08] text-graphite"
            >
              Emily Mitchener
            </h2>
            <p
              data-reveal
              className="mt-7 max-w-2xl font-body text-base font-normal leading-relaxed text-charcoal/80 sm:text-[1.08rem]"
            >
              Emily treats skin carefully: look first, change one variable at a time, and don&apos;t
              sell you a product you don&apos;t need. Every appointment starts with a read of where
              your barrier actually is that week.
            </p>
            <div data-reveal className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="btn-ghost px-8 py-3.5 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
              >
                Meet Emily
              </Link>
              <Link
                href="/virtual-consultation"
                className="btn-primary px-8 py-3.5 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
              >
                Virtual consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-shell px-6 py-20 sm:py-24 lg:px-10" aria-labelledby="home-services">
        <div data-reveal-group="services-head" className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p
              data-reveal
              className="eyebrow-line font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome"
            >
              In studio
            </p>
            <h2
              id="home-services"
              data-reveal
              className="mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] font-normal text-graphite"
            >
              Treatment menu
            </h2>
          </div>
          <Link
            data-reveal
            href="/services"
            className="font-label text-[0.7rem] font-normal uppercase tracking-lockup text-charcoal/75 hover:text-charcoal"
          >
            See all services →
          </Link>
        </div>

        <ul
          className="mt-12 overflow-hidden rounded-[2px] border border-chrome/15 bg-surface"
          data-reveal-group="services"
        >
          {services.map((s) => (
            <li key={s.id} data-reveal className="border-b border-chrome/12 last:border-b-0">
              <Link
                href={`/book?service=${s.id}`}
                className="group grid gap-3 px-5 py-7 transition-colors hover:bg-pearl/80 md:grid-cols-[1.1fr_1.4fr_auto] md:items-center md:gap-6 md:px-8"
              >
                <h3 className="font-display text-xl font-normal text-graphite group-hover:text-charcoal sm:text-2xl">
                  {s.name}
                </h3>
                <p className="font-body text-sm font-normal leading-relaxed text-charcoal/70">
                  {s.note}
                </p>
                <p className="font-label text-[0.68rem] font-normal uppercase tracking-lockup text-chrome md:text-right">
                  {s.duration} · {s.price}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ / help */}
      <section className="border-t border-chrome/12 bg-surface">
        <div
          className="mx-auto flex max-w-shell flex-col gap-6 px-6 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-10"
          data-reveal-group="faq-teaser"
        >
          <div className="max-w-xl">
            <p
              data-reveal
              className="eyebrow-line font-label text-[0.65rem] font-normal uppercase tracking-lockup text-chrome"
            >
              Help
            </p>
            <h2
              data-reveal
              className="mt-3 font-display text-[clamp(1.5rem,3vw,2rem)] font-normal text-graphite"
            >
              Shipping, appointments, products
            </h2>
          </div>
          <Link
            data-reveal
            href="/faq"
            className="btn-ghost inline-flex min-h-[44px] shrink-0 items-center px-8 py-3.5 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
          >
            Read the FAQ
          </Link>
        </div>
      </section>
    </>
  );
}
