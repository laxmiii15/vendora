import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Thank you for your order
        </h1>
        <p className="mt-3 text-ink-muted">
          Your payment is being confirmed. This usually only takes a moment —
          your order status will update automatically once it&apos;s
          processed.
        </p>
        <Link href="/" className="mt-8">
          <Button>Continue shopping</Button>
        </Link>
      </main>
    </div>
  );
}
