import { APP_NAME } from '../../utils/constants';

export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#4f46e5" />
      <path d="M10 20.5c0-3.6 2.7-6.5 6-6.5s6 2.9 6 6.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="16" cy="10.5" r="2.6" fill="#fff" />
    </svg>
  );
}

export default function Logo({ showName = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      {showName && <span className="text-lg font-semibold tracking-tight text-ink">{APP_NAME}</span>}
    </span>
  );
}
