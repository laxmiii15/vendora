import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = '', ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`rounded-2xl border bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-soft ${
          error ? 'border-danger' : 'border-rule'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
});
