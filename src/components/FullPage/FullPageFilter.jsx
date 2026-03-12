import './FullPageFilter.css';

/**
 * FullPage 우측 상단 필터 UI
 * @param {Object} props
 * @param {{ key: string, label: string, options: { value: string, label: string }[] }[]} props.filters - 필터 설정 (DB 스키마 필드 기준)
 * @param {{ [key: string]: string }} props.values - 현재 선택값 { filterKey: optionValue }
 * @param {(key: string, value: string) => void} props.onChange
 */
export default function FullPageFilter({ filters = [], values = {}, onChange }) {
  if (filters.length === 0) return null;

  return (
    <div className="full-page-filter" role="group" aria-label="필터">
      {filters.map((f) => (
        <div key={f.key} className="full-page-filter__item">
          <label htmlFor={`filter-${f.key}`} className="full-page-filter__label">
            {f.label}
          </label>
          <select
            id={`filter-${f.key}`}
            className="full-page-filter__select"
            value={values[f.key] ?? ''}
            onChange={(e) => onChange(f.key, e.target.value)}
            aria-label={`${f.label} 필터`}
          >
            <option value="">전체</option>
            {f.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
