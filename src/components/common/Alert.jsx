import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';

const TONES = {
  error: { icon: AlertCircle, cls: 'border-red-200 bg-red-50 text-red-800' },
  success: { icon: CheckCircle2, cls: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  warning: { icon: TriangleAlert, cls: 'border-amber-200 bg-amber-50 text-amber-900' },
  info: { icon: Info, cls: 'border-brand-100 bg-brand-50 text-brand-700' },
};

export default function Alert({ tone = 'info', title, children, className = '' }) {
  const { icon: Icon, cls } = TONES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${cls} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>}
      </div>
    </div>
  );
}
