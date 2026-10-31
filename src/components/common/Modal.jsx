import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const WIDTHS = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const onKey = (event) => event.key === 'Escape' && onCloseRef.current?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Focus the first field, or the panel itself
    const focusTarget = panelRef.current?.querySelector('input, textarea, select, [data-autofocus]') || panelRef.current;
    focusTarget?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40" onClick={() => onClose?.()} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[90vh] w-full ${WIDTHS[size]} animate-slide-up flex-col rounded-t-2xl bg-white shadow-pop
          outline-none sm:rounded-2xl`}
      >
        {title && (
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <h2 id={titleId} className="text-base font-semibold text-ink">
                {title}
              </h2>
              {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="-mr-1.5 rounded-md p-1.5 text-muted hover:bg-slate-100 hover:text-ink"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
