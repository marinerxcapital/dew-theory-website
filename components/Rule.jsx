// The logo's SKIN —— CARE lockup, reused only where two things are genuinely paired.
export default function Rule({ left, right, className = '', ...rest }) {
  return (
    <div
      {...rest}
      className={`flex max-w-full flex-wrap items-center gap-3 font-label text-[0.62rem] font-light uppercase tracking-lockup text-chrome sm:gap-5 sm:text-[0.68rem] ${className}`}
    >
      <span className="min-w-0 break-words">{left}</span>
      <span
        aria-hidden="true"
        className="h-px w-8 shrink-0 bg-current opacity-45 sm:w-16"
      />
      <span className="min-w-0 break-words">{right}</span>
    </div>
  );
}
