import { useEffect, useRef, useState } from 'react';

/**
 * Small accessible menu. `trigger` receives the button props;
 * `items` are { label, icon, onClick, danger, hidden } or { divider: true }.
 */
export default function Dropdown({ trigger, items, align = 'right', header }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const visible = items.filter((item) => !item.hidden);

  return (
    <div ref={rootRef} className="relative">
      {trigger({ onClick: () => setOpen((v) => !v), 'aria-expanded': open, 'aria-haspopup': 'menu' })}
      {open && (
        <div
          role="menu"
          className={`absolute z-40 mt-1.5 min-w-48 animate-fade-in rounded-xl border border-line bg-white py-1.5 shadow-pop
            ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {header && <div className="mb-1.5 border-b border-line px-3.5 pt-1.5 pb-2.5">{header}</div>}
          {visible.map((item, index) =>
            item.divider ? (
              <div key={`divider-${index}`} className="my-1.5 border-t border-line" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors
                  ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-ink-soft hover:bg-slate-50 hover:text-ink'}`}
              >
                {item.icon && <item.icon className="h-4 w-4" aria-hidden="true" />}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
