import Link from 'next/link';
import VirtualConsultationCheckout from '@/components/VirtualConsultationCheckout';
import { getPublicConsultationConfig } from '@/lib/consultations/config.js';

export const metadata = {
  title: 'Virtual Consultation',
  description:
    'Meet Emily by Zoom for a focused skin review. Secure intake, private photo upload, and a personalized morning and evening routine within 24–48 hours.',
  alternates: { canonical: '/virtual-consultation' },
  openGraph: {
    title: 'Dew Theory Virtual Consultation',
    description:
      'One-on-one online skincare consultation with Emily Mitchener — personalized plan and product recommendations.',
    type: 'website',
    images: [{ url: '/logo.png', alt: 'Dew Theory' }]
  },
  robots: { index: true, follow: true }
};

const HOW_IT_WORKS = [
  {
    title: 'Book',
    body: 'Reserve your virtual consultation online. You’ll receive confirmation and next steps by email.'
  },
  {
    title: 'Secure intake + photos',
    body: 'Complete your private intake and upload clear daylight photos through a secure, tokenized link.'
  },
  {
    title: 'Meet with Emily',
    body: 'Join by Zoom for a focused review of your barrier, products, habits, and goals.'
  },
  {
    title: 'Receive your routine',
    body: 'Within 24–48 hours, get a personalized morning and evening plan with product guidance.'
  }
];

const BEFORE = [
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
    body: 'When possible, avoid strong active products for 24–48 hours before taking your photos and joining the consultation. This may include retinoids, exfoliating acids, benzoyl peroxide, scrubs, and strong masks. Do not stop a prescribed medication or prescription skincare treatment unless your prescribing clinician has told you to do so.'
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
  },
  {
    title: 'Be ready to discuss',
    body: 'Skin goals, previous products, lifestyle, diet and hydration, stress, sleep, hormonal changes, makeup habits, SPF use, and long-term treatment direction.'
  }
];

const DURING = [
  'Analyze your skin',
  'Identify your skin type',
  'Discuss possible triggers',
  'Build a customized morning routine',
  'Build a customized evening routine',
  'Recommend Skin Script products that fit your goals',
  'Discuss treatment expectations and timeline',
  'Create a maintenance plan'
];

const AFTER = [
  'Personalized skincare routine',
  'Product recommendations with purchase links',
  'Instructions for each product',
  'Product layering order',
  'Weekly routine schedule',
  'Tips to maximize results'
];

export default function VirtualConsultationPage({ searchParams }) {
  const cancelled = searchParams?.cancelled === '1';
  const pub = getPublicConsultationConfig();

  return (
    <>
      <section className="relative mx-auto max-w-shell px-5 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:px-10">
        <div data-reveal-group="vc-hero">
          <p
            data-reveal
            className="font-label text-[0.65rem] font-normal uppercase tracking-lockup text-dew"
          >
            One-on-one · Online · Personalized
          </p>
          <h1
            data-reveal
            className="mt-4 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-normal leading-[1.05] text-ink"
          >
            Virtual Consultation
          </h1>
          <p
            data-reveal
            className="mt-5 max-w-2xl font-body text-base font-normal leading-relaxed text-muted sm:text-[1.05rem]"
          >
            Meet with Emily by Zoom for a focused review of your skin, current products, habits, and
            goals. You&apos;ll leave with clear direction — and receive a personalized morning and
            evening routine after your appointment.
          </p>
          <div
            data-reveal
            className="mt-6 flex flex-wrap gap-2"
          >
            {[
              'Secure intake',
              'Private photo upload',
              'Personalized AM/PM plan',
              pub.durationMinutes ? `About ${pub.durationMinutes} minutes` : null
            ]
              .filter(Boolean)
              .map((t) => (
                <span
                  key={t}
                  className="dew-badge rounded-full px-3 py-1.5 font-label text-[0.55rem] uppercase tracking-lockup"
                >
                  {t}
                </span>
              ))}
          </div>
          {cancelled ? (
            <p
              data-reveal
              className="mt-6 max-w-xl border border-border bg-surface-light px-5 py-4 font-body text-sm text-charcoal"
              role="status"
            >
              Checkout was cancelled. No charge was made. You can book again when ready.
            </p>
          ) : null}
          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            <a
              href="#book"
              className="btn-dew inline-flex min-h-[44px] items-center px-9 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
            >
              Book virtual consultation
            </a>
            <Link
              href="/contact"
              className="btn-ghost inline-flex min-h-[44px] items-center px-8 py-4 font-label text-[0.7rem] uppercase tracking-lockup"
            >
              Have a question?
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-dew-surface">
        <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-16 lg:px-10">
          <p className="font-label text-[0.62rem] uppercase tracking-lockup text-dew">How it works</p>
          <h2 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.4rem)] text-ink">
            Four clear steps
          </h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <li key={step.title} className="border border-dew/15 bg-white p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dew font-label text-xs text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl text-ink">{step.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-16 lg:px-10" data-reveal-group="vc-before">
          <p data-reveal className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
            Prepare
          </p>
          <h2
            data-reveal
            className="mt-2 font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-normal text-ink"
          >
            Before your appointment
          </h2>
          <div className="mt-8 space-y-3">
            {BEFORE.map((item, i) => (
              <details
                key={item.title}
                data-reveal
                className="group border border-border bg-surface-light open:bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-lg text-ink marker:content-none [&::-webkit-details-marker]:hidden sm:px-6">
                  <span>
                    <span className="mr-3 font-label text-[0.58rem] uppercase tracking-lockup text-dew">
                      {i + 1}
                    </span>
                    {item.title}
                  </span>
                  <span className="text-muted transition group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="border-t border-border px-5 py-4 font-body text-sm leading-relaxed text-muted sm:px-6">
                  {item.body}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2" data-reveal-group="vc-during-after">
          <div>
            <p data-reveal className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
              Together · Live
            </p>
            <h2
              data-reveal
              className="mt-2 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-normal text-ink"
            >
              During your consultation
            </h2>
            <ul className="mt-6 space-y-3">
              {DURING.map((t) => (
                <li
                  key={t}
                  data-reveal
                  className="flex gap-3 font-body text-sm font-normal leading-relaxed text-charcoal"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dew" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p data-reveal className="font-label text-[0.62rem] uppercase tracking-lockup text-muted">
              Follow-up · Plan
            </p>
            <h2
              data-reveal
              className="mt-2 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-normal text-ink"
            >
              After your consultation
            </h2>
            <p data-reveal className="mt-4 font-body text-sm text-muted">
              Within 24–48 hours, you&apos;ll receive:
            </p>
            <ul className="mt-6 space-y-3">
              {AFTER.map((t) => (
                <li
                  key={t}
                  data-reveal
                  className="flex gap-3 font-body text-sm font-normal leading-relaxed text-charcoal"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dew" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="book" className="border-t border-border bg-surface-light">
        <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 sm:py-16 lg:px-10">
          <VirtualConsultationCheckout />
          <p className="mx-auto mt-8 max-w-lg text-center font-body text-xs font-normal leading-relaxed text-muted">
            Virtual consultations provide aesthetic skincare guidance and do not replace evaluation,
            diagnosis, or treatment by a licensed medical professional.{' '}
            <Link href="/contact" className="text-dew underline underline-offset-2">
              Questions? Contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
