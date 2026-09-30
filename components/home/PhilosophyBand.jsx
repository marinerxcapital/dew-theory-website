/**
 * Full-width brand philosophy — editorial, quiet.
 */
export default function PhilosophyBand() {
  return (
    <section className="section-sage border-b border-border py-16 sm:py-20" aria-labelledby="philosophy-heading">
      <div className="mx-auto max-w-shell px-5 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center" data-reveal>
          <p className="editorial-label">Dew Theory</p>
          <h2
            id="philosophy-heading"
            className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] text-forest"
          >
            Less guessing. Better skin.
          </h2>
          <p className="editorial-quote mt-8 text-[clamp(1.15rem,2.4vw,1.55rem)]">
            a calm monday
          </p>
          <p className="mx-auto mt-6 max-w-xl font-body text-base leading-relaxed text-forest">
            Professional actives, sequenced with care. Look at the barrier first. Change one
            variable at a time. Keep only what your skin actually needs — relax. i&apos;ve got you
            covered.
          </p>
        </div>
      </div>
    </section>
  );
}
