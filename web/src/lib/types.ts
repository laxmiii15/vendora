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
