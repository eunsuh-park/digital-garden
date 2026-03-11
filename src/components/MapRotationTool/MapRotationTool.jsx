/**
 * 지도 회전 도구 - 도로 기준 / 집 기준 / 수직 / 수평 전환
 * 집 = SVG 내 집 도형(rect.st2)이 아래로 오는 방향
 * @param {'road' | 'house' | 'vertical' | 'horizontal'} value - 현재 방향
 * @param {(value: string) => void} onChange - 방향 변경 콜백
 */
export default function MapRotationTool({ value = 'road', onChange }) {
  return (
    <div className="garden-map__toolbar-group">
      <span className="garden-map__toolbar-label">지도 방향</span>
      <button
        type="button"
        className={`garden-map__toolbar-btn ${value === 'road' ? 'garden-map__toolbar-btn--active' : ''}`}
        onClick={() => onChange('road')}
        aria-label="도로가 아래에 오도록 보기"
        aria-pressed={value === 'road'}
      >
        도로 기준
      </button>
      <button
        type="button"
        className={`garden-map__toolbar-btn ${value === 'house' ? 'garden-map__toolbar-btn--active' : ''}`}
        onClick={() => onChange('house')}
        aria-label="집이 아래에 오도록 보기"
        aria-pressed={value === 'house'}
      >
        집 기준
      </button>
      <button
        type="button"
        className={`garden-map__toolbar-btn ${value === 'vertical' ? 'garden-map__toolbar-btn--active' : ''}`}
        onClick={() => onChange('vertical')}
        aria-label="수직 방향으로 보기"
        aria-pressed={value === 'vertical'}
      >
        수직
      </button>
      <button
        type="button"
        className={`garden-map__toolbar-btn ${value === 'horizontal' ? 'garden-map__toolbar-btn--active' : ''}`}
        onClick={() => onChange('horizontal')}
        aria-label="수평 방향으로 보기"
        aria-pressed={value === 'horizontal'}
      >
        수평
      </button>
    </div>
  );
}
