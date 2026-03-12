import './FullPageSorter.css';
import { Icon } from '@iconify/react';
import arrowUpFill from '@iconify-icons/mingcute/arrow-up-fill';
import arrowDownFill from '@iconify-icons/mingcute/arrow-down-fill';

/**
 * FullPage 정렬 UI
 * @param {Object} props
 * @param {{ value: string, label: string }[]} props.options - 정렬 필드 옵션 (DB 스키마 필드 기준)
 * @param {{ field: string, dir: 'asc'|'desc' }} props.value - 현재 정렬
 * @param {(field: string, dir: 'asc'|'desc') => void} props.onChange
 * @param {boolean} [props.active] - 기본값과 다른 정렬이 적용되었는지 여부
 */
export default function FullPageSorter({ options = [], value = {}, onChange, active = false }) {
  if (options.length === 0) return null;

  const currentField = value.field || options[0]?.value;
  const currentDir = value.dir || 'asc';

  return (
    <div
      className={`full-page-sorter ${active ? 'full-page-sorter--active' : ''}`}
      role="group"
      aria-label="정렬"
    >
      <label htmlFor="sorter-field" className="full-page-sorter__label">
        정렬
      </label>
      <select
        id="sorter-field"
        className="full-page-sorter__select"
        value={currentField}
        onChange={(e) => onChange(e.target.value, currentDir)}
        aria-label="정렬 기준"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="full-page-sorter__dir"
        onClick={() => onChange(currentField, currentDir === 'asc' ? 'desc' : 'asc')}
        aria-label={currentDir === 'asc' ? '오름차순 (내림차순으로 변경)' : '내림차순 (오름차순으로 변경)'}
        title={currentDir === 'asc' ? '내림차순' : '오름차순'}
      >
        <Icon
          icon={currentDir === 'asc' ? arrowUpFill : arrowDownFill}
          width={16}
          height={16}
        />
      </button>
    </div>
  );
}
