'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '@/graphql/admin';
import { GET_CATEGORIES } from '@/graphql/queries';
import type {
  AdminProduct,
  GetCategoriesData,
  ProductSize,
  ProductStatus,
} from '@/lib/types';
import { InlineError, Select, errorMessage, formatLabel } from './admin-ui';

const PRODUCT_STATUSES: ProductStatus[] = ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'];
const PRODUCT_SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const label = 'text-sm font-medium text-ink';

export function ProductForm({
  product,
  onDone,
}: {
  // Omitted when creating a new product.
  product?: AdminProduct;
  onDone: () => void;
}) {
  const isEdit = !!product;
  const { data: categoryData } = useQuery<GetCategoriesData>(GET_CATEGORIES);
  const categories = categoryData?.getCategories ?? [];

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  // Keep the slug in sync with the name until the admin edits it by hand.
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'DRAFT');
  const [size, setSize] = useState<ProductSize>(product?.size ?? 'M');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [error, setError] = useState<string | null>(null);

  const [runCreate, createState] = useMutation(CREATE_PRODUCT, {
    refetchQueries: ['AdminProducts', 'AdminStats'],
  });
  const [runUpdate, updateState] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: ['AdminStats'],
  });
  const saving = createState.loading || updateState.loading;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const input = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      price: Number(price),
      stock: Number(stock),
      status,
      size,
      imageUrl: imageUrl.trim() || null,
      categoryId: categoryId || (categories[0]?.id ?? ''),
    };

    try {
      if (isEdit) {
        await runUpdate({ variables: { id: product.id, input } });
      } else {
        await runCreate({ variables: { input } });
      }
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <InlineError message={error} />

      <Input
        label="Name"
        name="name"
        required
        minLength={3}
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          if (!slugTouched) setSlug(slugify(event.target.value));
        }}
      />
      <Input
        label="Slug"
        name="slug"
        required
        value={slug}
        onChange={(event) => {
          setSlugTouched(true);
          setSlug(event.target.value);
        }}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className={label}>
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="rounded-2xl border border-rule bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          name="price"
          type="number"
          required
          min={0}
          step={1}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
        <Input
          label="Stock"
          name="stock"
          type="number"
          required
          min={0}
          step={1}
          value={stock}
          onChange={(event) => setStock(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className={label}>
            Status
          </label>
          <Select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ProductStatus)}
          >
            {PRODUCT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {formatLabel(value)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="size" className={label}>
            Size
          </label>
          <Select
            id="size"
            value={size}
            onChange={(event) => setSize(event.target.value as ProductSize)}
          >
            {PRODUCT_SIZES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className={label}>
            Category
          </label>
          <Select
            id="category"
            required
            value={categoryId || categories[0]?.id || ''}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Input
        label="Image URL"
        name="imageUrl"
        type="url"
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
      />

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  );
}
