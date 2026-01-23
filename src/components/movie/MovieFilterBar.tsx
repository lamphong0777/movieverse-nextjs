'use client';

import { MovieQueryParams } from '@/types';

interface Option {
  value: string | number;
  label: string;
}

type BaseFilters = Pick<
  MovieQueryParams,
  'page' | 'sort_field' | 'sort_type' | 'sort_lang' | 'country' | 'year' | 'limit'
>;

interface MovieFilterBarProps<T extends BaseFilters = BaseFilters> {
  filters: T;
  onChange: <K extends keyof T>(key: K, value: T[K]) => void;

  showType?: boolean;
  showCategory?: boolean;
  showCountry?: boolean;
  showYear?: boolean;
}

const sortFieldOptions: Option[] = [
  { value: '_id', label: 'Mới đăng' },
  { value: 'modified.time', label: 'Mới cập nhật' },
  { value: 'year', label: 'Năm phát hành' },
];

const sortTypeOptions: Option[] = [
  { value: 'desc', label: 'Giảm dần' },
  { value: 'asc', label: 'Tăng dần' },
];

const langOptions: Option[] = [
  { value: 'vietsub', label: 'Vietsub' },
  { value: 'thuyet-minh', label: 'Thuyết minh' },
  { value: 'long-tieng', label: 'Lồng tiếng' },
];

const countryOptions: Option[] = [
  { value: '', label: 'Tất cả quốc gia' },
  { value: 'viet-nam', label: 'Việt Nam' },
  { value: 'han-quoc', label: 'Hàn Quốc' },
  { value: 'trung-quoc', label: 'Trung Quốc' },
  { value: 'au-my', label: 'Âu Mỹ' },
];

const yearOptions: Option[] = [
  { value: '', label: 'Tất cả năm' },
  ...Array.from({ length: 2025 - 1970 + 1 }, (_, i) => {
    const y = 2025 - i;
    return { value: y, label: String(y) };
  }),
];

export default function MovieFilterBar<T extends BaseFilters>({
  filters,
  onChange,
  showCountry = false,
  showYear = false,
}: MovieFilterBarProps<T>) {
  return (
    <div className="flex flex-wrap gap-2 bg-gray-900 p-3 rounded-md">
      <Select
        value={filters.sort_field}
        options={sortFieldOptions}
        onChange={(v) => onChange('sort_field', v as string)}
      />

      <Select
        value={filters.sort_type}
        options={sortTypeOptions}
        onChange={(v) => onChange('sort_type', v as string)}
      />

      <Select
        value={filters.sort_lang}
        options={langOptions}
        onChange={(v) => onChange('sort_lang', v as string)}
      />

      {showCountry && (
        <Select
          value={filters.country}
          options={countryOptions}
          onChange={(v) => onChange('country', v as string)}
        />
      )}

      {showYear && (
        <Select
          value={filters.year}
          options={yearOptions}
          onChange={(v) =>
  onChange('year', v === '' ? '' : Number(v))
}
        />
      )}
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value?: string | number;
  options: Option[];
  onChange: (v: string | number) => void;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-800 text-sm text-white px-3 py-2 rounded border border-gray-700"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
