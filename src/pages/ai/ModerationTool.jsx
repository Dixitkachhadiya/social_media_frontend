import { useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { LIMITS } from '../../utils/constants';
import useContentCheck from '../../hooks/useContentCheck';
import FormField from '../../components/common/FormField';
import CharCount from '../../components/common/CharCount';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import ModerationNotice from '../../components/ai/ModerationNotice';

// Check any text with the AI moderation model (the same check used when posts and comments are saved),
// with a suggested respectful version that can be applied to the text
export default function ModerationTool() {
  const [text, setText] = useState('');
  const check = useContentCheck();
  const textareaRef = useRef(null);
  const trimmed = text.trim();
  const tooLong = trimmed.length > LIMITS.post;

  return (
    <div className="space-y-4">
      <form
        className="card space-y-4 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed && !tooLong) check.check(trimmed);
        }}
        noValidate
      >
        <FormField
          label="Your text"
          hint="English, Hindi, Gujarati, Hinglish and romanized Hindi/Gujarati are supported. Checked by the AI model on our server; it can take a few seconds."
          aside={<CharCount value={trimmed} max={LIMITS.post} />}
        >
          <textarea
            ref={textareaRef}
            rows={6}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste or write the text you want to check…"
            className="input resize-y text-[15px] leading-relaxed"
          />
        </FormField>
        <div className="flex justify-end">
          <Button type="submit" loading={check.checking} disabled={!trimmed || tooLong}>
            {!check.checking && <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
            Check content
          </Button>
        </div>
      </form>

      {check.error && <Alert tone="error">{check.error.message}</Alert>}
      <ModerationNotice
        check={check}
        currentText={text}
        onEdit={() => textareaRef.current?.focus()}
        onApply={setText}
        onCheckAgain={() => trimmed && check.check(trimmed)}
      />
    </div>
  );
}
