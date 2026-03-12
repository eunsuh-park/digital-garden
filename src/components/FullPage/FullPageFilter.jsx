import './FullPageFilter.css';

/**
 * FullPage 필터 UI
 * @param {Object} props
 * @param {{ key: string, label: string, options: { value: string, label: string }[] }[]} props.filters - 필터 설정 (DB 스키마 필드 기준)
 * @param {{ [key: string]: string }} props.values - 현재 선택값 { filterKey: optionValue }
 * @param {(key: string, value: string) => void} props.onChange
 * @param {() => void} [props.onReset] - 전체 필터 초기화
 */
export default function FullPageFilter({ filters = [], values = {}, onChange, onReset }) {
  if (filters.length === 0) return null;
  const hasActive = filters.some((f) => !!values[f.key]);

  return (
    <div className="full-page-filter" role="group" aria-label="필터">
      {filters.map((f) => {
        const active = !!values[f.key];
        return (
          <div
            key={f.key}
            className={`full-page-filter__item ${active ? 'full-page-filter__item--active' : ''}`}
          >
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
        );
      })}
      {onReset && (
        <button
          type="button"
          className="full-page-filter__reset"
          onClick={onReset}
          disabled={!hasActive}
        >
          초기화
        </button>
      )}
    </div>
  );
}
