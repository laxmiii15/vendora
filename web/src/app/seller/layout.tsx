'use client';

import { DashboardShell } from '@/components/dashboard-shell';

const NAV = [
  { href: '/seller', label: 'Dashboard' },
  { href: '/seller/products', label: 'My products' },
  { href: '/seller/orders', label: 'Orders' },
];

export default function SellerLayout({ children }: LayoutProps<'/seller'>) {
  return (
    <DashboardShell
      label="Seller"
      homeHref="/seller"
      nav={NAV}
      allowedRoles={['SELLER', 'ADMIN', 'SUPER_ADMIN']}
    >
      {children}
    </DashboardShell>
  );
}
