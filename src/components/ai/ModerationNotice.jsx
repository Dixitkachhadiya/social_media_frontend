import { useEffect, useState } from 'react';
import { CheckCircle2, PenLine, RefreshCw, ShieldAlert, Sparkles, Wand2 } from 'lucide-react';
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
 * Result of the AI moderation check for a post or comment:
 * - the server's message and a short reason
 * - the user's original text with the words to review highlighted, and those words as a list
 * - the AI's suggested respectful version, which the user can edit and then apply to the editor
 *
 * Nothing is replaced or published automatically: "Apply suggestion" puts the (edited) suggestion in the
 * editor, and the server checks it again when the user publishes or rechecks.
 *
 * Props: check (useContentCheck), currentText (editor text), onApply(text), onEdit(), onCheckAgain()
 */
export default function ModerationNotice({ check, currentText, onApply, onEdit, onCheckAgain, compact = false }) {
  const { result, checkedText, checking } = check;
  const suggestion = result?.moderation?.suggested_text || '';
  const [draft, setDraft] = useState(suggestion);
  const [editingSuggestion, setEditingSuggestion] = useState(false);

  // A new result brings a new suggestion
  useEffect(() => {
    setDraft(suggestion);
    setEditingSuggestion(false);
  }, [suggestion, result]);

  if (!result) return null;
  const { moderation, message } = result;
  const stale = currentText !== undefined && currentText.trim() !== (checkedText || '').trim();

  if (!moderation.blocked) {
    return (
      <div className="animate-fade-in flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3" role="status">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <p className="flex-1 text-sm text-emerald-800">
          {message} {moderation.detected_language && <span className="text-emerald-700">({moderation.detected_language})</span>}
          {stale && <span className="block text-xs text-emerald-700">You've edited the text since this check.</span>}
        </p>
      </div>
    );
  }

  const words = moderation.flagged_words?.length ? moderation.flagged_words : [...new Set((moderation.flagged_terms || []).map((f) => f.text))];
  const applied = Boolean(draft.trim()) && currentText?.trim() === draft.trim();

  return (
    <section className="animate-fade-in overflow-hidden rounded-xl border border-red-200 bg-white" role="alert" aria-live="assertive">
      <div className="flex items-start gap-2.5 bg-red-50 px-4 py-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-red-800">{message}</p>
          <p className="mt-0.5 text-xs text-red-700">
            <span className="font-medium">Detected issue: {moderation.category_label}.</span> {moderation.explanation}
          </p>
        </div>
      </div>

      <div className={`space-y-3 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex flex-wrap gap-1.5">
          <Badge label="Category" value={moderation.category_label} />
          <Badge label="Severity" value={moderation.severity} className={SEVERITY_STYLE[moderation.severity]} />
          {moderation.detected_language && <Badge label="Language" value={moderation.detected_language} />}
        </div>

        {checkedText && (
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Your original text</p>
            <div className="rounded-lg border border-line bg-slate-50 px-3 py-2">
              <HighlightedText text={checkedText} flagged={moderation.flagged_terms} />
            </div>
          </div>
        )}

        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Words or phrases to review</p>
          {words.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {words.map((word) => (
                <li key={word} className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                  {word}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted">No specific words could be highlighted; please review the whole text.</p>
          )}
        </div>

        {suggestion ? (
          <div className="rounded-lg border border-brand-100 bg-brand-50/50 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> AI-suggested version
              </p>
              {!editingSuggestion && (
                <button type="button" className="link text-xs" onClick={() => setEditingSuggestion(true)}>
                  Edit suggestion
                </button>
              )}
            </div>
            {editingSuggestion ? (
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                className="input resize-y text-sm"
                aria-label="Edit the suggested version"
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">{draft}</p>
            )}
            {onApply && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={() => onApply(draft.trim())} disabled={!draft.trim() || applied}>
                  <Wand2 className="h-4 w-4" aria-hidden="true" /> {applied ? 'Applied' : 'Apply suggestion'}
                </Button>
                <span className="text-xs text-muted">Replaces the text in your editor. It is checked again before publishing.</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted">No suggestion is available for this text. Please edit it yourself.</p>
        )}

        {stale && (
          <p className="text-xs text-amber-700">
            Your text has changed since this check. Recheck it, or publish: it is checked again either way.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <PenLine className="h-4 w-4" aria-hidden="true" /> Edit my text
            </Button>
          )}
          {onCheckAgain && (
            <Button size="sm" variant="ghost" onClick={onCheckAgain} loading={checking}>
              {!checking && <RefreshCw className="h-4 w-4" aria-hidden="true" />} Recheck content
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
