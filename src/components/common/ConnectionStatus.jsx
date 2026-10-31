import { useCallback, useEffect, useState } from 'react';
import { systemService } from '../../services/systemService';
import { useSocket } from '../../context/SocketContext';

/**
 * Compact API / database / live-updates indicator built on GET /api/health, GET /api/db-status and the
 * Socket.IO connection state. `detailed` renders one row per check.
 */
const LIVE = {
  connected: ['ok', 'Connected'],
  connecting: ['checking', 'Connecting…'],
  reconnecting: ['checking', 'Reconnecting…'],
  offline: ['down', 'Not connected'],
};

export default function ConnectionStatus({ detailed = false }) {
  const { status: socketStatus } = useSocket();
  const [liveState, liveText] = LIVE[socketStatus] || LIVE.offline;
  const [state, setState] = useState({ api: 'checking', db: 'checking', dbName: null });

  const check = useCallback(async () => {
    setState({ api: 'checking', db: 'checking', dbName: null });
    const [health, db] = await Promise.allSettled([systemService.health(), systemService.dbStatus()]);
    setState({
      api: health.status === 'fulfilled' ? 'ok' : 'down',
      db: db.status === 'fulfilled' ? 'ok' : 'down',
      dbName: db.status === 'fulfilled' ? db.value.database : null,
    });
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const dot = (value) =>
    value === 'ok' ? 'bg-emerald-500' : value === 'down' ? 'bg-red-500' : 'bg-slate-300 animate-pulse';

  if (!detailed) {
    const allOk = state.api === 'ok' && state.db === 'ok';
    const label =
      state.api === 'checking' ? 'Checking…' : !allOk ? 'Service issue' : liveState === 'ok' ? 'All systems normal' : `Live updates: ${liveText.toLowerCase()}`;
    const overall = state.api === 'checking' ? 'checking' : !allOk ? 'down' : liveState;
    return (
      <span className="inline-flex items-center gap-1.5" title={`API: ${state.api} · Database: ${state.db} · Live updates: ${socketStatus}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot(overall)}`} />
        {label}
      </span>
    );
  }

  const rows = [
    ['API server', state.api, state.api === 'ok' ? 'Responding' : state.api === 'down' ? 'Unreachable' : 'Checking…'],
    ['Database', state.db, state.db === 'ok' ? `Connected${state.dbName ? ` (${state.dbName})` : ''}` : state.db === 'down' ? 'Disconnected' : 'Checking…'],
    ['Live updates', liveState, liveText],
  ];

  return (
    <div>
      <ul className="divide-y divide-line">
        {rows.map(([label, value, text]) => (
          <li key={label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-ink-soft">{label}</span>
            <span className="inline-flex items-center gap-2 text-muted">
              <span className={`h-2 w-2 rounded-full ${dot(value)}`} />
              {text}
            </span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={check} className="link mt-2 text-sm">
        Check again
      </button>
    </div>
  );
}
