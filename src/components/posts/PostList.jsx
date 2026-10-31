import { Newspaper } from 'lucide-react';
import PostCard from './PostCard';
import { useAuth } from '../../context/AuthContext';
import { useSocketEvent } from '../../context/SocketContext';
import { postService } from '../../services/postService';
import { postActivityPatch } from '../../utils/liveUpdates';
import { PostSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import LoadMore from '../common/LoadMore';

// Renders a usePaginatedList of posts with loading, error, empty and "load more" states.
// Live: like/comment counts update from socket events; deleted posts disappear; edited posts are refetched.
export default function PostList({ list, emptyTitle = 'No posts yet', emptyDescription, emptyAction, emptyIcon = Newspaper }) {
  const { items, status, error, reload, refresh, hasMore, loadingMore, loadMore, updateItem, removeItem } = list;
  const { user } = useAuth();

  useSocketEvent('post:activity', (activity) => {
    if (!items.some((post) => post.id === activity.post_id)) return;
    if (activity.type === 'post-deleted') return removeItem(activity.post_id);
    if (activity.type === 'post-updated') {
      postService.get(activity.post_id).then(({ post }) => updateItem(post.id, post)).catch(() => {});
      return undefined;
    }
    return updateItem(activity.post_id, postActivityPatch(activity, user?.id));
  });
  // Anything missed while the connection was down
  useSocketEvent('reconnected', () => status === 'ready' && refresh());

  if (status === 'loading') {
    return (
      <div className="space-y-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (status === 'error' && !items.length) {
    return (
      <div className="card">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="card">
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onUpdate={(patch) => updateItem(post.id, patch)}
          onDeleted={() => removeItem(post.id)}
        />
      ))}
      <LoadMore hasMore={hasMore} loading={loadingMore} onClick={loadMore} label="Load more posts" />
      {!hasMore && items.length > 3 && <p className="py-4 text-center text-sm text-muted">You're all caught up.</p>}
    </div>
  );
}
