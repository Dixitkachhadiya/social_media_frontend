import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Pencil, ShieldX, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { commentService } from '../../services/commentService';
import { errorMessage, parseApiError } from '../../utils/apiError';
import { LIMITS } from '../../utils/constants';
import { displayName, formatDateTime, timeAgo } from '../../utils/format';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import CharCount from '../common/CharCount';
import Dropdown from '../common/Dropdown';
import ConfirmDialog from '../common/ConfirmDialog';
import { profilePath } from '../posts/PostParts';
import ModerationNotice from '../ai/ModerationNotice';
import useContentCheck from '../../hooks/useContentCheck';

// Authors can edit and delete their comments; admins can remove any comment (moderation)
export default function CommentItem({ comment, onUpdated, onDeleted }) {
  const { user, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const check = useContentCheck();

  const isAuthor = user?.id === comment.author.id;
  const edited = new Date(comment.updated_at) - new Date(comment.created_at) > 1000;
  const name = displayName(comment.author);
  const link = profilePath(comment.author.id, user?.id);

  const save = async (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return setEditError('Comment cannot be empty');
    if (trimmed.length > LIMITS.comment) return setEditError(`Comments can be at most ${LIMITS.comment} characters`);
    if (trimmed === comment.content) return setEditing(false);
    setSaving(true);
    setEditError(null);
    try {
      const res = await commentService.update(comment.id, trimmed);
      onUpdated(res.comment);
      setEditing(false);
      check.reset();
      toast.success(res.message);
    } catch (error) {
      // Refused by the moderation model: keep the draft and show why
      if (check.showRefusal(error, trimmed)) return;
      const parsed = parseApiError(error);
      setEditError(parsed.fieldErrors.content || parsed.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const res = await commentService.remove(comment.id);
      toast.success(res.message);
      setConfirming(false);
      onDeleted();
    } catch (error) {
      toast.error(errorMessage(error));
      setDeleting(false);
    }
  };

  return (
    <li className="flex gap-3 py-4">
      <Link to={link} className="shrink-0" tabIndex={-1} aria-hidden="true">
        <Avatar src={comment.author.avatar_url} name={name} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-sm">
            <Link to={link} className="font-semibold text-ink hover:underline">
              {name}
            </Link>{' '}
            <span className="text-muted">
              @{comment.author.username} ·{' '}
              <time dateTime={comment.created_at} title={formatDateTime(comment.created_at)}>
                {timeAgo(comment.created_at)}
              </time>
              {edited && ' · Edited'}
            </span>
          </p>
          {(isAuthor || isAdmin) && !editing && (
            <Dropdown
              trigger={(props) => (
                <button type="button" {...props} className="-mt-1 rounded-md p-1 text-muted hover:bg-slate-100 hover:text-ink" aria-label="Comment options">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              )}
              items={[
                { label: 'Edit comment', icon: Pencil, onClick: () => { setDraft(comment.content); setEditing(true); }, hidden: !isAuthor },
                { label: 'Delete comment', icon: Trash2, onClick: () => setConfirming(true), danger: true, hidden: !isAuthor },
                { label: 'Remove (moderator)', icon: ShieldX, onClick: () => setConfirming(true), danger: true, hidden: isAuthor || !isAdmin },
              ]}
            />
          )}
        </div>

        {editing ? (
          <form onSubmit={save} className="mt-2" noValidate>
            <label htmlFor={`edit-comment-${comment.id}`} className="sr-only">
              Edit comment
            </label>
            <textarea
              id={`edit-comment-${comment.id}`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
              autoFocus
              className={`input resize-y ${editError ? 'input-error' : ''}`}
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-red-600">{editError}</p>
              <div className="flex items-center gap-2">
                <CharCount value={draft.trim()} max={LIMITS.comment} />
                <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditError(null); check.reset(); }} disabled={saving}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" loading={saving} disabled={check.blocks(draft)} title={check.blocks(draft) ? 'Remove the highlighted words before publishing' : undefined}>
                  Save
                </Button>
              </div>
            </div>
            {check.result && (
              <div className="mt-2">
                <ModerationNotice check={check} currentText={draft} compact kind="comment" onApply={setDraft} onCheckAgain={() => draft.trim() && check.check(draft.trim(), 'comment')} />
              </div>
            )}
          </form>
        ) : (
          <p className="mt-0.5 text-sm leading-relaxed break-words whitespace-pre-wrap text-ink">{comment.content}</p>
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={remove}
        loading={deleting}
        title={isAuthor ? 'Delete comment?' : 'Remove comment?'}
        message={isAuthor ? 'This comment will be permanently deleted.' : `You're removing a comment by @${comment.author.username} as a moderator.`}
        confirmLabel={isAuthor ? 'Delete' : 'Remove'}
      />
    </li>
  );
}
