'use client';

import { DashboardShell } from '@/components/dashboard-shell';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/users', label: 'Users' },
];

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <DashboardShell
      label="Admin"
      homeHref="/admin"
      nav={NAV}
      allowedRoles={['ADMIN', 'SUPER_ADMIN']}
    >
      {children}
    </DashboardShell>
  );
}
