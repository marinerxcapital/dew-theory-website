import Link from 'next/link';
import Rule from '@/components/Rule';
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
    images: [{ url: '/logo-dewtheory-og-20260825.png', alt: 'Dew Theory' }]
  },
  robots: { index: true, follow: true }
};

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

export default async function VirtualConsultationPage({ searchParams }) {
  const sp = await searchParams;
  const cancelled = sp?.cancelled === '1';
  const pub = getPublicConsultationConfig();

  return (
    <>
      <section className="relative mx-auto max-w-shell px-6 pb-16 pt-12 sm:pb-20 sm:pt-14 lg:px-10 lg:pt-16">
        <div data-reveal-group="vc-hero">
          <p
            data-reveal
            className="dew-badge inline-flex px-3 py-1.5 font-label text-[0.62rem] font-normal uppercase tracking-lockup"
          >
            One-on-one · Online · Personalized
          </p>
          <h1
            data-reveal
            className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,3.8rem)] font-normal leading-[1.05] text-ink"
          >
            Dew Theory Virtual Consultation
          </h1>
          <p
            data-reveal
            className="mt-6 max-w-2xl font-body text-base font-normal leading-relaxed text-muted sm:text-[1.05rem]"
          >
            Meet with Emily by Zoom for a focused review of your skin, current products, habits,
            and goals. You&apos;ll leave with a clear direction — and receive a personalized
            morning and evening routine after your appointment.
          </p>
          <p
            data-reveal
            className="mt-5 font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew"
          >
            Secure intake · Private photo upload · Personalized plan within 24–48 hours
            {pub.durationMinutes ? ` · About ${pub.durationMinutes} minutes` : ''}
          </p>
          {cancelled ? (
            <p
              data-reveal
              className="mt-6 max-w-xl border border-border bg-surface-light px-5 py-4 font-body text-sm font-normal text-ink/80"
              role="status"
            >
              Checkout was cancelled. No charge was made. You can book again when ready.
            </p>
          ) : null}
          <div data-reveal className="mt-8">
            <a
              href="#book"
              className="btn-primary inline-flex min-h-[44px] items-center px-9 py-4 font-label text-[0.7rem] font-normal uppercase tracking-lockup"
            >
              Book your consultation
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface-light">
        <div
          className="mx-auto max-w-shell px-6 py-16 sm:py-20 lg:px-10"
          data-reveal-group="vc-before"
        >
          <Rule left="Prepare" right="Before" data-reveal />
          <h2
            data-reveal
            className="mt-8 font-display text-[clamp(1.75rem,3.5vw,2.4rem)] font-normal text-ink"
          >
            Before your appointment
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2">
            {BEFORE.map((item, i) => (
              <li
                key={item.title}
                data-reveal
                className="rounded-[3px] border border-border bg-white p-6 shadow-card sm:p-7"
              >
                <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew">
                  Step {i + 1}
                </p>
                <h3 className="mt-2 font-display text-xl font-normal text-ink">{item.title}</h3>
                <p className="mt-3 font-body text-sm font-normal leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-6 py-16 sm:py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2" data-reveal-group="vc-during-after">
          <div>
            <Rule left="Together" right="Live" data-reveal />
            <h2
              data-reveal
              className="mt-8 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-normal text-ink"
            >
              During your consultation
            </h2>
            <p data-reveal className="mt-4 font-body text-sm font-normal text-muted">
              Together we&apos;ll:
            </p>
            <ul className="mt-6 space-y-3">
              {DURING.map((t) => (
                <li
                  key={t}
                  data-reveal
                  className="flex gap-3 font-body text-sm font-normal leading-relaxed text-ink/80"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-dew" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Rule left="Follow-up" right="Plan" data-reveal />
            <h2
              data-reveal
              className="mt-8 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-normal text-ink"
            >
              After your consultation
            </h2>
            <p data-reveal className="mt-4 font-body text-sm font-normal text-muted">
              Within 24–48 hours, you&apos;ll receive:
            </p>
            <ul className="mt-6 space-y-3">
              {AFTER.map((t) => (
                <li
                  key={t}
                  data-reveal
                  className="flex gap-3 font-body text-sm font-normal leading-relaxed text-ink/80"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-dew" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <p
              data-reveal
              className="mt-8 font-body text-sm font-normal leading-relaxed text-muted"
            >
              Thank you for choosing Dew Theory. Emily looks forward to helping you build a
              thoughtful routine for healthy, glowing skin.
            </p>
          </div>
        </div>
      </section>

      <section id="book" className="border-t border-border bg-surface-light">
        <div className="mx-auto max-w-shell px-6 py-16 sm:py-20 lg:px-10">
          <VirtualConsultationCheckout />
          <p className="mx-auto mt-8 max-w-lg text-center font-body text-xs font-normal leading-relaxed text-muted">
            Virtual consultations provide aesthetic skincare guidance and do not replace
            evaluation, diagnosis, or treatment by a licensed medical professional.{' '}
            <a href="mailto:hello@dewtheory.studio" className="underline decoration-border underline-offset-2 hover:text-ink">
              Questions? Email us
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
