import Link from 'next/link';

const STEPS = [
  {
    title: 'Choose a time',
    body: 'Pick an available slot in the booking flow. You will see the duration and price before committing.'
  },
  {
    title: 'Secure intake & photos',
    body: 'Complete a private intake form and upload clear, unfiltered photos so Emily can review your skin in advance.'
  },
  {
    title: 'Meet virtually',
    body: 'Join your Zoom session with Emily to talk through your skin, current products, and goals.'
  },
  {
    title: 'Receive your routine',
    body: 'Get a personalized morning and evening plan with Skin Script recommendations and purchase links.'
  }
];

/**
 * Short 4-step explanation of how a virtual consultation works.
 */
export default function HowConsultationWorks() {
  return (
    <section className="border-b border-border bg-ivory" aria-labelledby="how-consultation-works">
      <div className="mx-auto max-w-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
          <div className="max-w-2xl">
            <p className="editorial-label">how a virtual consultation works</p>
            <h2
              id="how-consultation-works"
              className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-normal text-forest"
            >
              Four steps, start to routine.
            </h2>
          </div>
          <Link
            href="/virtual-consultation"
            className="font-label text-[0.65rem] font-normal uppercase tracking-lockup text-forest underline-offset-4 hover:underline"
          >
            Book a consultation
          </Link>
        </div>

        <ol className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="bg-ivory p-6 sm:p-7" data-reveal>
              <p className="font-label text-[0.62rem] font-normal uppercase tracking-lockup text-dew">
                Step {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 font-display text-xl font-normal text-ink">{step.title}</h3>
              <p className="mt-3 font-body text-sm font-normal leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
