'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format-price';

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  function handleCheckout() {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push('/checkout');
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-semibold text-ink">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-rule bg-surface p-10 text-center">
            <p className="text-ink-muted">Your cart is empty.</p>
            <Link href="/#shop" className="mt-4 inline-block">
              <Button>Continue shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-8 flex flex-col gap-4">
              {items.map((line) => (
                <li
                  key={line.productId}
                  className="flex items-center gap-4 rounded-2xl border border-rule bg-surface p-4"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
                    {line.imageUrl && (
                      <Image
                        src={line.imageUrl}
                        alt={line.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <h3 className="font-medium text-ink">{line.name}</h3>
                    <p className="text-xs text-ink-muted">Size {line.size}</p>
                    <p className="text-sm font-semibold text-ink">
                      {formatPrice(line.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-rule text-ink hover:bg-surface-sunken"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm text-ink">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-rule text-ink hover:bg-surface-sunken"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(line.productId)}
                    className="ml-2 text-xs font-medium text-danger hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-rule bg-surface p-6">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium text-ink">Subtotal</span>
                <span className="font-semibold text-ink">{formatPrice(totalPrice)}</span>
              </div>
              <Button onClick={handleCheckout} className="w-full">
                {user ? 'Proceed to checkout' : 'Log in to checkout'}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
