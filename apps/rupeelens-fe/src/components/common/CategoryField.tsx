'use client';

import { Combobox } from '@shared-ui';
import { categoryMatchesQuery, normalizeCategory } from '@shared-utils';

import { useCategoryOptions } from '@/lib/queries/categories';

type CategoryFieldProps = {
  id?: string;
  value: string;
  onChange: (category: string) => void;
  className?: string;
  /** Filter lists: pick existing only. Edit forms: may add a new name on save. */
  mode?: 'edit' | 'filter';
};

/** Category picker: built-ins + your saved custom list. New names commit on Save/Draft only. */
export function CategoryField({
  id,
  value,
  onChange,
  className,
  mode = 'edit',
}: CategoryFieldProps) {
  const options = useCategoryOptions();
  const filterOnly = mode === 'filter';

  return (
    <Combobox
      allowCustom={!filterOnly}
      className={className ?? 'field-input h-10'}
      filter={categoryMatchesQuery}
      id={id}
      onChange={onChange}
      options={options}
      placeholder={
        filterOnly ? 'Filter by category…' : 'Search or add category…'
      }
      resolve={normalizeCategory}
      value={normalizeCategory(value)}
    />
  );
}
