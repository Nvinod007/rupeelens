'use client';

import { CUSTOM_CATEGORY_LIMIT } from '@shared-types';
import { Spinner } from '@shared-ui';
import { normalizeCategory } from '@shared-utils';
import { useState } from 'react';

import {
  useAddCategory,
  useCategories,
  useDeleteCategory,
} from '@/lib/queries/categories';

/** Manage the categories you added on top of the built-in list. */
export function CategoriesCard() {
  const { data: categories = [], isLoading } = useCategories();
  const add = useAddCategory();
  const remove = useDeleteCategory();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next = normalizeCategory(name);
    if (!next) {
      return;
    }
    setError(null);
    try {
      await add.mutateAsync(next);
      setName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add category');
    }
  };

  return (
    <section className="glass-card space-y-3 p-4 text-sm">
      <div>
        <h2 className="text-base font-semibold">Custom categories</h2>
        <p className="text-muted-foreground">
          Categories you add appear in the category picker. Existing
          transactions keep their category when you remove one.
        </p>
      </div>

      <form className="flex gap-2" onSubmit={(e) => void submit(e)}>
        <input
          aria-label="New category"
          className="field-input"
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Pooja, Cooler, Pets"
          value={name}
        />
        <button
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          disabled={!name.trim() || add.isPending}
          type="submit"
        >
          {add.isPending ? <Spinner /> : null}
          Add
        </button>
      </form>
      {error ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground">No custom categories yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <li
              className="flex items-center gap-1 rounded-full bg-muted py-1 pl-3 pr-1"
              key={category.id}
            >
              <span>{category.name}</span>
              <button
                aria-label={`Remove ${category.name}`}
                className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-50"
                disabled={remove.isPending}
                onClick={() => remove.mutate(category.id)}
                type="button"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        {categories.length}/{CUSTOM_CATEGORY_LIMIT} used
      </p>
    </section>
  );
}
