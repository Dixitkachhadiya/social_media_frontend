import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Power, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { errorMessage, parseApiError } from '../../utils/apiError';
import { displayName, formatDateTime } from '../../utils/format';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ErrorState from '../../components/common/ErrorState';
import Alert from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { RoleBadge, StatusBadge, VerifiedBadge } from '../../components/admin/AdminBits';

/**
 * GET /admin/users/:id with PATCH .../status and DELETE.
 * The backend rejects changing your own account (400) and the last active admin (409);
 * those messages are shown as returned.
 */
export default function UserDetailModal({ userId, onClose, onChanged, onDeleted }) {
  const { user: me } = useAuth();
  const [state, setState] = useState({ status: 'loading', user: null, error: null });
  const [actionError, setActionError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setState({ status: 'loading', user: null, error: null });
    try {
      const { user } = await adminService.getUser(userId);
      setState({ status: 'ready', user, error: null });
    } catch (error) {
      setState({ status: 'error', user: null, error: errorMessage(error) });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const isSelf = userId === me?.id;
  const account = state.user;

  const toggleStatus = async () => {
    setUpdating(true);
    setActionError(null);
    try {
      const res = await adminService.setUserStatus(userId, !account.is_active);
      setState((s) => ({ ...s, user: { ...s.user, ...res.user } }));
      onChanged(res.user);
      toast.success(res.message);
    } catch (error) {
      setActionError(parseApiError(error).message);
    } finally {
      setUpdating(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    setActionError(null);
    try {
      const res = await adminService.deleteUser(userId);
      toast.success(res.message);
      setConfirmDelete(false);
      onDeleted(userId);
      onClose();
    } catch (error) {
      setActionError(parseApiError(error).message);
      setConfirmDelete(false);
      setDeleting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="User details" size="lg">
      {state.status === 'loading' && (
        <div className="space-y-4" aria-hidden="true">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      )}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}

      {account && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar src={account.profile?.avatar_url} name={displayName({ ...account.profile, username: account.username })} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-ink">{displayName({ ...account.profile, username: account.username })}</p>
              <p className="truncate text-sm text-muted">
                @{account.username} · {account.email}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <RoleBadge role={account.role} />
                <StatusBadge active={account.is_active} />
                <VerifiedBadge verified={account.is_email_verified} />
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line text-center">
            {[
              ['Posts', account.posts_count],
              ['Comments', account.comments_count],
              ['Likes given', account.likes_given_count],
            ].map(([label, value]) => (
              <div key={label} className="px-2 py-3">
                <dd className="text-lg font-semibold text-ink tabular-nums">{value ?? '—'}</dd>
                <dt className="text-xs text-muted">{label}</dt>
              </div>
            ))}
          </dl>

          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Registered</dt>
              <dd className="text-ink">{formatDateTime(account.created_at)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Last login</dt>
              <dd className="text-ink">{account.last_login_at ? formatDateTime(account.last_login_at) : 'Never'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Password changed</dt>
              <dd className="text-ink">{account.password_changed_at ? formatDateTime(account.password_changed_at) : 'Never'}</dd>
            </div>
            {account.profile?.location && (
              <div>
                <dt className="text-xs text-muted">Location</dt>
                <dd className="text-ink">{account.profile.location}</dd>
              </div>
            )}
          </dl>

          {account.profile?.bio && <p className="rounded-lg bg-slate-50 p-3 text-sm text-ink-soft">{account.profile.bio}</p>}

          {actionError && <Alert tone="error">{actionError}</Alert>}
          {isSelf && <Alert tone="info">This is your account. You can't deactivate or delete yourself.</Alert>}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            {account.is_active ? (
              <Link to={`/u/${account.id}`} className="link text-sm" onClick={onClose}>
                View public profile
              </Link>
            ) : (
              <span className="text-sm text-muted">Public profile hidden while inactive</span>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={toggleStatus} loading={updating} disabled={isSelf}>
                {!updating && <Power className="h-4 w-4" aria-hidden="true" />}
                {account.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={isSelf}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        loading={deleting}
        title={`Delete ${account?.username}?`}
        message="This permanently deletes the account with its profile, posts, comments, likes and notifications. This can't be undone."
        confirmLabel="Delete user"
      />
    </Modal>
  );
}
