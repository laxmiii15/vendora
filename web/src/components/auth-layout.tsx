import type { ReactNode } from 'react';
import { Header } from '@/components/header';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ eyebrow, title, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex flex-1 flex-col bg-surface">
      <Header />
      <main className="flex flex-1 justify-center px-4 py-16">
        <div className="w-full max-w-[390px]">
          <p className="inline-block border-b border-ink pb-0.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink">
            {eyebrow}
          </p>
          <h1 className="mt-8 font-display text-[28px] font-semibold leading-tight text-ink">
            {title}
          </h1>
          <p className="mt-4 text-right text-[11px] text-ink-muted">*Required</p>
          {children}
          <p className="mt-6 text-sm text-ink-muted">{footer}</p>
        </div>
      </main>
    </div>
  );
}

export const authLink =
  'font-medium text-ink underline underline-offset-4 transition-opacity hover:opacity-70';
