import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { likeService } from '../../services/likeService';
import { useAuth } from '../../context/AuthContext';
import usePaginatedList from '../../hooks/usePaginatedList';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import LoadMore from '../common/LoadMore';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import { ListSkeleton } from '../common/Skeleton';
import { displayName, timeAgo } from '../../utils/format';
import { profilePath } from './PostParts';

// GET /posts/:id/likes (newest first)
export default function LikesModal({ postId, onClose }) {
  const { user } = useAuth();
  const likes = usePaginatedList((page) => likeService.list(postId, { page, limit: 20 }), { itemsKey: 'likes', deps: [postId] });

  return (
    <Modal open onClose={onClose} title="Liked by" description={likes.pagination ? `${likes.pagination.total} people` : undefined}>
      <div className="-mx-5 -my-4">
        {likes.status === 'loading' && <ListSkeleton rows={4} />}
        {likes.status === 'error' && <ErrorState message={likes.error} onRetry={likes.reload} />}
        {likes.status === 'ready' && likes.items.length === 0 && <EmptyState icon={Heart} title="No likes yet" />}
        <ul className="divide-y divide-line">
          {likes.items.map(({ user: liker, liked_at: likedAt }) => (
            <li key={liker.id}>
              <Link to={profilePath(liker.id, user?.id)} onClick={onClose} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                <Avatar src={liker.avatar_url} name={displayName(liker)} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{displayName(liker)}</span>
                  <span className="block truncate text-xs text-muted">@{liker.username}</span>
                </span>
                <span className="text-xs text-muted">{timeAgo(likedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <LoadMore hasMore={likes.hasMore} loading={likes.loadingMore} onClick={likes.loadMore} />
      </div>
    </Modal>
  );
}
