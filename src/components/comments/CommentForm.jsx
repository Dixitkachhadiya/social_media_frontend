import { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { commentService } from '../../services/commentService';
import { parseApiError } from '../../utils/apiError';
import { LIMITS } from '../../utils/constants';
import { displayName } from '../../utils/format';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import CharCount from '../common/CharCount';
import ModerationNotice from '../ai/ModerationNotice';
import useContentCheck from '../../hooks/useContentCheck';

export default function CommentForm({ postId, onAdded }) {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const check = useContentCheck();
  const textareaRef = useRef(null);
  const trimmed = content.trim();

  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;
    if (!trimmed) return setError('Write a comment first');
    if (trimmed.length > LIMITS.comment) return setError(`Comments can be at most ${LIMITS.comment} characters`);
    setSending(true);
    setError(null);
    try {
      const res = await commentService.add(postId, trimmed);
      setContent('');
      check.reset();
      onAdded(res.comment);
    } catch (err) {
      // Refused by the moderation model: show why, keep the text for the user to fix
      if (check.showRefusal(err, trimmed)) return;
      const parsed = parseApiError(err);
      setError(parsed.fieldErrors.content || parsed.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex gap-3">
      <Avatar src={profile?.avatar_url} name={displayName({ ...profile, username: user?.username })} size="sm" className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <label htmlFor={`comment-${postId}`} className="sr-only">
          Write a comment
        </label>
        <textarea
          id={`comment-${postId}`}
          ref={textareaRef}
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(event) => (event.metaKey || event.ctrlKey) && event.key === 'Enter' && submit(event)}
          rows={2}
          placeholder="Add a comment…"
          className={`input resize-y ${error ? 'input-error' : ''}`}
          aria-invalid={error ? true : undefined}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-red-600" role={error ? 'alert' : undefined}>
            {error}
          </p>
          <div className="flex items-center gap-3">
            {content && <CharCount value={trimmed} max={LIMITS.comment} />}
            <Button type="submit" size="sm" loading={sending} disabled={!trimmed || check.blocks(trimmed)} title={check.blocks(trimmed) ? 'Remove the highlighted words before publishing' : undefined}>
              Comment
            </Button>
          </div>
        </div>
        {check.result && (
          <div className="mt-2">
            <ModerationNotice
              check={check}
              currentText={content}
              compact
              kind="comment"
              onEdit={() => textareaRef.current?.focus()}
              onApply={setContent}
              onCheckAgain={() => trimmed && check.check(trimmed, 'comment')}
            />
          </div>
        )}
      </div>
    </form>
  );
}
