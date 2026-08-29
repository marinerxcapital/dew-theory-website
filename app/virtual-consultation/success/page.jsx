import Link from 'next/link';
import {
  getConsultationByStripeSession,
  markConsultationPaidFromSession,
  consultationPublicSummary
} from '@/lib/consultations/service.js';
import { getConsultationConfig, getSiteUrl } from '@/lib/consultations/config.js';
import { mutateStore } from '@/lib/store.js';
import { sendPaymentReceivedEmail } from '@/lib/consultations/emails.js';

export const metadata = {
  title: 'Consultation confirmed',
  robots: { index: false, follow: false }
};

async function resolveConsultation(sessionId) {
  if (!sessionId) return null;

  let consultation = getConsultationByStripeSession(sessionId);
  if (consultation?.payment_status === 'paid') {
    return consultation;
  }

  // Live Stripe: retrieve session and mark paid if webhook lag
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey && !sessionId.startsWith('cs_mock_')) {
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (
        session.payment_status === 'paid' ||
        session.payment_status === 'no_payment_required'
      ) {
        const { consultation: c, alreadyPaid } = markConsultationPaidFromSession(session);
        if (!alreadyPaid && c) {
          let intakeToken = null;
          mutateStore((s) => {
            const idx = s.consultations?.findIndex((x) => x.id === c.id);
            if (idx >= 0 && s.consultations[idx]._intake_token_once) {
              intakeToken = s.consultations[idx]._intake_token_once;
              delete s.consultations[idx]._intake_token_once;
            }
            return s;
          });
          if (intakeToken) {
            await sendPaymentReceivedEmail({ consultation: c, intakeToken });
          }
        }
        return c;
      }
    } catch {
      // fall through
    }
  }

  return consultation;
}

export default async function VirtualConsultationSuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id || '';
  const consultation = await resolveConsultation(sessionId);
  const summary = consultationPublicSummary(consultation);
  const cfg = getConsultationConfig();
  const site = getSiteUrl();

  let scheduleUrl = cfg.schedulingUrl || '';
  if (scheduleUrl && summary) {
    try {
      const u = new URL(scheduleUrl);
      if (summary.client_name) u.searchParams.set('name', summary.client_name);
      if (summary.client_email) u.searchParams.set('email', summary.client_email);
      scheduleUrl = u.toString();
    } catch {
      // keep as-is
    }
  }

  // Intake link only via email for security; success page points to schedule + contact
  return (
    <section className="mx-auto max-w-shell px-6 pb-24 pt-32 sm:pt-36 lg:px-10">
      <p className="eyebrow-line font-label text-[0.68rem] font-light uppercase tracking-[0.28em] text-charcoal/70">
        Confirmed
      </p>
      <h1 className="mt-6 font-display text-[clamp(2rem,4.5vw,3rem)] font-normal text-graphite">
        Payment received
      </h1>
      <p className="mt-5 max-w-xl font-body text-base font-light leading-relaxed text-charcoal/75">
        {summary
          ? `Thank you${summary.client_name ? `, ${summary.client_name.split(' ')[0]}` : ''}. Your virtual consultation is paid${summary.public_ref ? ` (ref ${summary.public_ref})` : ''}.`
          : 'If payment completed, you will receive a confirmation email with your secure intake link shortly. If something looks wrong, contact us with your receipt.'}
      </p>

      <div className="mt-10 max-w-lg space-y-4">
        {scheduleUrl ? (
          <a
            href={scheduleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sweep btn-primary flex min-h-[44px] items-center justify-center px-8 py-4 text-center font-label text-[0.7rem] font-light uppercase tracking-lockup"
          >
            Schedule your Zoom appointment
          </a>
        ) : (
          <div className="glass-1 rounded-[3px] p-6">
            <p className="font-display text-lg font-normal text-graphite">Scheduling</p>
            <p className="mt-2 font-body text-sm font-light text-charcoal/70">
              Emily will confirm your Zoom time via email. Scheduling link configuration is pending
              on the server (
              <code className="text-xs">CONSULTATION_SCHEDULING_URL</code>).
            </p>
          </div>
        )}

        <div className="glass-1 rounded-[3px] p-6">
          <p className="font-display text-lg font-normal text-graphite">Secure intake</p>
          <p className="mt-2 font-body text-sm font-light leading-relaxed text-charcoal/70">
            Check your email for a private intake link. Complete the form and photo upload at least
            24 hours before your appointment. The link is unique to you—do not share it.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/virtual-consultation"
          className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
        >
          ← Back to consultation info
        </Link>
        <Link
          href="mailto:hello@dewtheory.studio"
          className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
        >
          Email
        </Link>
        <Link
          href="/shop"
          className="font-label text-[0.7rem] font-light uppercase tracking-lockup text-charcoal/70 hover:text-charcoal"
        >
          Shop
        </Link>
      </div>
      <p className="mt-10 max-w-md font-body text-xs font-light text-charcoal/55">
        Site: {site.replace(/^https?:\/\//, '')}
      </p>
    </section>
  );
}
