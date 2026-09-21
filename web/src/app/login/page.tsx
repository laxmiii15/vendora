'use client';

import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LOGIN } from '@/graphql/mutations';
import { useAuth } from '@/lib/auth-context';
import type { LoginData } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [runLogin, { loading }] = useMutation<LoginData>(LOGIN);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    try {
      const { data } = await runLogin({ variables: { email, password } });
      if (data) {
        login(data.login.accessToken, data.login.user);
        router.push('/');
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      );
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-2xl font-semibold tracking-wide text-brand-ink">
            Vendora
          </Link>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Log in to your account to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-rule bg-surface p-6 shadow-sm"
        >
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {formError && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          )}
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-brand hover:text-brand-hover"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
