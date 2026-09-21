import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    secondary:
      'bg-surface-sunken text-ink hover:bg-rule border border-rule',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
