export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';
export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

// The backend exposes User.role/status as plain strings (not GraphQL enums),
// so these unions are hand-typed to match the underlying Prisma enums rather
// than generated.
export type UserRole = 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'BANNED' | 'PENDING_VERIFICATION';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  status: UserStatus;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginData {
  login: AuthResponse;
}

export interface RegisterData {
  register: AuthResponse;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  size: ProductSize;
  imageUrl: string | null;
  categoryId: string;
  category: Category | null;
}

export interface GetCategoriesData {
  getCategories: Category[];
}

export interface GetProductsData {
  getProducts: Product[];
}

export interface GetProductBySlugData {
  productBySlug: Product;
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  product: Product | null;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[] | null;
  createdAt: string;
}

export interface CreateOrderData {
  createOrder: Order;
}

export interface CreateCheckoutSessionData {
  createCheckoutSession: { url: string };
}

export interface MyOrdersData {
  myOrders: Order[];
}

export interface OrderData {
  order: Order;
}

// A cart line stores a snapshot of the product at add-to-cart time (name,
// price, image) so the cart page can render without re-fetching — the
// authoritative price is always re-read server-side when the order is
// actually created, this snapshot is display-only.
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  size: ProductSize;
  categoryId: string;
  quantity: number;
}

// ---- Admin panel ----

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUser extends User {
  createdAt: string;
}

export interface AdminOrder extends Omit<Order, 'customerId'> {
  customer: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> | null;
}

export interface AdminProduct extends Omit<Product, 'category'> {
  category: Pick<Category, 'id' | 'name'> | null;
  createdAt: string;
}

export interface AdminStats {
  revenue: number;
  orderCount: number;
  pendingOrderCount: number;
  customerCount: number;
  activeProductCount: number;
  lowStockCount: number;
}

export interface AdminStatsData {
  adminStats: AdminStats;
}

export interface AdminOrdersData {
  adminOrders: Paginated<AdminOrder>;
}

export interface AdminProductsData {
  adminProducts: Paginated<AdminProduct>;
}

export interface AdminUsersData {
  adminUsers: Paginated<AdminUser>;
}
