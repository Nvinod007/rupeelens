'use client';

import { Combobox } from '@shared-ui';
import { categoryMatchesQuery, normalizeCategory } from '@shared-utils';

import { useAddCategory, useCategoryOptions } from '@/lib/queries/categories';

type CategoryFieldProps = {
  id?: string;
  value: string;
  onChange: (category: string) => void;
};

/**
 * Category picker: type to filter the built-in list plus your own categories.
 * Text that isn't in the list can be added; it is remembered for next time.
 */
export function CategoryField({ id, value, onChange }: CategoryFieldProps) {
  const options = useCategoryOptions();
  const addCategory = useAddCategory();

  const handleChange = (next: string) => {
    onChange(next);
    const known = options.some((o) => o.toLowerCase() === next.toLowerCase());
    if (next && !known) {
      addCategory.mutate(next);
    }
  };

  return (
    <Combobox
      allowCustom
      className="field-input"
      filter={categoryMatchesQuery}
      id={id}
      onChange={handleChange}
      options={options}
      placeholder="Search or add category…"
      resolve={normalizeCategory}
      value={normalizeCategory(value)}
    />
  );
}
