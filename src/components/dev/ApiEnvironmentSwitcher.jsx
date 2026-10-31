import { useEffect, useRef, useState } from 'react';
import { Check, Server } from 'lucide-react';
import toast from 'react-hot-toast';
import { ACTIVE_API_MODE, API_MODES, BASE_URL, consumeSwitchNotice, switchApiMode } from '../../config/apiConfig';

const STYLE = {
  LOCAL: { dot: 'bg-emerald-500', pill: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  LIVE: { dot: 'bg-blue-500', pill: 'border-blue-200 bg-blue-50 text-blue-800' },
};
const HEALTH_LABEL = { checking: 'checking…', online: 'online', offline: 'unreachable' };

/**
 * DEVELOPMENT ONLY (rendered by App.jsx only when import.meta.env.DEV; not part of production builds).
 * Shows which backend is active and switches between LOCAL and LIVE. Switching reloads the app so the
 * Axios instance, Socket.IO connection and the per-backend login token all change together.
 */
export default function ApiEnvironmentSwitcher() {
  const [open, setOpen] = useState(false);
  const [health, setHealth] = useState('checking');
  const rootRef = useRef(null);

  // Confirmation after a switch-triggered reload
  useEffect(() => {
    const switched = consumeSwitchNotice();
    if (switched) toast.success(`Now using the ${switched} API (${API_MODES[switched]})`, { id: 'api-mode' });
  }, []);

  // Is the selected backend reachable? (Render's free tier can take ~1 minute to wake up)
  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(60000) })
      .then((res) => !cancelled && setHealth(res.ok ? 'online' : 'offline'))
      .catch(() => !cancelled && setHealth('offline'));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (health === 'offline') {
      toast.error(`The ${ACTIVE_API_MODE} backend (${BASE_URL}) is not reachable. Start it, or switch environment.`, {
        id: 'api-offline',
        duration: 8000,
      });
    }
  }, [health]);

  // Another tab switched the backend: this tab keeps its environment until reloaded
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'circlo.apiMode' && event.newValue && event.newValue !== ACTIVE_API_MODE) {
        toast(`Another tab switched to the ${event.newValue} API. Reload this tab to use it.`, { id: 'api-mode-other-tab', icon: 'ℹ️' });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const style = STYLE[ACTIVE_API_MODE];

  return (
    <div ref={rootRef} className="fixed bottom-20 left-3 z-[60] md:bottom-3">
      {open && (
        <div role="dialog" aria-label="Backend environment" className="mb-2 w-72 animate-fade-in rounded-xl border border-line bg-white p-3 shadow-pop">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
            <Server className="h-3.5 w-3.5" aria-hidden="true" /> Backend (development only)
          </p>
          <div className="space-y-1.5">
            {Object.entries(API_MODES).map(([mode, url]) => {
              const active = mode === ACTIVE_API_MODE;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchApiMode(mode)}
                  disabled={active}
                  className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors
                    ${active ? `${STYLE[mode].pill} cursor-default` : 'border-line hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STYLE[mode].dot}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{mode} API</span>
                    <span className="block truncate text-xs text-muted">{url}</span>
                  </span>
                  {active && <Check className="mt-1 h-4 w-4 shrink-0" aria-label="Active" />}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">
            Switching reloads the app. Each backend keeps its own login, so you may need to log in again.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={`${BASE_URL} (${HEALTH_LABEL[health]})`}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-shadow hover:shadow-pop ${style.pill}`}
      >
        <span className={`h-2 w-2 rounded-full ${health === 'offline' ? 'bg-red-500' : style.dot} ${health === 'checking' ? 'animate-pulse' : ''}`} />
        {ACTIVE_API_MODE} API
        {health === 'offline' && <span className="font-normal text-red-700">· unreachable</span>}
      </button>
    </div>
  );
}
