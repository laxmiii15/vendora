'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import {
  Badge,
  EmptyRow,
  InlineError,
  PAGE_SIZE,
  PageHeader,
  Pagination,
  SearchField,
  Select,
  Toolbar,
  errorMessage,
  formatDate,
  formatLabel,
  statusTone,
  table,
  useDebouncedValue,
} from '@/components/admin/admin-ui';
import { ErrorState } from '@/components/error-state';
import { ADMIN_USERS, UPDATE_USER_ROLE, UPDATE_USER_STATUS } from '@/graphql/admin';
import { useAuth } from '@/lib/auth-context';
import type { AdminUser, AdminUsersData, UserRole, UserStatus } from '@/lib/types';

const USER_ROLES: UserRole[] = ['CUSTOMER', 'SELLER', 'ADMIN', 'SUPER_ADMIN'];
const ELEVATED_ROLES: UserRole[] = ['ADMIN', 'SUPER_ADMIN'];

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const isSuperAdmin = me?.role === 'SUPER_ADMIN';

  const [role, setRole] = useState<UserRole | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const { data, loading, error } = useQuery<AdminUsersData>(ADMIN_USERS, {
    variables: {
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      role: role || undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [runUpdateRole, roleState] = useMutation(UPDATE_USER_ROLE);
  const [runUpdateStatus, statusState] = useMutation(UPDATE_USER_STATUS);
  const busy = roleState.loading || statusState.loading;

  // Mirrors the backend rules so the UI doesn't offer actions that would be
  // rejected: nobody edits themselves, and only a SUPER_ADMIN touches admins.
  function canManage(target: AdminUser) {
    if (target.id === me?.id) return false;
    if (ELEVATED_ROLES.includes(target.role) && !isSuperAdmin) return false;
    return true;
  }

  async function handleRoleChange(target: AdminUser, next: UserRole) {
    setActionError(null);
    try {
      await runUpdateRole({ variables: { id: target.id, role: next } });
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  async function handleToggleBan(target: AdminUser) {
    const next: UserStatus = target.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    if (
      next === 'BANNED' &&
      !window.confirm(`Ban ${target.email}? They will be signed out and unable to log in.`)
    ) {
      return;
    }
    setActionError(null);
    try {
      await runUpdateStatus({ variables: { id: target.id, status: next } });
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  if (error) return <ErrorState message={error.message} />;

  const result = data?.adminUsers;
  const users = result?.items ?? [];
  const assignableRoles = isSuperAdmin
    ? USER_ROLES
    : USER_ROLES.filter((value) => !ELEVATED_ROLES.includes(value));

  return (
    <>
      <PageHeader title="Users" description="Manage roles and account access" />

      <Toolbar>
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by name or email"
        />
        <Select
          value={role}
          onChange={(event) => {
            setRole(event.target.value as UserRole | '');
            setPage(1);
          }}
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          {USER_ROLES.map((value) => (
            <option key={value} value={value}>
              {formatLabel(value)}
            </option>
          ))}
        </Select>
      </Toolbar>

      <InlineError message={actionError} />

      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>User</th>
              <th className={table.th}>Joined</th>
              <th className={table.th}>Role</th>
              <th className={table.th}>Status</th>
              <th className={`${table.th} text-right`}>Access</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <EmptyRow colSpan={5}>
                {loading ? 'Loading…' : 'No users match these filters.'}
              </EmptyRow>
            ) : (
              users.map((target) => {
                const manageable = canManage(target);
                return (
                  <tr key={target.id}>
                    <td className={table.td}>
                      <div className="font-medium">
                        {target.email}
                        {target.id === me?.id && (
                          <span className="ml-2 text-xs font-normal text-ink-muted">(you)</span>
                        )}
                      </div>
                      {target.firstName && (
                        <div className="text-xs text-ink-muted">
                          {target.firstName} {target.lastName}
                        </div>
                      )}
                    </td>
                    <td className={table.td}>{formatDate(target.createdAt)}</td>
                    <td className={table.td}>
                      {manageable ? (
                        <Select
                          value={target.role}
                          disabled={busy}
                          onChange={(event) =>
                            handleRoleChange(target, event.target.value as UserRole)
                          }
                          aria-label={`Role for ${target.email}`}
                          className="h-8 text-xs"
                        >
                          {assignableRoles.map((value) => (
                            <option key={value} value={value}>
                              {formatLabel(value)}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <span className="text-sm">{formatLabel(target.role)}</span>
                      )}
                    </td>
                    <td className={table.td}>
                      <Badge tone={statusTone[target.status] ?? 'neutral'}>
                        {formatLabel(target.status)}
                      </Badge>
                    </td>
                    <td className={`${table.td} text-right`}>
                      {manageable && (
                        <button
                          type="button"
                          onClick={() => handleToggleBan(target)}
                          disabled={busy}
                          className={`text-xs font-medium hover:underline disabled:opacity-50 ${
                            target.status === 'BANNED' ? 'text-ink' : 'text-danger'
                          }`}
                        >
                          {target.status === 'BANNED' ? 'Unban' : 'Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {result && (
        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          onPageChange={setPage}
        />
      )}
    </>
  );
}
