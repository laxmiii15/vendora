'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';

function CartIcon() {
  const { totalCount } = useCart();
  return (
    <Link
      href="/cart"
      className="relative flex items-center text-ink-muted transition-colors hover:text-ink"
      aria-label="Cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
        />
        <circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none" />
      </svg>
      {totalCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
          {totalCount}
        </span>
      )}
    </Link>
  );
}

function NavDivider() {
  return <span className="h-5 w-px bg-rule" aria-hidden="true" />;
}

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header className="border-b border-rule bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-wide text-brand-ink"
        >
          Vendora
        </Link>

        <nav className="flex items-center gap-5">
          <CartIcon />
          <NavDivider />

          {user ? (
            <div className="flex items-center gap-5">
              <span className="text-sm text-ink-muted">
                Hi, {user.firstName ?? user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Log in
              </Link>
              <Link href="/register">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
