import Link from 'next/link';
import Rule from '@/components/Rule';
import StickyCtaBar from '@/components/StickyCtaBar';
import { getBookingPolicy } from '@/lib/email';
import {
  SERVICES,
  formatDuration,
  formatServicePrice
} from '@/lib/services';

export const metadata = {
  title: 'Facial Services & Treatments',
  description:
    'In-studio facial treatments with licensed aesthetician Emily Mitchener. Barrier read first, then the right protocol for that week. Book online.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Facial Services — Dew Theory',
    description:
      'In-studio facials with Emily Mitchener. Barrier read first, then the right protocol.',
    url: '/services'
  }
};

export default function ServicesPage() {
  const bookingPolicy = getBookingPolicy();

  return (
    <section
      data-services-menu
      className="relative mx-auto max-w-shell px-6 pb-32 pt-12 sm:pb-32 sm:pt-14 lg:px-10 lg:pt-16"
    >
      <StickyCtaBar />
      <div data-reveal-group="svc-head">
        <Rule left="Services" right="In studio" data-reveal />
        <h1
          data-reveal
          className="mt-8 max-w-2xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-normal leading-[1.05] text-ink"
        >
          The treatment menu
        </h1>
        <p
          data-reveal
          className="mt-6 max-w-xl font-body text-base font-normal leading-relaxed text-muted"
        >
          Every visit starts with a barrier read — Emily chooses the right protocol for your skin
          that week rather than running a fixed script. Menu details below are being finalized;
          request an appointment and Emily will confirm timing and price before your visit.
        </p>
        <p
          data-reveal
          className="mt-4 max-w-xl font-body text-sm font-normal leading-relaxed text-muted/90"
        >
          {bookingPolicy.publicNote}
        </p>
      </div>

      <ul
        className="services-menu-list mt-16 overflow-hidden rounded-[3px] border border-border"
        data-reveal-group="svc-list"
      >
        {SERVICES.map((s) => (
          <li key={s.id} data-reveal className="border-b border-border last:border-b-0">
            <div className="grid gap-4 px-4 py-8 sm:gap-6 sm:px-5 sm:py-10 md:grid-cols-[1fr_1.2fr_auto] md:items-start md:px-6">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-normal text-ink sm:text-2xl">
                  {s.name}
                </h2>
                <Rule
                  left={formatDuration(s.duration_minutes)}
                  right={formatServicePrice(s.price)}
                  className="mt-4"
                />
              </div>
              <p className="font-body text-sm font-normal leading-relaxed text-muted">
                {s.description}
              </p>
              <Link
                href={`/book?service=${s.id}`}
                className="btn-ghost h-fit w-full px-6 py-3 text-center font-label text-[0.66rem] font-normal uppercase tracking-lockup sm:w-auto md:justify-self-end"
              >
                Book
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <p
        className="mt-6 max-w-2xl font-body text-xs font-normal leading-relaxed text-muted"
        data-reveal
      >
        Names, durations, and prices above are being finalized. Request an appointment and Emily
        will confirm timing and investment with you directly.
      </p>

      <div
        className="dew-panel mt-16 rounded-[3px] p-8 md:p-10"
        data-reveal
      >
        <h2 className="font-display text-xl font-normal text-ink">Virtual consultation</h2>
        <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
          Prefer to meet online? Book a Zoom consultation with Emily — secure intake, private
          photo upload, and a personalized morning and evening routine after your appointment.
        </p>
        <Link
          href="/virtual-consultation"
          className="btn-dew-outline mt-6 inline-flex min-h-[44px] items-center px-6 py-3 font-label text-[0.66rem] font-normal uppercase tracking-lockup"
        >
          Virtual consultation
        </Link>
      </div>

      <div
        className="mt-8 rounded-[3px] border border-border bg-white p-8 shadow-card md:p-10"
        data-reveal
      >
        <h2 className="font-display text-xl font-normal text-ink">Deposits &amp; cancellations</h2>
        <p className="mt-4 max-w-2xl font-body text-sm font-normal leading-relaxed text-muted">
          Deposit amount and cancellation window are not set yet. The booking flow is built to
          hold a policy without inventing numbers — Emily will publish terms before live deposits
          open.
        </p>
      </div>
    </section>
  );
}
