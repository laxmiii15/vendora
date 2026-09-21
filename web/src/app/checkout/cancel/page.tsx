import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';

export default function CheckoutCancelPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Checkout cancelled
        </h1>
        <p className="mt-3 text-ink-muted">
          No payment was made. Your order was not completed.
        </p>
        <Link href="/" className="mt-8">
          <Button>Back to shop</Button>
        </Link>
      </main>
    </div>
  );
}
