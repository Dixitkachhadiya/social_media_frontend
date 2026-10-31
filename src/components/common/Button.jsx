import { forwardRef } from 'react';
import Spinner from './Spinner';

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm disabled:bg-brand-600/60',
  secondary: 'bg-white text-ink border border-line hover:bg-slate-50 hover:border-slate-300 disabled:text-slate-400',
  ghost: 'text-ink-soft hover:bg-slate-100 hover:text-ink disabled:text-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm disabled:bg-red-600/60',
  'danger-ghost': 'text-red-600 hover:bg-red-50 disabled:text-red-300',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
  icon: 'h-9 w-9 justify-center',
  'icon-sm': 'h-8 w-8 justify-center',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className = '', children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors
        disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
});

export default Button;
