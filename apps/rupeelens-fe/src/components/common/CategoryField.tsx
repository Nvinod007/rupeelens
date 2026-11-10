'use client';

import { Combobox } from '@shared-ui';
import { categoryMatchesQuery, normalizeCategory } from '@shared-utils';

import { useCategoryOptions } from '@/lib/queries/categories';

type CategoryFieldProps = {
  id?: string;
  value: string;
  onChange: (category: string) => void;
};

/** Category picker: built-ins + your saved custom list. New names commit on Save/Draft only. */
export function CategoryField({ id, value, onChange }: CategoryFieldProps) {
  const options = useCategoryOptions();

  return (
    <Combobox
      allowCustom
      className="field-input"
      filter={categoryMatchesQuery}
      id={id}
      onChange={onChange}
      options={options}
      placeholder="Search or add category…"
      resolve={normalizeCategory}
      value={normalizeCategory(value)}
    />
  );
}
