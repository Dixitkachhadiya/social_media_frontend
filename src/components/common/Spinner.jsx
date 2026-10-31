export default function Spinner({ className = 'h-5 w-5', label }) {
  return (
    <span role={label ? 'status' : undefined} className="inline-flex items-center">
      <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center text-brand-600">
      <Spinner className="h-7 w-7" label="Loading" />
    </div>
  );
}
