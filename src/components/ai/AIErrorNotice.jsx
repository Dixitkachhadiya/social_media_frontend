import { useEffect, useState } from 'react';
import Alert from '../common/Alert';

/**
 * Explains AI failures from the backend:
 * 429 rate limit (with Retry-After), 422 text too short, 503 model unavailable/busy, 504 timeout, 502 empty response.
 */
export default function AIErrorNotice({ error, className = '' }) {
  const [secondsLeft, setSecondsLeft] = useState(error?.retryAfter ?? 0);

  useEffect(() => {
    setSecondsLeft(error?.retryAfter ?? 0);
  }, [error]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  if (!error) return null;

  const { status, message } = error;
  let title = "The AI request didn't go through";
  let tone = 'error';
  let detail = message;

  if (status === 429) {
    title = 'AI limit reached';
    tone = 'warning';
    detail = `${message}${secondsLeft > 0 ? ` You can try again in ${secondsLeft}s.` : ' You can try again now.'}`;
  } else if (status === 422) {
    title = "This text can't be processed";
    tone = 'warning';
  } else if (status === 503) {
    title = 'AI is temporarily unavailable';
  } else if (status === 504) {
    title = 'The AI took too long';
  } else if (status === 502) {
    title = 'No response from the AI';
  }

  return (
    <Alert tone={tone} title={title} className={className}>
      {detail}
    </Alert>
  );
}
