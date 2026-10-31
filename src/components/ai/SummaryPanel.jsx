import { useState } from 'react';
import { FileText } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { parseApiError } from '../../utils/apiError';
import Tabs from '../common/Tabs';
import Button from '../common/Button';
import CopyButton from '../common/CopyButton';
import AIErrorNotice from './AIErrorNotice';

const LENGTHS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'detailed', label: 'Detailed' },
];

/**
 * Summarizes the given text (POST /api/ai/summarize { content, length }).
 * The summary is only applied when the user clicks "Use summary".
 */
export default function SummaryPanel({ content, onUse, useLabel = 'Use summary' }) {
  const [length, setLength] = useState('medium');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const text = (content || '').trim();

  const summarize = async () => {
    if (loading || !text) return;
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.summarizeText({ content: text, length });
      setSummary(res.data.summary);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs label="Summary length" value={length} onChange={setLength} options={LENGTHS} />
        <Button size="sm" onClick={summarize} loading={loading} disabled={!text}>
          {!loading && <FileText className="h-4 w-4" aria-hidden="true" />}
          {loading ? 'Summarizing…' : summary ? 'Summarize again' : 'Summarize'}
        </Button>
      </div>
      {!text && <p className="text-xs text-muted">Write or paste some text first.</p>}
      <AIErrorNotice error={error} />
      {summary && !loading && (
        <div className="rounded-lg border border-brand-100 bg-brand-50/50">
          <div className="flex items-center justify-between gap-2 border-b border-brand-100 px-3 py-1.5">
            <span className="text-xs font-medium text-brand-700">
              {LENGTHS.find((l) => l.value === length)?.label} summary · {summary.length} of {text.length} characters
            </span>
            <CopyButton text={summary} />
          </div>
          <p className="px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-ink">{summary}</p>
          {onUse && (
            <div className="border-t border-brand-100 px-3 py-2">
              <Button size="sm" variant="secondary" onClick={() => onUse(summary)}>
                {useLabel}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
