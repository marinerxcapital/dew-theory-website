import { withPageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import HowConsultationWorks from '@/components/home/HowConsultationWorks';
import MeetEmily from '@/components/home/MeetEmily';
import Rule from '@/components/Rule';
import VirtualConsultationCheckout from '@/components/VirtualConsultationCheckout';
import { getPublicConsultationConfig } from '@/lib/consultations/config.js';

export const metadata = withPageMetadata('/virtual-consultation', {
  title: 'Virtual Consultation',
  description:
    'Meet Emily by Zoom for a focused skin review. Secure intake, private photo upload, and a personalized morning and evening routine within 24-48 hours.',
  alternates: { canonical: '/virtual-consultation' },
  openGraph: {
    title: 'Dew Theory Virtual Consultation',
    description:
      'One-on-one online skincare consultation with Emily Mitchener — personalized plan and product recommendations.',
    type: 'website',
    url: '/virtual-consultation',
    images: [{ url: '/logo-dewtheory-glass-wordmark-transparent.png', alt: 'Dew Theory' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dew Theory Virtual Consultation',
    description:
      'One-on-one online skincare consultation with Emily Mitchener — personalized plan and product recommendations.',
    images: ['/logo-dewtheory-glass-wordmark-transparent.png']
  },
  robots: { index: true, follow: true }
});

/** Three primary benefits — the promise, stated plainly. */
const BENEFITS = [
  {
    title: 'Understand your skin',
    body: 'A focused read of what is actually happening — not a generic routine pulled off a shelf.'
  },
  {
    title: 'Build your routine',
    body: 'A morning and evening sequence in professional order, written for the products you own and the ones you need.'
  },
  {
    title: 'Know what to buy',
    body: 'Clear Skin Script recommendations with purchase links, so you buy once and buy the right thing.'
  }
];

/** What the appointment actually covers — no medical claims. */
const COVER = [
  'Your current cleansers, serums, moisturizers, treatments, and SPF',
  'How your skin behaves day to day, and what changes it',
  'Barrier condition and how much active your skin is ready for',
  'Layering order, frequency, and what to introduce first',
  'What to pause, what to keep, and what to add',
  'Budget and the amount of time you will realistically spend'
];

const LEAVE_WITH = [
  'Personalized morning and evening routine',
  'Product recommendations with purchase links',
  'Clear instructions and layering order',
  'Weekly rhythm and tips to stay consistent'
];

const PREPARE = [
  {
    title: 'Complete your intake form',
    body: 'Please submit your intake form at least 24 hours before your appointment. You will receive a secure link after payment.'
  },
  {
    title: 'Upload photos',
    body: 'Upload clear photos in natural daylight with no filters. Remove makeup, sunscreen, tinted moisturizer, and self-tanner, and pull your hair away from your face. Required: front, left, right, forehead, cheeks, chin/jawline, plus any areas of concern.'
  },
  {
    title: 'Pause strong active products, when appropriate',
    body: 'When possible, avoid strong active products for 24-48 hours before taking your photos and joining the consultation. This may include retinoids, exfoliating acids, benzoyl peroxide, scrubs, and strong masks. Do not stop a prescribed medication or prescription skincare treatment unless your prescribing clinician has told you to do so.'
  },
  {
    title: 'Bring your products',
    body: 'Have cleansers, serums, moisturizers, SPF, masks, toners, spot treatments, and prescription products nearby so you can show Emily what you use.'
  },
  {
    title: 'Join from good lighting',
    body: 'Sit near a window when possible, face the light, use a quiet location and stable internet, and avoid a bright window behind you.'
  },
  {
    title: 'Have these ready',
    body: 'Know your skincare budget, time you are willing to spend, and whether you prefer a simple or advanced regimen.'
  }
];

const FAQ = [
  {
    q: 'What happens after I pay?',
    a: 'You receive scheduling and intake links. Complete the intake form and upload your photos at least 24 hours before the appointment, then join the Zoom at your booked time.'
  },
  {
    q: 'How long is the appointment?',
    a: 'The session length is shown in the booking details before you commit. Plan on a focused one-on-one review of your skin, products, and goals.'
  },
  {
    q: 'When do I get my routine?',
    a: 'Your personalized morning and evening plan is written within 24-48 hours after the appointment.'
  },
  {
    q: 'Are my photos private?',
    a: 'Yes. Intake photos stay on a private token path for Emily to review. They are not published anywhere and are never added to public product galleries.'
  },
  {
    q: 'Can I reschedule or cancel?',
    a: 'Cancellation and rescheduling terms are published in full on the booking policy page before you pay.'
  },
  {
    q: 'Is this medical care?',
    a: 'No. A virtual consultation provides aesthetic skincare guidance. It does not replace evaluation, diagnosis, or treatment by a licensed medical professional.'
  }
];

export default async function VirtualConsultationPage({ searchParams }) {
  const sp = await searchParams;
  const cancelled = sp?.cancelled === '1';
  const pub = getPublicConsultationConfig();

  return (
    <>
      {/* 01 — HERO */}
      <section
        className="spectral-wash relative border-b border-border"
        aria-labelledby="vc-hero"
      >
        <div className="mx-auto max-w-shell px-6 pb-16 pt-14 sm:pb-20 sm:pt-16 lg:px-10 lg:pt-20">
          <div data-reveal-group="vc-hero">
            <p
              data-reveal
              className="dew-badge inline-flex px-3 py-1.5 font-label text-[0.62rem] font-normal uppercase tracking-lockup"
            >
              1:1 virtual skincare consultation
            </p>
            <h1
              id="vc-hero"
              data-reveal
              className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,3.8rem)] font-normal leading-[1.05] text-ink"
            >
              Your skin, one-on-one.
            </h1>
            <p
              data-reveal
              className="mt-6 max-w-2xl font-body text-base font-normal leading-relaxed text-muted sm:text-[1.05rem]"
            >
              Meet Emily for a focused review of your skin, current products, habits, and goals.
              You&apos;ll leave with clear direction, and a personalized morning and evening plan
              after your appointment.
            </p>
            <p
              data-reveal
              className="mt-5 font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew"
            >
              Zoom
              {pub.durationMinutes ? ` · About ${pub.durationMinutes} minutes` : ''}
              {' · '}Secure intake · Private photo upload · Plan within 24-48 hours
            </p>

            {cancelled ? (
              <p
                data-reveal
                className="mt-6 max-w-xl border border-border bg-white/80 px-5 py-4 font-body text-sm font-normal text-charcoal"
                role="status"
              >
                Checkout was cancelled. No charge was made. You can book again when ready.
              </p>
            ) : null}

            <div data-reveal className="mt-8 flex flex-wrap gap-3">
              <a
                href="#book"
                className="btn-primary inline-flex min-h-[50px] items-center px-9 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
              >
                Book consultation
              </a>
              <Link
                href="/skin-quiz"
                className="btn-ghost inline-flex min-h-[50px] items-center px-8 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
              >
                Or take the quiz
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 02 — VALUE PROPOSITION */}
      <section className="border-b border-border bg-ivory" aria-labelledby="vc-benefits">
        <div className="mx-auto max-w-shell px-6 py-16 sm:py-20 lg:px-10">
          <Rule left="Why 1:1" right="Three things you walk away with" data-reveal />
          <h2
            id="vc-benefits"
            data-reveal
            className="mt-8 max-w-2xl font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-normal text-ink"
          >
            Three things you walk away with
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <li
                key={b.title}
                data-reveal
                className="border border-border bg-white p-6 sm:p-7"
              >
                <h3 className="font-display text-xl font-normal text-ink">{b.title}</h3>
                <p className="mt-3 font-body text-sm font-normal leading-relaxed text-muted">
                  {b.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 03 — HOW IT WORKS */}
      <HowConsultationWorks />

      {/* 04 — WHAT WE'LL COVER */}
      <section className="border-b border-border bg-surface-light" aria-labelledby="vc-cover">
        <div className="mx-auto max-w-shell px-6 py-16 sm:py-20 lg:px-10">
          <Rule left="Agenda" right="What we will cover" data-reveal />
          <h2
            id="vc-cover"
            data-reveal
            className="mt-8 max-w-2xl font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-normal text-ink"
          >
            What we will cover
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {COVER.map((item) => (
              <li
                key={item}
                data-reveal
                className="flex gap-3 border border-border bg-white p-5 font-body text-sm font-normal leading-relaxed text-charcoal sm:p-6"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-dew" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 05 — WHAT YOU RECEIVE */}
      <section className="border-b border-border bg-ivory" aria-labelledby="vc-receive">
        <div className="mx-auto max-w-shell px-6 py-16 sm:py-20 lg:px-10">
          <Rule left="Outcome" right="What you'll leave with" data-reveal />
          <h2
            id="vc-receive"
            data-reveal
            className="mt-8 font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-normal text-ink"
          >
            What you&apos;ll leave with
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {LEAVE_WITH.map((t) => (
              <li
                key={t}
                data-reveal
                className="flex gap-3 border border-border bg-white p-5 font-body text-sm font-normal leading-relaxed text-charcoal sm:p-6"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-dew" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 06 — MEET EMILY */}
      <MeetEmily />

      {/* 07 — BOOKING */}
      <section id="book" className="border-b border-border bg-ivory" aria-labelledby="vc-book">
        <div className="mx-auto max-w-shell px-6 py-16 sm:py-20 lg:px-10">
          <div className="mx-auto mb-10 max-w-xl text-center" data-reveal>
            <p className="editorial-label">Booking</p>
            <h2
              id="vc-book"
              className="mt-3 font-display text-[clamp(1.9rem,3.8vw,2.6rem)] font-normal leading-tight text-ink"
            >
              Book your consultation
            </h2>
          </div>

          <VirtualConsultationCheckout />

          <p className="mx-auto mt-8 max-w-lg text-center font-body text-xs font-normal leading-relaxed text-muted">
            Virtual consultations provide aesthetic skincare guidance and do not replace
            evaluation, diagnosis, or treatment by a licensed medical professional.{' '}
            <a
              href="mailto:hello@dewtheory.studio"
              className="underline decoration-border underline-offset-2 hover:text-ink"
            >
              Questions? Email us
            </a>
            .
          </p>
        </div>
      </section>

      {/* 08 — PREPARATION */}
      <section className="border-b border-border bg-surface-light" aria-labelledby="vc-prep">
        <div className="mx-auto max-w-shell px-6 py-16 sm:py-20 lg:px-10">
          <Rule left="Prepare" right="Optional reading" data-reveal />
          <h2
            id="vc-prep"
            data-reveal
            className="mt-8 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-normal text-ink"
          >
            Preparation tips
          </h2>
          <p data-reveal className="mt-4 max-w-2xl font-body text-sm font-normal text-muted">
            Helpful before your Zoom — not required reading to book.
          </p>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2">
            {PREPARE.map((item, i) => (
              <li
                key={item.title}
                data-reveal
                className="border border-border bg-white p-5 sm:p-6"
              >
                <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew">
                  {i + 1}. {item.title}
                </p>
                <p className="mt-3 font-body text-sm font-normal leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 09 — FAQ */}
      <section id="faq" className="border-b border-border bg-ivory" aria-labelledby="vc-faq">
        <div className="mx-auto max-w-shell px-6 py-16 sm:py-20 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div data-reveal>
              <p className="editorial-label">questions</p>
              <h2
                id="vc-faq"
                className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-normal text-ink"
              >
                Before you book
              </h2>
            </div>
            <div className="divide-y divide-border border-t border-border">
              {FAQ.map((item) => (
                <details key={item.q} className="group py-5" data-reveal>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-label text-[0.68rem] font-normal uppercase tracking-lockup text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      className="text-muted transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10 — FINAL CTA */}
      <section className="bg-ivory" aria-labelledby="vc-final">
        <div className="mx-auto max-w-shell px-6 py-16 sm:py-20 lg:px-10">
          <div
            className="flex flex-col items-start justify-between gap-8 border border-border bg-white p-8 sm:p-10 lg:flex-row lg:items-center"
            data-reveal-group="vc-final"
          >
            <div className="max-w-2xl" data-reveal>
              <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-dew">
                Personalized skincare, from home
              </p>
              <h2
                id="vc-final"
                className="mt-3 font-display text-[clamp(1.8rem,3.8vw,2.6rem)] font-normal leading-tight text-ink"
              >
                Stop guessing at your routine.
              </h2>
              <p className="mt-4 max-w-xl font-body text-base font-normal leading-relaxed text-muted">
                One focused conversation, then a plan you can actually follow.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center" data-reveal>
              <a
                href="#book"
                className="btn-primary inline-flex min-h-[48px] items-center justify-center px-9 py-4 text-center font-label text-[0.7rem] font-normal uppercase tracking-lockup"
              >
                Book a virtual consultation
              </a>
              <Link
                href="/shop"
                className="inline-flex min-h-[44px] items-center justify-center px-4 font-label text-[0.65rem] font-normal uppercase tracking-lockup text-ink hover:text-ink"
              >
                Browse skincare
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
