'use client';

import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthLayout, authLink } from '@/components/auth-layout';
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
    <AuthLayout
      eyebrow="Your account"
      title="Log in to your account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/register" className={authLink}>
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3">
        <Input
          variant="boxed"
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          variant="boxed"
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {formError && <p className="text-xs text-danger">{formError}</p>}
        <Button type="submit" variant="solid" disabled={loading} className="mt-2 w-full">
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
