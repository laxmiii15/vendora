export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';

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
  categoryId: string;
  category: Category | null;
}

export interface GetCategoriesData {
  getCategories: Category[];
}

export interface GetProductsData {
  getProducts: Product[];
}
