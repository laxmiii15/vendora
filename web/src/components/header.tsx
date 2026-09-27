'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { GET_CATEGORIES } from '@/graphql/queries';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import type { GetCategoriesData } from '@/lib/types';

const ANNOUNCEMENT = 'Enjoy free shipping on your first order';

const iconButton =
  'relative flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-brand';

const navLink =
  'relative py-1 text-xs font-medium uppercase tracking-[0.14em] text-ink transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform hover:after:scale-x-100';

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function AnnouncementBar({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative bg-surface-sunken px-10 py-2 text-center text-xs text-ink">
      {ANNOUNCEMENT}
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss announcement"
        className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
      >
        <Icon>
          <path d="M6 6l12 12M18 6L6 18" />
        </Icon>
      </button>
    </div>
  );
}

function CartLink() {
  const { totalCount } = useCart();
  return (
    <Link href="/cart" className={iconButton} aria-label="Cart">
      <Icon>
        <path d="M5 8h14l-1 12H6L5 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </Icon>
      {totalCount > 0 && (
        <span className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-on-brand">
          {totalCount}
        </span>
      )}
    </Link>
  );
}

function SearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = term.trim();
    router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}#shop` : '/#shop');
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={iconButton}
        aria-label={open ? 'Close search' : 'Search'}
        aria-expanded={open}
      >
        <Icon>
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </>
          )}
        </Icon>
      </button>
      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 top-full z-30 mt-2 w-64 border border-rule bg-surface p-2 shadow-md sm:w-72"
        >
          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="w-full border border-rule bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        </form>
      )}
    </div>
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const accountIcon = (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </Icon>
  );

  if (!user) {
    return (
      <Link href="/login" className={iconButton} aria-label="Log in">
        {accountIcon}
      </Link>
    );
  }

  function handleLogout() {
    setOpen(false);
    logout();
    router.push('/');
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={iconButton}
        aria-label="Account"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {accountIcon}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-52 border border-rule bg-surface py-2 shadow-md"
        >
          <p className="truncate px-4 pb-2 text-xs text-ink-muted">
            {user.firstName ?? user.email}
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-ink transition-colors hover:bg-surface-sunken"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { data } = useQuery<GetCategoriesData>(GET_CATEGORIES);
  const categories = data?.getCategories ?? [];

  const links = [
    { href: '/#shop', label: 'All products' },
    ...categories.map((category) => ({
      href: `/?category=${category.id}#shop`,
      label: category.name,
    })),
  ];

  return (
    <header className="sticky top-0 z-20 bg-surface">
      {showAnnouncement && (
        <AnnouncementBar onClose={() => setShowAnnouncement(false)} />
      )}

      <div className="border-b border-rule">
        <div className="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-4 sm:px-8 lg:px-12">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className={`${iconButton} -ml-2 lg:hidden`}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <Icon>
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </Icon>
            </button>
            <Link
              href="/"
              className="font-display text-[28px] font-semibold uppercase tracking-[0.25em] text-ink max-lg:hidden"
            >
              Vendora
            </Link>
          </div>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-10 lg:flex"
          >
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={navLink}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Wordmark is centered on mobile, where the centre nav is hidden. */}
          <Link
            href="/"
            className="col-start-2 row-start-1 font-display text-2xl font-semibold uppercase tracking-[0.2em] text-ink lg:hidden"
          >
            Vendora
          </Link>

          <div className="col-start-3 row-start-1 flex items-center justify-end gap-1">
            <SearchBox />
            <AccountMenu />
            <CartLink />
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile"
          className="border-b border-rule bg-surface px-4 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-xs font-medium uppercase tracking-[0.14em] text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {!user && (
              <li>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted"
                >
                  Create account
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
