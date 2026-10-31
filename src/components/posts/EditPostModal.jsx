import { useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { postService } from '../../services/postService';
import { parseApiError } from '../../utils/apiError';
import { LIMITS } from '../../utils/constants';
import useContentCheck from '../../hooks/useContentCheck';
import Modal from '../common/Modal';
import Button from '../common/Button';
import CharCount from '../common/CharCount';
import Alert from '../common/Alert';
import ModerationNotice from '../ai/ModerationNotice';
import ImageUrlField, { validateImageUrl } from './ImageUrlField';

/**
 * PUT /posts/:id with only the changed fields; an empty image URL sends null (removes the image).
 * Edited content goes through the same server-side moderation as new posts: a refusal (422) is shown
 * here with highlighted words, and the user edits the text and saves again.
 */
export default function EditPostModal({ post, onClose, onSaved }) {
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.image_url || '');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const check = useContentCheck();
  const textareaRef = useRef(null);

  const trimmed = content.trim();
  const changes = {};
  if (trimmed !== post.content) changes.content = trimmed;
  if ((imageUrl.trim() || null) !== (post.image_url || null)) changes.image_url = imageUrl.trim() || null;
  const hasChanges = Object.keys(changes).length > 0;

  const save = async (event) => {
    event?.preventDefault();
    const nextErrors = {
      content: !trimmed ? 'Post content cannot be empty' : trimmed.length > LIMITS.post ? `Posts can be at most ${LIMITS.post} characters` : null,
      image_url: validateImageUrl(imageUrl),
    };
    setErrors(nextErrors);
    setFormError(null);
    if (nextErrors.content || nextErrors.image_url || !hasChanges || saving) return;

    setSaving(true);
    try {
      const res = await postService.update(post.id, changes);
      onSaved(res.post);
      toast.success(res.message);
      onClose();
    } catch (error) {
      if (!check.showRefusal(error, trimmed)) {
        const parsed = parseApiError(error);
        setErrors(parsed.fieldErrors);
        setFormError(parsed.message);
      }
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={saving ? undefined : onClose}
      title="Edit post"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => trimmed && check.check(trimmed)} loading={check.checking} disabled={!trimmed} className="mr-auto">
            {!check.checking && <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />} Check content
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="edit-post-form" loading={saving} disabled={!hasChanges || check.blocks(trimmed)} title={check.blocks(trimmed) ? 'Remove the highlighted words before publishing' : undefined}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="edit-post-form" onSubmit={save} noValidate className="space-y-4">
        {formError && <Alert tone="error">{formError}</Alert>}
        <div>
          <label htmlFor="edit-post-content" className="sr-only">
            Post content
          </label>
          <textarea
            id="edit-post-content"
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            className={`input resize-y text-[15px] leading-relaxed ${errors.content ? 'input-error' : ''}`}
          />
          <div className="mt-1.5 flex justify-between">
            <p className="text-xs text-red-600">{errors.content}</p>
            <CharCount value={trimmed} max={LIMITS.post} />
          </div>
        </div>

        {check.error && <Alert tone="warning">{check.error.message}</Alert>}
        {check.result && (
          <ModerationNotice
            check={check}
            currentText={content}
            compact
            onEdit={() => textareaRef.current?.focus()}
            onApply={setContent}
            onCheckAgain={() => trimmed && check.check(trimmed)}
          />
        )}

        <ImageUrlField
          value={imageUrl}
          onChange={setImageUrl}
          error={errors.image_url}
          onRemove={imageUrl ? () => setImageUrl('') : undefined}
        />
      </form>
    </Modal>
  );
}
