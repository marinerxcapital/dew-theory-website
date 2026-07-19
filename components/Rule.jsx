// The logo's SKIN —— CARE lockup, reused only where two things are genuinely paired.
export default function Rule({ left, right, className = '', ...rest }) {
  return (
    <div
      {...rest}
      className={`flex items-center gap-5 font-label text-[0.68rem] font-light uppercase tracking-lockup text-chrome ${className}`}
    >
      <span>{left}</span>
      <span aria-hidden="true" className="h-px w-10 shrink-0 bg-chrome/50 sm:w-16" />
      <span>{right}</span>
    </div>
  );
}
