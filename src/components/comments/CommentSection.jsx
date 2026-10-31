import { MessageCircle } from 'lucide-react';
import { commentService } from '../../services/commentService';
import usePaginatedList from '../../hooks/usePaginatedList';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { ListSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import LoadMore from '../common/LoadMore';

const COMMENTS_PAGE = 20;

// Comments are returned oldest first (conversation order); "load more" fetches later ones
export default function CommentSection({ postId, onCountChange }) {
  const comments = usePaginatedList((page) => commentService.list(postId, { page, limit: COMMENTS_PAGE }), {
    itemsKey: 'comments',
    deps: [postId],
  });
  const total = comments.pagination?.total ?? comments.items.length;

  return (
    <section id="comments" className="card scroll-mt-20 p-4 sm:p-5" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="mb-4 text-[15px] font-semibold text-ink">
        Comments {comments.status === 'ready' && <span className="font-normal text-muted">({total})</span>}
      </h2>

      <CommentForm
        postId={postId}
        onAdded={(comment) => {
          comments.appendItem(comment);
          onCountChange?.(1);
        }}
      />

      <div className="mt-2 border-t border-line">
        {comments.status === 'loading' && <ListSkeleton rows={3} />}
        {comments.status === 'error' && <ErrorState message={comments.error} onRetry={comments.reload} />}
        {comments.status === 'ready' && comments.items.length === 0 && (
          <EmptyState icon={MessageCircle} title="No comments yet" description="Start the conversation." className="py-10" />
        )}
        <ul className="divide-y divide-line">
          {comments.items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdated={(updated) => comments.updateItem(comment.id, updated)}
              onDeleted={() => {
                comments.removeItem(comment.id);
                onCountChange?.(-1);
              }}
            />
          ))}
        </ul>
        <LoadMore hasMore={comments.hasMore} loading={comments.loadingMore} onClick={comments.loadMore} label="Show more comments" />
      </div>
    </section>
  );
}
