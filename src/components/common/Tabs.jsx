// Segmented control used for sort options and page sections
export default function Tabs({ value, onChange, options, className = '', label }) {
  return (
    <div role="tablist" aria-label={label} className={`inline-flex max-w-full overflow-x-auto rounded-lg bg-slate-100 p-0.5 ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
              ${active ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            {option.icon && <option.icon className="h-3.5 w-3.5" aria-hidden="true" />}
            {option.label}
            {option.count != null && (
              <span className={`rounded-full px-1.5 text-xs ${active ? 'bg-brand-50 text-brand-700' : 'bg-slate-200 text-ink-soft'}`}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
