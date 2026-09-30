import Link from 'next/link';

/**
 * Shared editorial page frame: a hairline-ruled masthead (eyebrow, didone
 * title, optional intro, optional actions) over a constrained content body.
 *
 * Used by the content/utility routes so they share one rhythm with the
 * storefront instead of each inventing its own spacing.
 */
export default function PageShell({
  eyebrow,
  title,
  intro,
  actions = null,
  children,
  wide = false,
  bare = false
}) {
  return (
    <div className="bg-void">
      <header className="border-b border-border">
        <div className="mx-auto max-w-shell px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
          {eyebrow ? (
            <p className="font-body text-micro font-medium uppercase tracking-eyebrow text-muted">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-4 font-display text-[clamp(2.3rem,5.2vw,4.1rem)] font-normal leading-[0.98] tracking-hero text-ink">
            {title}
          </h1>
          {intro ? (
            <p className="mt-6 max-w-measure font-body text-[1.0625rem] font-normal leading-[1.7] text-muted">
              {intro}
            </p>
          ) : null}
          {actions ? <div className="mt-9 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </header>

      {bare ? (
        children
      ) : (
        <div
          className={`mx-auto px-5 py-section-sm sm:px-6 lg:px-10 lg:py-section-md ${
            wide ? 'max-w-shell' : 'max-w-shell'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Primary filled action, sized for a masthead row. */
export function ShellPrimary({ href, children }) {
  return (
    <Link
      href={href}
      className="btn-primary inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
    >
      {children}
    </Link>
  );
}

/** Outlined secondary action, sized for a masthead row. */
export function ShellSecondary({ href, children }) {
  return (
    <Link
      href={href}
      className="btn-ghost inline-flex min-h-[52px] items-center px-8 py-3.5 font-body text-[0.68rem] font-medium uppercase tracking-lockup"
    >
      {children}
    </Link>
  );
}
