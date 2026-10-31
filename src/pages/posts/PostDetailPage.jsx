import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileQuestion, Sparkles } from 'lucide-react';
import { postService } from '../../services/postService';
import { aiService } from '../../services/aiService';
import { parseApiError } from '../../utils/apiError';
import { postActivityPatch } from '../../utils/liveUpdates';
import { useAuth } from '../../context/AuthContext';
import { useSocketEvent } from '../../context/SocketContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import FeedLayout from '../../components/layout/FeedLayout';
import PostCard from '../../components/posts/PostCard';
import CommentSection from '../../components/comments/CommentSection';
import { PostSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import AIErrorNotice from '../../components/ai/AIErrorNotice';
import SummaryResult from '../../components/ai/SummaryResult';

function DiscussionSummary({ postId, commentsCount }) {
  const [state, setState] = useState({ status: 'idle' });

  const summarize = async () => {
    setState({ status: 'loading' });
    try {
      const res = await aiService.summarize(postId);
      setState({ status: 'done', data: res.data, meta: res.meta });
    } catch (error) {
      setState({ status: 'error', error: parseApiError(error) });
    }
  };

  if (commentsCount === 0 && state.status === 'idle') return null;

  return (
    <section className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Catch up on the discussion</h2>
          <p className="text-sm text-muted">Get a short AI summary of what people are saying.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={summarize} loading={state.status === 'loading'}>
          {state.status !== 'loading' && <Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" />}
          {state.status === 'done' ? 'Summarize again' : 'Summarize'}
        </Button>
      </div>
      {state.status === 'done' && (
        <div className="mt-4">
          <SummaryResult data={state.data} meta={state.meta} />
        </div>
      )}
      {state.status === 'error' && <AIErrorNotice error={state.error} className="mt-4" />}
    </section>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [state, setState] = useState({ status: 'loading', post: null, error: null });
  useDocumentTitle(state.post ? `${state.post.author.username}: "${state.post.content.slice(0, 40)}"` : 'Post');

  const load = async () => {
    setState({ status: 'loading', post: null, error: null });
    try {
      const { post } = await postService.get(id);
      setState({ status: 'ready', post, error: null });
    } catch (error) {
      const parsed = parseApiError(error);
      setState({ status: parsed.status === 404 || parsed.status === 400 ? 'missing' : 'error', post: null, error: parsed.message });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Jump to comments when arriving from a "comments" link
  useEffect(() => {
    if (state.status === 'ready' && hash === '#comments') {
      document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.status, hash]);

  const updatePost = (patch) =>
    setState((s) => ({ ...s, post: { ...s.post, ...(typeof patch === 'function' ? patch(s.post) : patch) } }));

  // Live: counts, edits and deletion by anyone (or in another tab) show up without a refresh.
  // The server's count is authoritative; a comment this tab added or deleted is counted only once, whether
  // its live event or the HTTP response arrives first.
  const { user } = useAuth();
  const countedComments = useRef(new Set());
  const countOnce = (key) => {
    if (countedComments.current.has(key)) return false;
    countedComments.current.add(key);
    return true;
  };
  const changeCommentCount = (delta, commentId) => {
    if (countOnce(`${delta > 0 ? 'comment-added' : 'comment-deleted'}:${commentId}`)) {
      updatePost((post) => ({ comments_count: Math.max(0, post.comments_count + delta) }));
    }
  };
  useSocketEvent('post:activity', (activity) => {
    if (state.status !== 'ready' || activity.post_id !== state.post.id) return;
    if (activity.comment_id) countOnce(`${activity.type}:${activity.comment_id}`);
    if (activity.type === 'post-deleted') {
      setState({ status: 'missing', post: null, error: null });
    } else if (activity.type === 'post-updated') {
      postService.get(activity.post_id).then(({ post }) => updatePost(post)).catch(() => {});
    } else {
      updatePost(postActivityPatch(activity, user?.id));
    }
  });

  return (
    <FeedLayout>
      <div className="space-y-4">
        <button type="button" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </button>

        {state.status === 'loading' && <PostSkeleton />}
        {state.status === 'missing' && (
          <div className="card">
            <EmptyState
              icon={FileQuestion}
              title="Post not found"
              description="It may have been deleted, or its author's account is no longer active."
              action={
                <Link to="/" className="link text-sm">
                  Back to your feed
                </Link>
              }
            />
          </div>
        )}
        {state.status === 'error' && (
          <div className="card">
            <ErrorState message={state.error} onRetry={load} />
          </div>
        )}

        {state.status === 'ready' && (
          <>
            <PostCard post={state.post} detailed onUpdate={updatePost} onDeleted={() => navigate('/', { replace: true })} />
            <DiscussionSummary postId={state.post.id} commentsCount={state.post.comments_count} />
            <CommentSection
              postId={state.post.id}
              onCountChange={changeCommentCount}
            />
          </>
        )}
      </div>
    </FeedLayout>
  );
}
