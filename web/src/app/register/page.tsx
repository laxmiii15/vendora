'use client';

import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { REGISTER } from '@/graphql/mutations';
import { useAuth } from '@/lib/auth-context';
import type { RegisterData } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [runRegister, { loading }] = useMutation<RegisterData>(REGISTER);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    try {
      const { data } = await runRegister({
        variables: {
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        },
      });
      if (data) {
        login(data.register.accessToken, data.register.user);
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
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Create an account</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Join Vendora to start shopping.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-rule bg-surface p-6 shadow-sm"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <Input
              label="Last name"
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <p className="mt-1.5 text-xs text-ink-faint">At least 8 characters.</p>
          </div>
          {formError && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          )}
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-brand hover:text-brand-hover"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
