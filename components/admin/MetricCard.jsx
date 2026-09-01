import Link from 'next/link';

export default function MetricCard({ label, value, sub, href, className = '' }) {
  const inner = (
    <div className={`glass-1 p-5 ${href ? 'transition hover:border-sage-deep/40' : ''} ${className}`}>
      <p className="font-label text-[0.62rem] font-light uppercase tracking-lockup text-sage-deep">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-normal text-forest">{value}</p>
      {sub && (
        <p className="mt-1 font-body text-xs font-light text-muted">{sub}</p>
      )}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block min-w-0">
        {inner}
      </Link>
    );
  }
  return inner;
}
