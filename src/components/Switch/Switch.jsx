import './Switch.css';

/**
 * 스위치 UI - on/off 토글
 * @param {boolean} checked - 켜짐 여부
 * @param {(checked: boolean) => void} onChange - 변경 콜백
 * @param {string} [ariaLabel] - 접근성 레이블
 * @param {string} [className] - 추가 클래스
 */
export default function Switch({ checked = false, onChange, ariaLabel, className = '' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`switch ${className}`.trim()}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__track">
        <span className="switch__thumb" />
      </span>
    </button>
  );
}
