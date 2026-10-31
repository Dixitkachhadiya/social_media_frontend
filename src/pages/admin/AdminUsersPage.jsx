import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../utils/apiError';
import { timeAgo, formatDate } from '../../utils/format';
import { RoleBadge, StatusBadge, VerifiedBadge } from '../../components/admin/AdminBits';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { ListSkeleton } from '../../components/common/Skeleton';
import UserDetailModal from './UserDetailModal';

const LIMIT = 15;

const FILTERS = [
  { name: 'role', label: 'Role', options: [['', 'All roles'], ['user', 'Users'], ['admin', 'Admins']] },
  { name: 'status', label: 'Status', options: [['', 'Any status'], ['active', 'Active'], ['inactive', 'Inactive']] },
  { name: 'verified', label: 'Email', options: [['', 'Any email'], ['true', 'Verified'], ['false', 'Unverified']] },
  { name: 'sort', label: 'Sort', options: [['newest', 'Newest'], ['oldest', 'Oldest'], ['username', 'Username'], ['last_login', 'Last login']] },
];

// GET /admin/users?page&limit&search&role&status&verified&sort
export default function AdminUsersPage() {
  useDocumentTitle('Manage users');
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState({ role: '', status: '', verified: '', sort: 'newest' });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ status: 'loading', users: [], pagination: null, error: null });
  const openUserId = params.get('user');

  // Debounce the search box
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    adminService
      .listUsers({ page, limit: LIMIT, search, ...filters })
      .then((res) => !cancelled && setState({ status: 'ready', users: res.users, pagination: res.pagination, error: null }))
      .catch((error) => !cancelled && setState({ status: 'error', users: [], pagination: null, error: errorMessage(error) }));
    return () => {
      cancelled = true;
    };
  }, [page, search, filters]);

  const setFilter = (name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };

  const openUser = (id) => setParams(id ? { user: id } : {}, { replace: !id });

  const patchUser = (updated) => setState((s) => ({ ...s, users: s.users.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)) }));
  const dropUser = (id) =>
    setState((s) => ({
      ...s,
      users: s.users.filter((u) => u.id !== id),
      pagination: s.pagination && { ...s.pagination, total: s.pagination.total - 1 },
    }));

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <label htmlFor="user-search" className="sr-only">
            Search users
          </label>
          <input
            id="user-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by username or email"
            maxLength={100}
            className="input pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FILTERS.map(({ name, label, options }) => (
            <select
              key={name}
              aria-label={label}
              value={filters[name]}
              onChange={(event) => setFilter(name, event.target.value)}
              className="input py-2 pr-8"
            >
              {options.map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {state.status === 'loading' && <ListSkeleton rows={6} />}
        {state.status === 'error' && <ErrorState message={state.error} onRetry={() => setFilters((f) => ({ ...f }))} />}
        {state.status === 'ready' && state.users.length === 0 && (
          <EmptyState icon={Users} title="No users match" description="Try a different search or clear some filters." />
        )}

        {state.status === 'ready' && state.users.length > 0 && (
          <>
            {/* Table on larger screens */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-line bg-slate-50 text-xs text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">User</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                  <th className="px-4 py-2.5 font-medium">Last login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {state.users.map((u) => (
                  <tr key={u.id} onClick={() => openUser(u.id)} className="cursor-pointer transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <button type="button" onClick={(e) => { e.stopPropagation(); openUser(u.id); }} className="text-left">
                        <span className="block font-medium text-ink hover:underline">{u.username}</span>
                        <span className="block text-xs text-muted">{u.email}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3"><StatusBadge active={u.is_active} /></td>
                    <td className="px-4 py-3"><VerifiedBadge verified={u.is_email_verified} /></td>
                    <td className="px-4 py-3 text-muted">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-muted">{u.last_login_at ? timeAgo(u.last_login_at) : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Stacked list on phones */}
            <ul className="divide-y divide-line md:hidden">
              {state.users.map((u) => (
                <li key={u.id}>
                  <button type="button" onClick={() => openUser(u.id)} className="w-full px-4 py-3 text-left hover:bg-slate-50">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-ink">{u.username}</span>
                      <StatusBadge active={u.is_active} />
                    </span>
                    <span className="block truncate text-xs text-muted">{u.email}</span>
                    <span className="mt-1.5 flex items-center gap-2">
                      <RoleBadge role={u.role} />
                      <VerifiedBadge verified={u.is_email_verified} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Pagination pagination={state.pagination} onPageChange={setPage} disabled={state.status === 'loading'} />

      {openUserId && (
        <UserDetailModal userId={openUserId} onClose={() => openUser(null)} onChanged={patchUser} onDeleted={dropUser} />
      )}
    </div>
  );
}
