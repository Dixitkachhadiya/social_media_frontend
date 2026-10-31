export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center px-6 py-14 text-center ${className}`}>
      {Icon && (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-muted">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
