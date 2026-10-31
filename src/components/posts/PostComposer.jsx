import { useEffect, useRef, useState } from 'react';
import { Eye, FileText, ImagePlus, PenLine, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { parseApiError } from '../../utils/apiError';
import { LIMITS } from '../../utils/constants';
import { displayName } from '../../utils/format';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import CharCount from '../common/CharCount';
import Alert from '../common/Alert';
import ImageUrlField, { validateImageUrl } from './ImageUrlField';
import { PostContent, PostHeader, PostImage } from './PostParts';
import useContentCheck from '../../hooks/useContentCheck';
import ModerationNotice from '../ai/ModerationNotice';
import SummaryPanel from '../ai/SummaryPanel';

/**
 * POST /posts composer with character count, optional image URL, preview, Summarize (a suggestion the
 * user must accept) and Check content (local moderation model). The backend moderates every post before
 * saving; a refusal is shown here without changing the user's text, and Publish stays disabled until
 * the refused text is edited.
 */
export default function PostComposer({ onCreated, initialContent = '', initialImageUrl = '', expanded: startExpanded = false, autoFocus = false }) {
  const { user, profile } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [showImage, setShowImage] = useState(Boolean(initialImageUrl));
  const [expanded, setExpanded] = useState(startExpanded || Boolean(initialContent));
  const [previewing, setPreviewing] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const check = useContentCheck();
  const textareaRef = useRef(null);

  const trimmed = content.trim();
  const name = displayName({ ...profile, username: user?.username });

  // Grow the textarea with its content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 420)}px`;
  }, [content, expanded, previewing]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const reset = () => {
    setContent('');
    setImageUrl('');
    setShowImage(false);
    setPreviewing(false);
    setErrors({});
    setFormError(null);
    setShowSummary(false);
    check.reset();
    if (!startExpanded) setExpanded(false);
  };

  const validate = () => {
    const next = {
      content: !trimmed ? 'Write something before publishing' : trimmed.length > LIMITS.post ? `Posts can be at most ${LIMITS.post} characters` : null,
      image_url: showImage ? validateImageUrl(imageUrl) : null,
    };
    setErrors(next);
    return !next.content && !next.image_url;
  };

  /**
   * Publishing: the backend checks every post with the local moderation model before saving it.
   * A refusal (422) shows the reason and highlighted words; the text stays in the editor for the
   * user to fix and submit again. Nothing is changed automatically.
   */
  const publish = async (event) => {
    event?.preventDefault();
    setFormError(null);
    if (publishing || !validate()) return;
    setPublishing(true);
    try {
      const res = await postService.create({ content: trimmed, image_url: showImage ? imageUrl.trim() : undefined });
      toast.success('Post published');
      reset();
      onCreated?.(res.post);
    } catch (error) {
      if (check.showRefusal(error, trimmed)) return; // Publish stays disabled until the text is edited
      const parsed = parseApiError(error);
      setErrors(parsed.fieldErrors);
      setFormError(parsed.message);
    } finally {
      setPublishing(false);
    }
  };

  const runCheck = () => {
    if (!trimmed) return setErrors({ content: 'Write something first, then check it' });
    check.check(trimmed);
  };

  const editText = () => {
    setPreviewing(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  if (!expanded) {
    return (
      <div className="card flex items-center gap-3 p-3 sm:p-4">
        <Avatar src={profile?.avatar_url} name={name} />
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex-1 rounded-full border border-line bg-canvas px-4 py-2.5 text-left text-sm text-muted transition-colors hover:border-slate-300 hover:bg-slate-100"
        >
          What's on your mind, {user?.username}?
        </button>
        <Button variant="ghost" size="icon" aria-label="Add an image" onClick={() => { setExpanded(true); setShowImage(true); }}>
          <ImagePlus className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  const previewPost = {
    content: trimmed,
    image_url: showImage && !validateImageUrl(imageUrl) ? imageUrl.trim() : null,
    author: { id: user?.id, username: user?.username, full_name: profile?.full_name, avatar_url: profile?.avatar_url },
  };

  return (
    <form onSubmit={publish} noValidate className="card p-4 sm:p-5">
      {formError && (
        <Alert tone="error" className="mb-4">
          {formError}
        </Alert>
      )}

      {previewing ? (
        <div className="rounded-xl border border-dashed border-line p-4">
          <p className="mb-3 text-xs font-medium tracking-wide text-muted uppercase">Preview</p>
          <PostHeader post={previewPost} currentUserId={user?.id} linkAuthor={false} />
          {trimmed ? <PostContent content={trimmed} /> : <p className="mt-3 text-sm text-muted">Nothing to preview yet.</p>}
          <PostImage src={previewPost.image_url} />
        </div>
      ) : (
        <div className="flex gap-3">
          <Avatar src={profile?.avatar_url} name={name} className="hidden sm:inline-flex" />
          <div className="min-w-0 flex-1">
            <label htmlFor="composer-content" className="sr-only">
              Post content
            </label>
            <textarea
              id="composer-content"
              ref={textareaRef}
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                if (errors.content) setErrors((e) => ({ ...e, content: null }));
              }}
              onKeyDown={(event) => (event.metaKey || event.ctrlKey) && event.key === 'Enter' && publish(event)}
              rows={3}
              placeholder="Share an update, an idea, or a question…"
              className="block w-full resize-none border-0 bg-transparent p-0 py-1.5 text-[15px] leading-relaxed text-ink placeholder:text-slate-400 focus:ring-0 focus:outline-none"
              aria-invalid={errors.content ? true : undefined}
            />
            {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
          </div>
        </div>
      )}

      {showSummary && !previewing && (
        <div className="mt-4 rounded-xl border border-line p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
            <FileText className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" /> Summarize post
          </p>
          <SummaryPanel
            content={trimmed}
            useLabel="Replace my text with this summary"
            onUse={(summary) => {
              setContent(summary);
              setShowSummary(false);
              check.reset();
            }}
          />
        </div>
      )}

      {check.error && (
        <Alert tone="warning" className="mt-4" title="Content check unavailable">
          {check.error.message}
        </Alert>
      )}
      {check.result && (
        <div className="mt-4">
          <ModerationNotice check={check} currentText={content} onEdit={editText} onCheckAgain={() => trimmed && check.check(trimmed)} />
        </div>
      )}

      {showImage && !previewing && (
        <div className="mt-4">
          <ImageUrlField
            value={imageUrl}
            onChange={(value) => {
              setImageUrl(value);
              if (errors.image_url) setErrors((e) => ({ ...e, image_url: null }));
            }}
            error={errors.image_url}
            onRemove={() => {
              setShowImage(false);
              setImageUrl('');
            }}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" onClick={() => setShowImage((v) => !v)} aria-pressed={showImage} aria-label="Attach image URL" title="Attach image URL" disabled={previewing}>
            <ImagePlus className="h-[18px] w-[18px]" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSummary((v) => !v)} aria-pressed={showSummary} disabled={previewing} title="Summarize (key sentences from your text)">
            <FileText className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <span className="hidden sm:inline">Summarize</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={runCheck} loading={check.checking} disabled={previewing} title="Check content for inappropriate language">
            {!check.checking && <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />}
            <span className="hidden sm:inline">Check</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPreviewing((v) => !v)} aria-pressed={previewing}>
            {previewing ? <PenLine className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {previewing ? 'Edit' : 'Preview'}
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <CharCount value={trimmed} max={LIMITS.post} />
          {!startExpanded && (
            <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Discard draft" title="Discard" disabled={publishing}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            loading={publishing}
            disabled={!trimmed || trimmed.length > LIMITS.post || check.blocks(trimmed)}
            title={check.blocks(trimmed) ? 'Remove the highlighted words before publishing' : undefined}
          >
            Publish
          </Button>
        </div>
      </div>
    </form>
  );
}
