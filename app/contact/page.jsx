import Rule from '@/components/Rule';
import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contact — Dew Theory',
  description: 'Contact Dew Theory studio and Emily Mitchener.'
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <Rule left="Contact" right="Studio" />
          <h1 className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1.05] text-graphite">
            Write us
          </h1>
          <p className="mt-6 max-w-md font-body text-base font-light leading-relaxed text-charcoal/75">
            Questions about products, appointments, or the space — use the form. For urgent
            reschedules, mention your preferred times.
          </p>
          <dl className="mt-12 space-y-6">
            <div>
              <dt className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
                Email
              </dt>
              <dd className="mt-2 font-body text-sm font-light text-charcoal/80">
                {/* Placeholder until domain confirmed */}
                hello@dewtheory.studio
              </dd>
            </div>
            <div>
              <dt className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
                Studio
              </dt>
              <dd className="mt-2 font-body text-sm font-light text-charcoal/80">
                Address pending confirmation — see Studio page and OPEN_ITEMS.md.
              </dd>
            </div>
          </dl>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
