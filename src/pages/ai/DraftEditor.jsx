import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { LIMITS } from '../../utils/constants';
import Button from '../../components/common/Button';
import CharCount from '../../components/common/CharCount';
import CopyButton from '../../components/common/CopyButton';

// Editable AI output. "Use in a post" opens the composer pre-filled; it never publishes on its own.
export default function DraftEditor({ label, value, onChange, footerNote }) {
  const navigate = useNavigate();
  const trimmed = value.trim();

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/40">
      <div className="flex items-center justify-between gap-3 border-b border-brand-100 px-4 py-2.5">
        <p className="text-xs font-semibold text-brand-700">{label}</p>
        <CopyButton text={value} />
      </div>
      <label htmlFor="ai-draft" className="sr-only">
        {label}
      </label>
      <textarea
        id="ai-draft"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={8}
        className="block w-full resize-y border-0 bg-transparent px-4 py-3 text-[15px] leading-relaxed text-ink focus:ring-0 focus:outline-none"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-100 px-4 py-2.5">
        <span className="text-xs text-muted">{footerNote || 'You can edit this text.'}</span>
        <div className="flex items-center gap-3">
          <CharCount value={trimmed} max={LIMITS.post} />
          <Button size="sm" onClick={() => navigate('/create', { state: { draft: trimmed } })} disabled={!trimmed || trimmed.length > LIMITS.post}>
            <Send className="h-3.5 w-3.5" aria-hidden="true" /> Use in a post
          </Button>
        </div>
      </div>
    </div>
  );
}
