'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useState, type FormEvent } from 'react';
import {
  EmptyRow,
  InlineError,
  PageHeader,
  errorMessage,
  table,
} from '@/components/admin/admin-ui';
import { slugify } from '@/components/admin/product-form';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { Button } from '@/components/ui/button';
import { CREATE_CATEGORY, DELETE_CATEGORY, UPDATE_CATEGORY } from '@/graphql/admin';
import { GET_CATEGORIES } from '@/graphql/queries';
import type { Category, GetCategoriesData } from '@/lib/types';

const field =
  'h-10 w-full border border-rule bg-surface px-3 text-sm text-ink outline-none focus:border-ink';

function CategoryRow({
  category,
  onError,
}: {
  category: Category;
  onError: (message: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);

  // updateCategory returns the category with its id, so Apollo updates the
  // cached GetCategories list in place (including the storefront header).
  const [runUpdate, updateState] = useMutation(UPDATE_CATEGORY);
  const [runDelete, deleteState] = useMutation(DELETE_CATEGORY, {
    refetchQueries: ['GetCategories'],
  });

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    onError(null);
    try {
      await runUpdate({
        variables: { id: category.id, input: { name: name.trim(), slug: slug.trim() } },
      });
      setEditing(false);
    } catch (err) {
      onError(errorMessage(err));
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    onError(null);
    try {
      await runDelete({ variables: { id: category.id } });
    } catch {
      onError(
        `"${category.name}" couldn't be deleted — move its products to another category first.`,
      );
    }
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={3} className={table.td}>
          <form onSubmit={handleSave} className="flex flex-wrap items-center gap-3">
            <input
              aria-label="Name"
              required
              minLength={3}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`${field} max-w-xs`}
            />
            <input
              aria-label="Slug"
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className={`${field} max-w-xs`}
            />
            <Button type="submit" disabled={updateState.loading}>
              Save
            </Button>
            <button
              type="button"
              onClick={() => {
                setName(category.name);
                setSlug(category.slug);
                setEditing(false);
              }}
              className="text-sm text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className={`${table.td} font-medium`}>{category.name}</td>
      <td className={`${table.td} text-ink-muted`}>{category.slug}</td>
      <td className={`${table.td} text-right`}>
        <div className="flex justify-end gap-3 text-xs font-medium">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-ink hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteState.loading}
            className="text-danger hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminCategoriesPage() {
  const { data, loading, error } = useQuery<GetCategoriesData>(GET_CATEGORIES);
  const [name, setName] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const [runCreate, createState] = useMutation(CREATE_CATEGORY, {
    refetchQueries: ['GetCategories'],
  });

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setActionError(null);
    try {
      await runCreate({
        variables: { input: { name: name.trim(), slug: slugify(name) } },
      });
      setName('');
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  const categories = data?.getCategories ?? [];

  return (
    <>
      <PageHeader title="Categories" description="Categories appear in the storefront navigation" />

      <form onSubmit={handleCreate} className="mb-4 flex flex-wrap items-center gap-3">
        <input
          aria-label="New category name"
          placeholder="New category name"
          required
          minLength={3}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={`${field} max-w-xs`}
        />
        <Button type="submit" disabled={createState.loading || !name.trim()}>
          Add category
        </Button>
        {name.trim() && (
          <span className="text-xs text-ink-muted">Slug: {slugify(name)}</span>
        )}
      </form>

      <InlineError message={actionError} />

      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th className={table.th}>Name</th>
              <th className={table.th}>Slug</th>
              <th className={`${table.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <EmptyRow colSpan={3}>No categories yet.</EmptyRow>
            ) : (
              categories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  onError={setActionError}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
