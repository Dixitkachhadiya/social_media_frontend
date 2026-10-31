import { useCallback, useRef, useState } from 'react';
import { aiService } from '../services/aiService';
import { parseApiError } from '../utils/apiError';

// Error code returned by the backend when the AI moderation model refuses a post or comment
export const MODERATION_FAILED = 'CONTENT_MODERATION_FAILED';

/** Returns { moderation, message } when an API error is a moderation refusal, otherwise null. */
export const moderationRefusal = (error) => {
  const data = error?.response?.data;
  return data?.code === MODERATION_FAILED && data.moderation ? { moderation: data.moderation, message: data.message } : null;
};

/**
 * State for the content-check notice shown under post/comment editors.
 * - check(content): optional "Check" button, POST /api/ai/moderate-content.
 * - showRefusal(error, content): shows the server's refusal when saving was blocked (422).
 * - blocks(text): true while the editor still holds the refused text (used to disable Publish/Save).
 * The backend checks every save itself; this hook only displays results. It never changes the text.
 */
export default function useContentCheck() {
  const [result, setResult] = useState(null); // { moderation, message }
  const [checkedText, setCheckedText] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const check = useCallback(async (content, kind) => {
    const id = ++requestId.current;
    setChecking(true);
    setError(null);
    try {
      const res = await aiService.moderateContent(content, kind);
      if (id !== requestId.current) return null;
      const { message, ...moderation } = res.data;
      setResult({ moderation, message });
      setCheckedText(content);
      return moderation;
    } catch (err) {
      if (id === requestId.current) setError(parseApiError(err));
      return null;
    } finally {
      if (id === requestId.current) setChecking(false);
    }
  }, []);

  // Returns true when the error was a moderation refusal (and is now displayed)
  const showRefusal = useCallback((err, content) => {
    const refusal = moderationRefusal(err);
    if (!refusal) return false;
    requestId.current += 1;
    setResult(refusal);
    setCheckedText(content);
    setError(null);
    return true;
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    setResult(null);
    setCheckedText(null);
    setError(null);
    setChecking(false);
  }, []);

  // True while `text` is exactly the text the model refused: submitting it again cannot pass
  const blocks = useCallback(
    (text) => Boolean(result?.moderation?.blocked) && (text || '').trim() === (checkedText || '').trim(),
    [result, checkedText],
  );

  return { result, checkedText, checking, error, check, showRefusal, reset, blocks };
}
