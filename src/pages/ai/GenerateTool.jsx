import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { AI_TONES, LIMITS } from '../../utils/constants';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import CharCount from '../../components/common/CharCount';
import AIErrorNotice from '../../components/ai/AIErrorNotice';
import useAIRequest from './useAIRequest';
import DraftEditor from './DraftEditor';

const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

// POST /api/ai/generate-post { topic, tone }
export default function GenerateTool() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [topicError, setTopicError] = useState(null);
  const [draft, setDraft] = useState(null);
  const { loading, error, run } = useAIRequest();

  const generate = async (event) => {
    event.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) return setTopicError('Enter a topic to write about');
    if (trimmed.length > LIMITS.aiTopic) return setTopicError(`Topic must be at most ${LIMITS.aiTopic} characters`);
    setTopicError(null);
    const res = await run(() => aiService.generatePost({ topic: trimmed, tone }));
    if (res) setDraft(res.data.content);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={generate} noValidate className="card space-y-4 p-5">
        <FormField label="Topic" error={topicError} aside={<CharCount value={topic.trim()} max={LIMITS.aiTopic} />}>
          <input
            value={topic}
            onChange={(event) => {
              setTopic(event.target.value);
              if (topicError) setTopicError(null);
            }}
            placeholder="e.g. Lessons from shipping my first side project"
          />
        </FormField>

        <fieldset>
          <legend className="label">Tone</legend>
          <div className="flex flex-wrap gap-2">
            {AI_TONES.map((value) => (
              <label
                key={value}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500
                  ${tone === value ? 'border-brand-600 bg-brand-50 font-medium text-brand-700' : 'border-line bg-white text-ink-soft hover:border-slate-300'}`}
              >
                <input type="radio" name="tone" value={value} checked={tone === value} onChange={() => setTone(value)} className="sr-only" />
                {capitalize(value)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            {!loading && <Sparkles className="h-4 w-4" aria-hidden="true" />}
            {loading ? 'Writing…' : draft ? 'Generate again' : 'Generate post'}
          </Button>
        </div>
      </form>

      <AIErrorNotice error={error} />

      {draft != null && <DraftEditor label={`Generated draft · ${capitalize(tone)}`} value={draft} onChange={setDraft} />}
    </div>
  );
}
