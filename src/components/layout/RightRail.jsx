import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, TrendingUp } from 'lucide-react';
import { postService } from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { Skeleton } from '../common/Skeleton';
import ConnectionStatus from '../common/ConnectionStatus';
import { APP_NAME } from '../../utils/constants';
import { displayName, formatCount } from '../../utils/format';

// Shared across mounts so navigating between feed pages doesn't refetch every time.
// Responses are personalised (liked_by_me), so the cache belongs to one user only.
let popularCache = { at: 0, posts: null, userId: null };
const CACHE_MS = 60_000;

function PopularPosts() {
  const { user } = useAuth();
  const cached = popularCache.userId === user?.id ? popularCache.posts : null;
  const [posts, setPosts] = useState(cached);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (cached && Date.now() - popularCache.at < CACHE_MS) return undefined;
    let cancelled = false;
    const userId = user?.id;
    postService
      .list({ sort: 'popular', limit: 5 })
      .then((data) => {
        popularCache = { at: Date.now(), posts: data.posts, userId };
        if (!cancelled) setPosts(data.posts);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <section className="card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <TrendingUp className="h-4 w-4 text-brand-600" aria-hidden="true" />
        Popular posts
      </h2>
      {failed && <p className="text-sm text-muted">Couldn't load popular posts.</p>}
      {!posts && !failed && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3.5 w-full" />
            </div>
          ))}
        </div>
      )}
      {posts?.length === 0 && <p className="text-sm text-muted">No posts yet.</p>}
      <ul className="-mx-2 space-y-0.5">
        {posts?.map((post) => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`} className="block rounded-lg px-2 py-2 transition-colors hover:bg-slate-50">
              <span className="flex items-center gap-2">
                <Avatar src={post.author.avatar_url} name={displayName(post.author)} size="xs" />
                <span className="truncate text-xs font-medium text-ink-soft">{displayName(post.author)}</span>
              </span>
              <span className="mt-1 line-clamp-2 text-sm text-ink">{post.content}</span>
              <span className="mt-1 flex gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3 w-3" aria-hidden="true" /> {formatCount(post.likes_count)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" aria-hidden="true" /> {formatCount(post.comments_count)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/explore" className="link mt-2 inline-block text-sm">
        Explore more
      </Link>
    </section>
  );
}

function ProfileCompletion() {
  const { profile } = useAuth();
  if (!profile) return null;
  const missing = [
    !profile.full_name && 'name',
    !profile.bio && 'bio',
    !profile.avatar_url && 'photo',
  ].filter(Boolean);
  if (!missing.length) return null;

  return (
    <section className="card p-4">
      <h2 className="text-sm font-semibold text-ink">Complete your profile</h2>
      <p className="mt-1 text-sm text-muted">Add your {missing.join(', ')} so people know who they're talking to.</p>
      <Link to="/profile?edit=1" className="link mt-2 inline-block text-sm">
        Edit profile
      </Link>
    </section>
  );
}

export default function RightRail() {
  return (
    <div className="space-y-4">
      <PopularPosts />
      <ProfileCompletion />
      <section className="card p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Sparkles className="h-4 w-4 text-brand-600" aria-hidden="true" />
          Write with AI
        </h2>
        <p className="mt-1 text-sm text-muted">Draft a post from a topic, polish your wording, or summarize a discussion.</p>
        <Link to="/ai" className="link mt-2 inline-block text-sm">
          Open AI Assistant
        </Link>
      </section>
      <footer className="flex items-center justify-between px-1 text-xs text-muted">
        <span>© {new Date().getFullYear()} {APP_NAME}</span>
        <ConnectionStatus />
      </footer>
    </div>
  );
}
