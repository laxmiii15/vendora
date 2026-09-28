'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { LoadingState } from '@/components/loading-state';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';

const ADMIN_ROLES: UserRole[] = ['ADMIN', 'SUPER_ADMIN'];

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/users', label: 'Users' },
];

const noopSubscribe = () => () => {};

// The session lives in localStorage, so on the server (and during hydration)
// `user` is always null. Without this, a hard refresh on an admin page would
// see "no user" for one render and bounce a real admin to /login.
function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

// This is a UX guard only — it decides what to render. The real enforcement
// is the backend's RolesGuard on every admin query/mutation.
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const { user, logout } = useAuth();
  const isClient = useIsClient();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);

  useEffect(() => {
    if (!isClient) return;
    if (!user) router.replace('/login');
    else if (!isAdmin) router.replace('/');
  }, [isClient, user, isAdmin, router]);

  if (!isClient || !isAdmin) {
    return <LoadingState />;
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-paper md:flex-row">
      <aside className="border-b border-rule bg-surface md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex h-16 items-center justify-between px-6 md:h-[72px]">
          <Link
            href="/admin"
            className="font-display text-xl font-semibold uppercase tracking-[0.2em] text-ink"
          >
            Vendora
          </Link>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
            Admin
          </span>
        </div>

        <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 md:pb-0">
          <ul className="flex gap-1 md:flex-col">
            {NAV.map((item) => {
              const active =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block whitespace-nowrap px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-ink text-surface'
                        : 'text-ink hover:bg-surface-sunken'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden border-t border-rule px-6 py-4 text-sm md:absolute md:inset-x-0 md:bottom-0 md:block">
          <p className="truncate text-xs text-ink-muted">{user.email}</p>
          <div className="mt-2 flex gap-4">
            <Link href="/" className="text-ink hover:underline">
              View store
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-ink-muted hover:text-ink"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">{children}</main>
    </div>
  );
}
