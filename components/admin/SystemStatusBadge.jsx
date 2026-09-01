import { STATUS_LABEL } from '@/lib/admin/status';

const styles = {
  healthy: 'bg-sage/25 text-forest border-sage-deep/30',
  attention: 'bg-stone/80 text-forest border-sage-deep/20',
  degraded: 'bg-stone text-forest border-promo/30',
  critical: 'bg-promo/15 text-forest border-promo/40',
  disabled: 'bg-stone/50 text-muted border-chrome/30',
  not_configured: 'bg-ivory text-muted border-chrome/25',
  unknown: 'bg-stone/40 text-muted border-chrome/25'
};

export default function SystemStatusBadge({ status, label, className = '' }) {
  const key = String(status || 'unknown').toLowerCase();
  const text = label || STATUS_LABEL[key] || key;
  const style = styles[key] || styles.unknown;
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2.5 py-1 font-label text-[0.58rem] font-light uppercase tracking-lockup ${style} ${className}`}
      role="status"
    >
      {text}
    </span>
  );
}
