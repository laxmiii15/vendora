import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // `solid`: square, uppercase, tracked-out button used on the auth pages.
  variant?: 'primary' | 'secondary' | 'solid';
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    solid:
      'h-12 rounded-none bg-ink px-5 text-xs font-medium uppercase tracking-[0.2em] text-surface hover:opacity-85',
    primary: 'bg-brand text-on-brand hover:bg-brand-hover',
    secondary:
      'bg-surface-sunken text-ink hover:bg-rule border border-rule',
  };
  const shape =
    variant === 'solid'
      ? 'inline-flex items-center justify-center transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
      : base;
  return (
    <button className={`${shape} ${variants[variant]} ${className}`} {...props} />
  );
}
