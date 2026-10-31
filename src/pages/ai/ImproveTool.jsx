import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { AI_TONES, LIMITS } from '../../utils/constants';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import CharCount from '../../components/common/CharCount';
import AIErrorNotice from '../../components/ai/AIErrorNotice';
import useAIRequest from './useAIRequest';
import DraftEditor from './DraftEditor';

const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

// POST /api/ai/improve-post { content, tone? } -> { original, improved }. The original is never changed;
// the improved version is shown for review and is moderated when published.
export default function ImproveTool() {
  const [content, setContent] = useState('');
  const [tone, setTone] = useState('');
  const [inputError, setInputError] = useState(null);
  const [result, setResult] = useState(null);
  const { loading, error, run } = useAIRequest();

  const improve = async (event) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return setInputError('Paste or write the text you want to improve');
    if (trimmed.length > LIMITS.aiImprove) return setInputError(`Text must be at most ${LIMITS.aiImprove.toLocaleString()} characters`);
    setInputError(null);
    const res = await run(() => aiService.improvePost(trimmed, tone || undefined));
    if (res) setResult({ original: res.data.original, improved: res.data.improved });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={improve} noValidate className="card space-y-4 p-5">
        <FormField label="Your text" error={inputError} aside={<CharCount value={content.trim()} max={LIMITS.aiImprove} />}>
          <textarea
            rows={6}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              if (inputError) setInputError(null);
            }}
            placeholder="i am learning node js and it is very good"
            className="input resize-y text-[15px] leading-relaxed"
          />
        </FormField>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="text-sm text-ink-soft">
            <span className="label">Tone</span>
            <select value={tone} onChange={(event) => setTone(event.target.value)} className="input w-auto py-1.5">
              <option value="">Keep my tone</option>
              {AI_TONES.map((value) => (
                <option key={value} value={value}>
                  {capitalize(value)}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" loading={loading}>
            {!loading && <Wand2 className="h-4 w-4" aria-hidden="true" />}
            {loading ? 'Improving…' : 'Improve text'}
          </Button>
        </div>
      </form>

      <AIErrorNotice error={error} />

      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-white">
            <p className="border-b border-line px-4 py-2.5 text-xs font-semibold text-muted">Original</p>
            <p className="px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-ink-soft">{result.original}</p>
          </div>
          <DraftEditor
            label="Improved"
            value={result.improved}
            onChange={(improved) => setResult((r) => ({ ...r, improved }))}
            footerNote="Edit before using."
          />
        </div>
      )}
    </div>
  );
}
