import SystemStatusBadge from './SystemStatusBadge';

export default function AdminPageHeader({
  title,
  subtitle,
  overallStatus,
  refreshedAt,
  automation
}) {
  return (
    <header className="mb-8 border-b border-sage-deep/15 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-normal text-forest sm:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-2 font-body text-sm font-light text-muted max-w-2xl">{subtitle}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {overallStatus && <SystemStatusBadge status={overallStatus} />}
          {refreshedAt && (
            <span className="font-body text-xs text-muted">
              Updated {new Date(refreshedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
      {automation && (
        <div
          className="mt-4 flex flex-wrap gap-2 rounded-sm border border-sage-deep/20 bg-ivory/80 px-4 py-3 font-label text-[0.62rem] uppercase tracking-lockup text-forest"
          role="status"
        >
          <span>RPA {automation.rpaEnabled ? 'enabled' : 'disabled'}</span>
          <span className="text-muted">·</span>
          <span>Mode {automation.modeLabel}</span>
          <span className="text-muted">·</span>
          <span>Purchasing {automation.purchasingAllowed ? 'allowed' : 'blocked'}</span>
          {automation.killSwitch && (
            <>
              <span className="text-muted">·</span>
              <span className="text-promo">Kill switch on</span>
            </>
          )}
        </div>
      )}
    </header>
  );
}
