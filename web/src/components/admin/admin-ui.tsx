'use client';

import { useEffect, useState, type ReactNode, type SelectHTMLAttributes } from 'react';

export const PAGE_SIZE = 20;

export const table = {
  wrap: 'overflow-x-auto border border-rule bg-surface',
  table: 'w-full min-w-[640px] text-left text-sm',
  th: 'border-b border-rule bg-surface-sunken px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted',
  td: 'border-b border-rule px-4 py-3 align-middle text-ink',
};

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-ink-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-3">{children}</div>;
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-10 w-full max-w-xs border border-rule bg-surface px-3 text-sm text-ink outline-none focus:border-ink"
    />
  );
}

export function Select({
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-10 border border-rule bg-surface px-3 text-sm text-ink outline-none focus:border-ink disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export const statusTone: Record<string, Tone> = {
  // Orders
  PENDING: 'warning',
  PAID: 'success',
  SHIPPED: 'success',
  DELIVERED: 'neutral',
  CANCELLED: 'danger',
  // Products
  ACTIVE: 'success',
  DRAFT: 'neutral',
  OUT_OF_STOCK: 'warning',
  ARCHIVED: 'neutral',
  // Users
  BANNED: 'danger',
  PENDING_VERIFICATION: 'warning',
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-9 border border-rule px-3 text-ink transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="px-2">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="h-9 border border-rule px-3 text-ink transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-ink-muted">
        {children}
      </td>
    </tr>
  );
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-4 bg-danger-soft px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}

// Delays search-as-you-type so each keystroke doesn't fire a query.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatLabel(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}
