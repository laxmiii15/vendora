'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header className="border-b border-rule bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-2xl font-semibold tracking-wide text-brand-ink">
          Vendora
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-ink-muted">
              Hi, {user.firstName ?? user.email}
            </span>
            <Button variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-ink-muted hover:text-ink"
            >
              Log in
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
