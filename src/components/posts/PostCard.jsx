import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Link2, MessageCircle, MoreHorizontal, Pencil, ShieldX, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { likeService } from '../../services/likeService';
import { postService } from '../../services/postService';
import { errorMessage, parseApiError } from '../../utils/apiError';
import { formatCount } from '../../utils/format';
import Dropdown from '../common/Dropdown';
import ConfirmDialog from '../common/ConfirmDialog';
import EditPostModal from './EditPostModal';
import LikesModal from './LikesModal';
import { PostContent, PostHeader, PostImage } from './PostParts';

export const postUrl = (id) => `${window.location.origin}/posts/${id}`;

export const copyPostLink = async (id) => {
  try {
    await navigator.clipboard.writeText(postUrl(id));
    toast.success('Link copied to clipboard');
  } catch {
    toast.error("Couldn't copy the link");
  }
};

/**
 * One post with like/unlike, likes list, comments link, copy link, and
 * owner edit/delete or admin removal. `onUpdate(patch)` and `onDeleted()` keep the parent list in sync.
 */
export default function PostCard({ post, onUpdate, onDeleted, detailed = false }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [likePending, setLikePending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showLikes, setShowLikes] = useState(false);

  const isOwner = user?.id === post.author.id;
  const canRemove = isOwner || isAdmin;

  const toggleLike = async () => {
    if (likePending) return;
    const { liked_by_me: wasLiked, likes_count: count } = post;
    setLikePending(true);
    onUpdate({ liked_by_me: !wasLiked, likes_count: Math.max(0, count + (wasLiked ? -1 : 1)) });
    try {
      const res = wasLiked ? await likeService.unlike(post.id) : await likeService.like(post.id);
      onUpdate({ liked_by_me: res.liked, likes_count: res.likes_count });
    } catch (error) {
      const { status, message } = parseApiError(error);
      if (status === 409) {
        // Already liked elsewhere (another tab): the original count already included this like
        onUpdate({ liked_by_me: true, likes_count: count });
      } else if (status === 404 && /not liked/i.test(message)) {
        onUpdate({ liked_by_me: false, likes_count: count });
      } else {
        onUpdate({ liked_by_me: wasLiked, likes_count: count });
        toast.error(message);
      }
    } finally {
      setLikePending(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const res = await postService.remove(post.id);
      toast.success(res.message);
      setConfirmingDelete(false);
      onDeleted?.();
    } catch (error) {
      toast.error(errorMessage(error));
      setDeleting(false);
    }
  };

  const menu = (
    <Dropdown
      trigger={(props) => (
        <button
          type="button"
          {...props}
          className="-mt-1 -mr-1.5 rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-100 hover:text-ink"
          aria-label="Post options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      )}
      items={[
        { label: 'Copy link', icon: Link2, onClick: () => copyPostLink(post.id) },
        { label: 'Summarize discussion', icon: Sparkles, onClick: () => navigate(`/ai?tab=summarize&post=${post.id}`) },
        { divider: true, hidden: !canRemove },
        { label: 'Edit post', icon: Pencil, onClick: () => setEditing(true), hidden: !isOwner },
        { label: 'Delete post', icon: Trash2, onClick: () => setConfirmingDelete(true), danger: true, hidden: !isOwner },
        { label: 'Remove post (moderator)', icon: ShieldX, onClick: () => setConfirmingDelete(true), danger: true, hidden: isOwner || !isAdmin },
      ]}
    />
  );

  const actionBtn = 'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors';

  return (
    <article className="card animate-fade-in p-4 sm:p-5">
      <PostHeader post={post} currentUserId={user?.id} actions={menu} />

      {detailed ? (
        <PostContent content={post.content} />
      ) : (
        <Link to={`/posts/${post.id}`} className="block rounded-md focus-visible:outline-offset-4" aria-label="Open post">
          <PostContent content={post.content} clamp />
        </Link>
      )}
      <PostImage src={post.image_url} />

      <div className="-mx-2.5 mt-3 flex items-center gap-1 text-muted">
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleLike}
            disabled={likePending}
            aria-pressed={post.liked_by_me}
            aria-label={post.liked_by_me ? 'Unlike' : 'Like'}
            className={`${actionBtn} ${post.liked_by_me ? 'text-rose-600 hover:bg-rose-50' : 'hover:bg-rose-50 hover:text-rose-600'}`}
          >
            <Heart className={`h-[18px] w-[18px] transition-transform ${post.liked_by_me ? 'scale-110 fill-current' : ''}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setShowLikes(true)}
            disabled={!post.likes_count}
            className="-ml-1.5 rounded px-1 text-sm tabular-nums hover:text-ink hover:underline disabled:no-underline disabled:hover:text-muted"
            aria-label={`${post.likes_count} likes. Show who liked this post`}
          >
            {formatCount(post.likes_count)}
          </button>
        </div>

        <Link to={`/posts/${post.id}#comments`} className={`${actionBtn} hover:bg-sky-50 hover:text-sky-600`} aria-label={`${post.comments_count} comments`}>
          <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className="tabular-nums">{formatCount(post.comments_count)}</span>
        </Link>

        <button type="button" onClick={() => copyPostLink(post.id)} className={`${actionBtn} ml-auto hover:bg-slate-100 hover:text-ink`}>
          <Link2 className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className="hidden sm:inline">Copy link</span>
        </button>
      </div>

      {editing && <EditPostModal post={post} onClose={() => setEditing(false)} onSaved={(updated) => onUpdate(updated)} />}
      {showLikes && <LikesModal postId={post.id} onClose={() => setShowLikes(false)} />}
      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={remove}
        loading={deleting}
        title={isOwner ? 'Delete this post?' : 'Remove this post?'}
        message={
          isOwner
            ? 'The post, its likes and comments will be permanently deleted.'
            : `You're removing a post by @${post.author.username} as a moderator. Its likes and comments will be deleted too.`
        }
        confirmLabel={isOwner ? 'Delete' : 'Remove'}
      />
    </article>
  );
}
