import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { BadgeCheck, CalendarDays, Globe, MapPin, PenSquare, ShieldCheck, UserX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { postService } from '../../services/postService';
import usePaginatedList from '../../hooks/usePaginatedList';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { parseApiError } from '../../utils/apiError';
import { displayName, formatDate, formatCount } from '../../utils/format';
import { PAGE_SIZE } from '../../utils/constants';
import FeedLayout from '../../components/layout/FeedLayout';
import PostList from '../../components/posts/PostList';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import EditProfileModal from './EditProfileModal';

function ProfileSkeleton() {
  return (
    <div className="card p-5 sm:p-6" aria-hidden="true">
      <div className="flex items-center gap-5">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="mt-5 h-4 w-3/4" />
    </div>
  );
}

function ProfileHeader({ account, isOwn, postCount, onEdit }) {
  const profile = account.profile ?? {};
  const name = displayName({ ...profile, username: account.username });
  const joined = account.joined_at || account.created_at;
  const websiteLabel = profile.website?.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar src={profile.avatar_url} name={name} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="flex items-center gap-1.5 text-xl font-semibold tracking-tight text-ink">
                <span className="truncate">{name}</span>
                {isOwn && account.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Admin
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted">@{account.username}</p>
            </div>
            {isOwn && (
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <PenSquare className="h-4 w-4" aria-hidden="true" /> Edit profile
              </Button>
            )}
          </div>

          {profile.bio ? (
            <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap text-ink">{profile.bio}</p>
          ) : (
            isOwn && (
              <button type="button" onClick={onEdit} className="link mt-3 text-sm">
                Add a bio
              </button>
            )
          )}

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {profile.location && (
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" /> {profile.location}
              </li>
            )}
            {profile.website && (
              <li className="inline-flex min-w-0 items-center gap-1.5">
                <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer nofollow" className="link truncate">
                  {websiteLabel}
                </a>
              </li>
            )}
            {joined && (
              <li className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" /> Joined {formatDate(joined)}
              </li>
            )}
            {isOwn && account.is_email_verified && (
              <li className="inline-flex items-center gap-1.5 text-emerald-700">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Email verified
              </li>
            )}
          </ul>

          <p className="mt-4 text-sm">
            <span className="font-semibold text-ink tabular-nums">{postCount == null ? '—' : formatCount(postCount)}</span>{' '}
            <span className="text-muted">{postCount === 1 ? 'post' : 'posts'}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const { id: routeId } = useParams();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const isOwn = !routeId || routeId === user?.id;
  const profileId = isOwn ? user?.id : routeId;

  const [state, setState] = useState({ status: 'loading', account: null, error: null });
  const editing = isOwn && params.get('edit') === '1';
  useDocumentTitle(state.account ? displayName({ ...state.account.profile, username: state.account.username }) : 'Profile');

  const load = async () => {
    setState({ status: 'loading', account: null, error: null });
    try {
      const { user: account } = isOwn ? await userService.getMyProfile() : await userService.getPublicProfile(routeId);
      setState({ status: 'ready', account, error: null });
    } catch (error) {
      const parsed = parseApiError(error);
      setState({ status: parsed.status === 404 || parsed.status === 400 ? 'missing' : 'error', account: null, error: parsed.message });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, isOwn]);

  // GET /posts?user_id=... (pagination.total doubles as the post count)
  const posts = usePaginatedList((page) => postService.list({ page, limit: PAGE_SIZE, userId: profileId, sort: 'latest' }), {
    itemsKey: 'posts',
    deps: [profileId],
    enabled: Boolean(profileId),
  });

  // /u/<my id> shows the same page as /profile
  if (routeId && routeId === user?.id) return <Navigate to="/profile" replace />;

  const setEditing = (open) => setParams(open ? { edit: '1' } : {}, { replace: true });

  return (
    <FeedLayout>
      <div className="space-y-4">
        {state.status === 'loading' && <ProfileSkeleton />}
        {state.status === 'missing' && (
          <div className="card">
            <EmptyState
              icon={UserX}
              title="User not found"
              description="This account doesn't exist or is no longer active."
              action={
                <Link to="/explore" className="link text-sm">
                  Explore posts
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
            <ProfileHeader account={state.account} isOwn={isOwn} postCount={posts.pagination?.total} onEdit={() => setEditing(true)} />
            <h3 className="px-1 pt-2 text-sm font-semibold text-ink-soft">Posts</h3>
            <PostList
              list={posts}
              emptyTitle={isOwn ? "You haven't posted yet" : 'No posts yet'}
              emptyDescription={isOwn ? 'Share your first update with everyone.' : `@${state.account.username} hasn't shared anything yet.`}
              emptyAction={
                isOwn && (
                  <Link to="/create" className="link text-sm">
                    Create a post
                  </Link>
                )
              }
            />
          </>
        )}
      </div>

      {editing && state.account && (
        <EditProfileModal
          account={state.account}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setState((s) => ({ ...s, account: { ...s.account, ...updated } }));
            // Author names and avatars on the listed posts come from the profile
            posts.setItems((items) =>
              items.map((post) => ({
                ...post,
                author: { ...post.author, username: updated.username, full_name: updated.profile.full_name, avatar_url: updated.profile.avatar_url },
              })),
            );
          }}
        />
      )}
    </FeedLayout>
  );
}
