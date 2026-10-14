import type { ReactNode } from 'react';
import Link from 'next/link';

// A quiet editorial shot — same treatment as the homepage hero — so the
// auth pages read as part of the same store, not a bare form on its own.
const AUTH_IMAGE =
  'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=1200';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({
  eyebrow,
  title,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-1">
      {/* Decorative on desktop only — the form panel carries the page on
          its own at narrower widths, so this never needs to be read. */}
      <div className="relative hidden w-1/2 lg:block" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${AUTH_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/10" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <span className="font-display text-2xl font-semibold uppercase tracking-[0.25em] text-white">
            Vendora
          </span>
          <p className="max-w-sm font-display text-3xl leading-tight font-semibold text-balance text-white">
            Independent sellers. Considered pieces.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col bg-surface lg:w-1/2">
        <div className="flex h-18 items-center justify-between border-b border-rule px-6 sm:px-10">
          <Link
            href="/"
            className="font-display text-xl font-semibold uppercase tracking-[0.2em] text-ink"
          >
            Vendora
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink"
          >
            <span aria-hidden="true">&larr;</span> Back to shop
          </Link>
        </div>

        <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[480px]">
            <p className="inline-block border-b border-ink pb-1 text-xs font-medium uppercase tracking-[0.2em] text-ink">
              {eyebrow}
            </p>
            <h1 className="mt-6 font-display text-[42px] leading-tight font-semibold text-ink">
              {title}
            </h1>
            <div className="mt-8">{children}</div>
            <p className="mt-6 text-sm text-ink-muted">{footer}</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export const authLink =
  'font-medium text-ink underline underline-offset-4 transition-opacity hover:opacity-70';

// A clearer error state than a bare line of red text — used by both the
// login and register forms.
export function AuthError({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-danger bg-danger-soft px-3 py-2 text-xs text-danger">
      {children}
    </p>
  );
}
