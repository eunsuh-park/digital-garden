/**
 * 지도 회전 도구
 * - 기준: 도로 기준 / 집 기준
 * - 방향: 수직 / 수평
 * 집 = SVG 내 집 도형(rect.st2)이 아래로 오는 기준
 *
 * @param {'road' | 'house'} base - 기준
 * @param {'vertical' | 'horizontal'} direction - 방향
 * @param {(base: 'road' | 'house') => void} onChangeBase
 * @param {(direction: 'vertical' | 'horizontal') => void} onChangeDirection
 */
export default function MapRotationTool({
  base = 'road',
  direction = 'horizontal',
  onChangeBase,
  onChangeDirection,
}) {
  return (
    <>
      <div className="garden-map__toolbar-group" aria-label="지도 기준">
        <button
          type="button"
          className={`garden-map__toolbar-btn ${base === 'road' ? 'garden-map__toolbar-btn--active' : ''}`}
          onClick={() => onChangeBase?.('road')}
          aria-label="도로 기준"
          aria-pressed={base === 'road'}
        >
          도로 기준
        </button>
        <button
          type="button"
          className={`garden-map__toolbar-btn ${base === 'house' ? 'garden-map__toolbar-btn--active' : ''}`}
          onClick={() => onChangeBase?.('house')}
          aria-label="집 기준"
          aria-pressed={base === 'house'}
        >
          집 기준
        </button>
      </div>

      <div className="garden-map__toolbar-group" aria-label="지도 방향">
        <span className="garden-map__toolbar-label">방향</span>
        <button
          type="button"
          className={`garden-map__toolbar-btn ${direction === 'vertical' ? 'garden-map__toolbar-btn--active' : ''}`}
          onClick={() => onChangeDirection?.('vertical')}
          aria-label="수직"
          aria-pressed={direction === 'vertical'}
        >
          수직
        </button>
        <button
          type="button"
          className={`garden-map__toolbar-btn ${direction === 'horizontal' ? 'garden-map__toolbar-btn--active' : ''}`}
          onClick={() => onChangeDirection?.('horizontal')}
          aria-label="수평"
          aria-pressed={direction === 'horizontal'}
        >
          수평
        </button>
      </div>
    </>
  );
}
