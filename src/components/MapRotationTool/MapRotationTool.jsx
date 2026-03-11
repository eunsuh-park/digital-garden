/**
 * 지도 회전 도구
 * - 기준: 도로 / 집 (집 = SVG 내 rect.st2, transform rotate(45) 적용된 직사각형)
 * - 방향: 수평(기본) / 수직(좌측 90°)
 * - 도로+수평 = 0° / 도로+수직 = 270°(-90°) / 집+수평 = 집이 똑바르게 -45°(315°) / 집+수직 = 225°
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
        <span className="garden-map__toolbar-label">기준</span>
        <button
          type="button"
          className={`garden-map__toolbar-btn ${base === 'road' ? 'garden-map__toolbar-btn--active' : ''}`}
          onClick={() => onChangeBase?.('road')}
          aria-label="도로 기준"
          aria-pressed={base === 'road'}
        >
          도로
        </button>
        <button
          type="button"
          className={`garden-map__toolbar-btn ${base === 'house' ? 'garden-map__toolbar-btn--active' : ''}`}
          onClick={() => onChangeBase?.('house')}
          aria-label="집 기준"
          aria-pressed={base === 'house'}
        >
          집
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
