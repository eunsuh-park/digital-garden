import { Icon } from '@iconify/react';
import refresh2Line from '@iconify-icons/mingcute/refresh-2-line';
import './FullPageFilter.css';

/**
 * FullPage ?? UI
 * @param {Object} props
 * @param {{ key: string, label: string, options: { value: string, label: string }[] }[]} props.filters - ?? ?? (DB ??? ?? ??)
 * @param {{ [key: string]: string }} props.values - ?? ??? { filterKey: optionValue }
 * @param {(key: string, value: string) => void} props.onChange
 * @param {() => void} [props.onReset] - ?? ?? ???
 */
export default function FullPageFilter({ filters = [], values = {}, onChange, onReset }) {
  if (filters.length === 0) return null;
  const hasActive = filters.some((f) => !!values[f.key]);

  return (
    <div className="full-page-filter" role="group" aria-label="??">
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
              aria-label={`${f.label} ??`}
            >
              <option value="">??</option>
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
          aria-label="?? ???"
        >
          <Icon icon={refresh2Line} width={14} height={14} />
        </button>
      )}
    </div>
  );
}
