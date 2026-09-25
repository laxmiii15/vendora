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
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
      aria-label="Cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-5.5 w-5.5"
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
        <span className="absolute top-0.5 right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white ring-2 ring-surface">
          {totalCount}
        </span>
      )}
    </Link>
  );
}

function NavDivider() {
  return <span className="h-6 w-px bg-rule" aria-hidden="true" />;
}

function Avatar({ label }: { label: string }) {
  return (
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-ink">
      {label.charAt(0).toUpperCase()}
    </span>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-surface shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-display text-base font-semibold text-white">
            V
          </span>
          <span className="font-display text-2xl font-semibold tracking-wide text-ink">
            Vendora
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <CartIcon />
          <NavDivider />

          {user ? (
            <div className="flex items-center gap-3">
              <Avatar label={user.firstName ?? user.email} />
              <span className="hidden text-sm font-medium text-ink sm:inline">
                {user.firstName ?? user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
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
