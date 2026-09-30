/**
 * Key actives list — renders only catalog-provided name/function pairs.
 * Does not invent ingredients or claims.
 */
export default function KeyActives({
  actives = [],
  className = '',
  heading = 'Key actives',
  compact = false
}) {
  const list = Array.isArray(actives) ? actives.filter((a) => a?.name) : [];
  if (!list.length) return null;

  return (
    <div className={className}>
      {heading ? (
        <p className="font-label text-[0.58rem] font-normal uppercase tracking-lockup text-muted">
          {heading}
        </p>
      ) : null}
      <ul className={compact ? 'mt-3 space-y-2' : 'mt-3 space-y-3'}>
        {list.map((a) => (
          <li key={a.name}>
            <p className="font-body text-sm text-ink">{a.name}</p>
            {a.function ? (
              <p className="mt-1 font-body text-sm leading-relaxed text-muted">{a.function}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
