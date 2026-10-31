import { Sparkles } from 'lucide-react';
import CopyButton from '../common/CopyButton';

// Displays POST /ai/summarize data: { summary, comments_total, comments_included } + meta.ai_generated
export default function SummaryResult({ data, meta }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {meta?.ai_generated ? 'AI summary of the discussion' : 'Discussion summary'}
        </p>
        <CopyButton text={data.summary} />
      </div>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-ink">{data.summary}</p>
      <p className="mt-3 text-xs text-muted">
        {data.comments_total === 0
          ? 'No comments to summarize yet.'
          : `Based on ${data.comments_included} of ${data.comments_total} comment${data.comments_total === 1 ? '' : 's'}.`}
        {meta?.ai_generated && ' AI can make mistakes. Check the original comments for details.'}
      </p>
    </div>
  );
}
