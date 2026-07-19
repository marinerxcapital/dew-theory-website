import Rule from '@/components/Rule';
import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contact',
  description: 'Write Dew Theory — products, appointments, or the studio.'
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-shell px-6 py-32 lg:px-10">
      <div className="grid gap-16 lg:grid-cols-2" data-reveal-group="contact">
        <div>
          <Rule left="Contact" right="Studio" data-reveal />
          <h1
            data-reveal
            className="mt-8 font-display text-[clamp(2.4rem,6vw,4rem)] font-normal leading-[1.05] text-graphite"
          >
            Write us
          </h1>
          <p
            data-reveal
            className="mt-6 max-w-md font-body text-base font-light leading-relaxed text-charcoal/75"
          >
            Products, appointments, or the room itself — use the form. For a same-week reschedule,
            include preferred times so Emily can answer once, clearly.
          </p>
          <dl className="mt-12 space-y-6" data-reveal>
            <div>
              <dt className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
                Email
              </dt>
              <dd className="mt-2 font-body text-sm font-light text-charcoal/80">
                {/* OPEN_ITEMS: domain not confirmed */}
                hello@dewtheory.studio
              </dd>
            </div>
            <div>
              <dt className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome">
                Studio
              </dt>
              <dd className="mt-2 font-body text-sm font-light text-charcoal/80">
                Address pending confirmation — see the Studio page.
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
