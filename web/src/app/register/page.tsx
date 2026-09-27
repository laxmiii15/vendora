'use client';

import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AuthLayout, authLink } from '@/components/auth-layout';
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
    <AuthLayout
      eyebrow="Your account"
      title="Create an account"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className={authLink}>
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            variant="boxed"
            label="First name"
            name="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <Input
            variant="boxed"
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
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
        <div>
          <Input
            variant="boxed"
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="mt-1.5 text-[11px] text-ink-muted">At least 8 characters.</p>
        </div>
        {formError && <p className="text-xs text-danger">{formError}</p>}
        <Button type="submit" variant="solid" disabled={loading} className="mt-2 w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
