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

      {/* Philosophy — calm monday */}
      <section className="border-b border-border bg-ivory" aria-labelledby="philosophy-heading">
        <div className="mx-auto max-w-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-10">
          <p className="editorial-label">Dew Theory / Philosophy</p>
          <h2
            id="philosophy-heading"
            className="editorial-quote mt-5 max-w-3xl text-[clamp(2rem,5vw,3.5rem)]"
          >
            a calm monday
          </h2>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-muted sm:text-lg">
            Barrier-first care. Fewer products that earn their place. Guidance that feels like a
            deep breath — not another algorithm telling you what to buy.
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border section-stone" aria-label="Trust signals">
        <div className="mx-auto grid max-w-shell gap-6 px-5 py-8 sm:grid-cols-2 sm:gap-8 sm:px-6 lg:grid-cols-4 lg:px-10">
          {[
            ['Free shipping $49+', `Flat ${formatMoney(FLAT_SHIPPING_USD)} below threshold`],
            ['Skin Script professional', 'The actives Emily uses in treatment'],
            ['In-studio + virtual', 'Facials and Zoom consults'],
            ['Aesthetician-led', 'Barrier-first guidance from Emily']
          ].map(([title, copy]) => (
            <div key={title}>
              <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-forest">
                {title}
              </p>
              <p className="mt-1.5 font-body text-sm font-normal leading-relaxed text-forest/75">
                {copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Emily's Picks — this is what you need */}
      <section className="border-b border-border bg-ivory py-14 sm:py-16">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="editorial-label">this is what you need</p>
              <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-forest">
                Emily&apos;s picks
              </h2>
              <p className="mt-2 max-w-md font-body text-sm text-muted">
                Where most people start — sequenced for home, chosen the way Emily chooses in the room.
              </p>
            </div>
            <Link
              href="/shop"
              className="font-label text-[0.65rem] uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
            >
              Shop all
            </Link>
          </div>
          <Suspense fallback={null}>
            <ProductRail products={emilyPicks} label="Emily's picks" />
          </Suspense>
        </div>
      </section>

      {/* Reassurance band */}
      <section className="section-sage border-b border-border" aria-labelledby="reassure-heading">
        <div className="mx-auto max-w-shell px-5 py-16 sm:px-6 sm:py-20 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-12 lg:px-10 lg:py-24">
          <div>
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-forest/70">
              by emily | hydration specialist
            </p>
            <h2
              id="reassure-heading"
              className="editorial-quote mt-4 text-[clamp(2.1rem,5vw,3.75rem)]"
            >
              relax. i&apos;ve got you covered
            </h2>
          </div>
          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-forest/85 lg:mt-0">
            Look first. Change one variable at a time. Never sell a product your barrier doesn&apos;t
            ask for. That&apos;s the Dew Theory rhythm.
          </p>
        </div>
      </section>

      {/* Myth busting education — educational only, not a bookable service */}
      <section className="border-b border-border bg-ivory py-14 sm:py-16" aria-labelledby="myth-heading">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <p className="editorial-label">Dew Theory / Myth Busting</p>
          <h2
            id="myth-heading"
            className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.6rem)] text-forest"
          >
            let&apos;s debunk the worst advice going viral rn
          </h2>
          <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-muted">
            Trends move faster than barriers heal. Education first — then a plan that fits your skin,
            not a feed.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="border border-border bg-white p-6 sm:p-8">
              <p className="font-label text-[0.58rem] uppercase tracking-lockup text-sage-deep">
                Viral caution
              </p>
              <h3 className="mt-3 font-display text-2xl italic text-forest sm:text-3xl">
                tiktok made me do it... and now my barrier is ruined
              </h3>
              <p className="mt-4 font-body text-sm leading-relaxed text-muted">
                Stacking acids, retinoids, and &ldquo;glass skin&rdquo; routines overnight is a common
                path to redness and reactivity. Slow sequencing beats a seven-step haul.
              </p>
              <Link
                href="/quiz"
                className="mt-6 inline-flex font-label text-[0.62rem] uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
              >
                Start with a gentler read →
              </Link>
            </article>
            <article className="border border-border bg-surface-light p-6 sm:p-8">
              <p className="font-label text-[0.58rem] uppercase tracking-lockup text-sage-deep">
                Education · not a menu item
              </p>
              <h3 className="mt-3 font-display text-2xl italic text-forest sm:text-3xl">
                what is PDRN?
              </h3>
              <p className="mt-2 font-body text-sm italic text-forest/70">
                salmon DNA skin booster — a phrase you&apos;ll see online
              </p>
              <p className="mt-4 font-body text-sm leading-relaxed text-muted">
                PDRN (polydeoxyribonucleotide) shows up in beauty content as a &ldquo;salmon DNA&rdquo;
                booster. Dew Theory does not currently list PDRN as a bookable treatment or retail
                SKU. Ask Emily before chasing any viral ingredient — your barrier comes first.
              </p>
              <Link
                href="/faq"
                className="mt-6 inline-flex font-label text-[0.62rem] uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
              >
                Read the FAQ →
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Shop by concern */}
      <section className="border-b border-border bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
            Shop by concern
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-forest">
            What are you working on?
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {concerns.map((c) => (
              <Link
                key={c}
                href={`/shop?concern=${encodeURIComponent(c)}`}
                className="group border border-border bg-ivory p-5 transition-colors hover:border-forest hover:bg-dew-soft"
              >
                <p className="font-display text-xl text-forest group-hover:text-sage-deep">{c}</p>
                <p className="mt-2 font-label text-[0.58rem] uppercase tracking-lockup text-muted">
                  Shop →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by type */}
      <section className="border-b border-border bg-ivory py-14 sm:py-16">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
            Shop by type
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-forest">
            Build your shelf
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {types.map((t) => (
              <Link
                key={t}
                href={`/shop?type=${encodeURIComponent(t)}`}
                className="filter-chip rounded-[2px] px-4 py-2.5 font-label text-[0.65rem] uppercase tracking-lockup text-forest hover:bg-forest hover:text-ivory"
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
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-sage-deep">
              ~2 minutes · teens to 60+
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.1] text-forest">
              A quiz that listens
            </h2>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-forest/80">
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
              <div
                key={title}
                className="border-b border-r border-border bg-white p-6 last:border-b-0 even:border-r-0 sm:p-8"
              >
                <p className="font-label text-[0.62rem] uppercase tracking-lockup text-sage-deep">
                  {title}
                </p>
                <p className="mt-2 font-body text-sm text-muted">{copy}</p>
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
              <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-forest">
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
                  className="flex items-center gap-4 border border-border bg-ivory px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-deep text-sm font-label text-ivory">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm text-forest">{p.name}</p>
                    <p className="font-label text-[0.55rem] uppercase tracking-lockup text-muted">
                      {p.category}
                    </p>
                  </div>
                  <p className="font-label text-sm text-forest">{formatMoney(p.retail_price)}</p>
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
            <p className="editorial-label">Emily would start you here</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-forest">
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
                  <h3 className="mt-2 font-display text-2xl text-forest">{kit.name}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-muted">
                    {kit.description}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2 border-t border-border pt-5">
                    {kit.products.map((p) => (
                      <li key={p.id} className="flex justify-between gap-3 font-body text-sm">
                        <span className="text-forest">{p.name}</span>
                        <span className="shrink-0 text-muted">{formatMoney(p.retail_price)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <p className="font-label text-sm uppercase tracking-wide2 text-forest">
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
      <section className="border-b border-border bg-ivory py-14 sm:py-16">
        <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
                In studio
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] text-forest">
                Treatment menu
              </h2>
              <p className="mt-3 max-w-lg font-body text-sm text-muted">
                Menu details are being finalized — request an appointment and Emily will confirm
                timing and investment.
              </p>
            </div>
            <Link
              href="/services"
              className="font-label text-[0.65rem] uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
            >
              See all services →
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/book?service=${encodeURIComponent(s.id)}`}
                className="group flex flex-col border border-border bg-white p-5 transition-colors hover:border-sage-deep"
              >
                <p className="font-display text-xl text-forest group-hover:text-sage-deep">{s.name}</p>
                <p className="mt-2 flex-1 font-body text-sm text-muted">{s.note}</p>
                <p className="mt-4 font-label text-[0.6rem] uppercase tracking-lockup text-muted">
                  {s.duration} · {s.price}
                </p>
                <span className="mt-3 font-label text-[0.62rem] uppercase tracking-lockup text-sage-deep">
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
          <div className="border-b border-border bg-forest px-5 py-14 text-ivory sm:px-10 sm:py-16 lg:border-b-0 lg:border-r lg:px-12">
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-ivory/55">
              From anywhere
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.6rem)] text-ivory">
              Virtual consultation
            </h2>
            <p className="mt-4 max-w-md font-body text-base leading-relaxed text-ivory/75">
              Secure intake, private photos, and a personalized AM/PM plan — without leaving home.
            </p>
            <Link
              href="/virtual-consultation"
              className="btn-ghost mt-8 inline-flex border-ivory/30 bg-transparent px-8 py-3.5 font-label text-[0.68rem] uppercase tracking-lockup text-ivory hover:border-ivory hover:bg-ivory/10"
            >
              Book virtual consult
            </Link>
          </div>
          <div className="bg-stone px-5 py-14 sm:px-10 sm:py-16 lg:px-12">
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-forest/65">
              Aesthetician · Licensed
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.6rem)] text-forest">
              Emily Mitchener
            </h2>
            <blockquote className="mt-5 max-w-md font-display text-xl italic leading-snug text-forest sm:text-2xl">
              I&apos;d rather be exhausted building my dream than comfortable watching it pass me by
            </blockquote>
            <p className="mt-5 max-w-md font-body text-base leading-relaxed text-forest/80">
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
      <section className="bg-ivory py-14 sm:py-16">
        <div className="mx-auto grid max-w-shell gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">Help</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Shipping, appointments, products</h2>
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
            <p className="font-label text-[0.62rem] uppercase tracking-lockup text-sage-deep">
              Stay in the plan
            </p>
            <h2 className="mt-2 font-display text-3xl text-forest">Membership interest</h2>
            <p className="mt-3 font-body text-sm text-forest/80">
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
