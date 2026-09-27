import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  // `boxed`: square hairline field with the label floating inside it.
  variant?: 'default' | 'boxed';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, variant = 'default', className = '', ...props },
  ref,
) {
  const inputId = id ?? props.name;

  if (variant === 'boxed') {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            placeholder=" "
            className={`peer h-13 w-full border bg-surface px-4 pt-4 text-sm text-ink outline-none transition-colors focus:border-ink ${
              error ? 'border-danger' : 'border-rule'
            } ${className}`}
            {...props}
          />
          <label
            htmlFor={inputId}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted transition-all peer-focus:top-3 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[11px]"
          >
            {label}
            {props.required ? ' *' : ''}
          </label>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }

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
