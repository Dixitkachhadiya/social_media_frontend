import { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import { adminService } from '../../services/adminService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { parseApiError } from '../../utils/apiError';
import { LIMITS } from '../../utils/constants';
import Button from '../../components/common/Button';
import CharCount from '../../components/common/CharCount';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Alert from '../../components/common/Alert';

// POST /admin/announcements { message } -> { recipients }
export default function AdminAnnouncementsPage() {
  useDocumentTitle('Announcements');
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState([]);
  const trimmed = message.trim();
  const invalid = !trimmed || trimmed.length > LIMITS.announcement;

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await adminService.announce(trimmed);
      setSent((items) => [{ message: trimmed, recipients: res.recipients, at: new Date() }, ...items]);
      setMessage('');
      setConfirming(false);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.fieldErrors.message || parsed.message);
      setConfirming(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <form
        className="card space-y-4 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!invalid) setConfirming(true);
        }}
        noValidate
      >
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Megaphone className="h-4 w-4 text-brand-600" aria-hidden="true" /> New announcement
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Sent as a notification to every active user, and shown live as a banner to everyone online.
          </p>
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <div>
          <label htmlFor="announcement" className="sr-only">
            Announcement message
          </label>
          <textarea
            id="announcement"
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="e.g. Scheduled maintenance tonight from 11 PM to 11:30 PM IST."
            className="input resize-y"
          />
          <div className="mt-1.5 flex justify-end">
            <CharCount value={trimmed} max={LIMITS.announcement} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={invalid}>
            <Send className="h-4 w-4" aria-hidden="true" /> Send announcement
          </Button>
        </div>
      </form>

      {sent.length > 0 && (
        <section className="card divide-y divide-line">
          <h3 className="px-5 py-3 text-sm font-semibold text-ink">Sent this session</h3>
          {sent.map((item) => (
            <div key={item.at.toISOString()} className="px-5 py-3">
              <p className="text-sm text-ink">{item.message}</p>
              <p className="mt-1 text-xs text-emerald-700">
                Delivered to {item.recipients.toLocaleString()} active user{item.recipients === 1 ? '' : 's'} · {item.at.toLocaleTimeString()}
              </p>
            </div>
          ))}
        </section>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={send}
        loading={sending}
        tone="primary"
        title="Send to all active users?"
        message={
          <>
            <p>Every active user will get this notification immediately. It can't be recalled.</p>
            <blockquote className="mt-3 rounded-lg border-l-2 border-brand-500 bg-slate-50 p-3 text-ink">{trimmed}</blockquote>
          </>
        }
        confirmLabel="Send now"
      />
    </div>
  );
}
