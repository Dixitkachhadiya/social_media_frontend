import { CheckCircle2, PenLine, RefreshCw, ShieldAlert, ShieldQuestion } from 'lucide-react';
import Button from '../common/Button';
import HighlightedText from './HighlightedText';

const SEVERITY_STYLE = {
  low: 'bg-yellow-50 text-yellow-800 ring-yellow-200',
  medium: 'bg-amber-50 text-amber-800 ring-amber-200',
  high: 'bg-red-50 text-red-700 ring-red-200',
};

function Badge({ label, value, className = 'bg-slate-100 text-ink-soft ring-slate-200' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ring-1 ${className}`}>
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

/**
 * Result of the local moderation model for a post or comment: the server's message, the detected
 * category, and the user's text with offending terms highlighted. The text is never changed here;
 * the user edits it and submits again.
 */
export default function ModerationNotice({ check, currentText, onEdit, onCheckAgain, compact = false }) {
  const { result, checkedText, checking } = check;
  if (!result) return null;
  const { moderation, message } = result;
  const stale = currentText !== undefined && currentText.trim() !== (checkedText || '').trim();

  if (!moderation.blocked) {
    return (
      <div className="animate-fade-in flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3" role="status">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <p className="flex-1 text-sm text-emerald-800">
          {message} <span className="text-emerald-700">({moderation.detected_language})</span>
          {stale && <span className="block text-xs text-emerald-700">You've edited the text since this check.</span>}
        </p>
      </div>
    );
  }

  const uncertain = moderation.decision === 'uncertain';
  const Icon = uncertain ? ShieldQuestion : ShieldAlert;

  return (
    <section className="animate-fade-in overflow-hidden rounded-xl border border-red-200 bg-white" role="alert" aria-live="assertive">
      <div className="flex items-start gap-2.5 bg-red-50 px-4 py-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-red-800">{message}</p>
          <p className="mt-0.5 text-xs text-red-700">{moderation.explanation}</p>
        </div>
      </div>

      <div className={`space-y-3 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex flex-wrap gap-1.5">
          <Badge label="Category" value={uncertain ? `Unverified (${moderation.category_label})` : moderation.category_label} />
          {!uncertain && <Badge label="Severity" value={moderation.severity} className={SEVERITY_STYLE[moderation.severity]} />}
          <Badge label="Confidence" value={`${Math.round((moderation.confidence ?? 0) * 100)}%`} />
          <Badge label="Language" value={moderation.detected_language} />
        </div>

        {checkedText && (
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Your text</p>
            <div className="rounded-lg border border-line bg-slate-50 px-3 py-2">
              <HighlightedText text={checkedText} flagged={moderation.flagged_terms} />
            </div>
            {!moderation.flagged_terms?.length && (
              <p className="mt-1 text-xs text-muted">No specific words could be highlighted; please review the whole text.</p>
            )}
          </div>
        )}
        {stale && <p className="text-xs text-amber-700">You've edited the text. Submit again, or check it first.</p>}

        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <PenLine className="h-4 w-4" aria-hidden="true" /> Edit text
            </Button>
          )}
          {onCheckAgain && (
            <Button size="sm" variant="ghost" onClick={onCheckAgain} loading={checking}>
              {!checking && <RefreshCw className="h-4 w-4" aria-hidden="true" />} Check again
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
