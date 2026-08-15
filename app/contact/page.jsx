import Rule from '@/components/Rule';
import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contact',
  description:
    'Contact Dew Theory about products, appointments, shipping, or the studio. We respond as soon as we can.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact — Dew Theory',
    description: 'Write Dew Theory about products, appointments, or the studio.',
    url: '/contact'
  }
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-shell px-6 pb-24 pt-12 sm:pb-28 sm:pt-14 lg:px-10 lg:pt-16">
      <div className="grid gap-16 lg:grid-cols-2" data-reveal-group="contact">
        <div>
          <Rule left="Contact" right="Studio" data-reveal />
          <h1
            data-reveal
            className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] font-normal leading-[1.05] text-ink"
          >
            Write us
          </h1>
          <p
            data-reveal
            className="mt-6 max-w-md font-body text-base font-normal leading-relaxed text-muted"
          >
            Products, appointments, or the room itself — use the form. For a same-week
            reschedule, include your preferred times so Emily can answer once, clearly.
          </p>
          <dl className="mt-12 space-y-6" data-reveal>
            <div>
              <dt className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted">
                Email
              </dt>
              <dd className="mt-2 font-body text-sm font-normal text-ink/90">
                hello@dewtheory.studio
              </dd>
            </div>
            <div>
              <dt className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted">
                Studio
              </dt>
              <dd className="mt-2 font-body text-sm font-normal text-muted">
                Address pending confirmation — see the Studio page.
              </dd>
            </div>
            <div>
              <dt className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-muted">
                Response time
              </dt>
              <dd className="mt-2 font-body text-sm font-normal text-muted">
                Emily replies to messages in the order they arrive, usually within one to two
                business days.
              </dd>
            </div>
          </dl>
        </div>
        <div data-reveal>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
