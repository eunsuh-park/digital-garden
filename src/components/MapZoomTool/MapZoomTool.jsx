/**
 * 지도 확대/축소 도구
 * - 현재 크기(100%)가 최소, 그 이상만 확대 가능
 * @param {number} zoom - 현재 배율 (1.0 = 100%)
 * @param {() => void} onZoomIn - 확대
 * @param {() => void} onZoomOut - 축소 (최소 100%까지)
 * @param {() => void} onReset - 100%로 초기화
 */
export default function MapZoomTool({ zoom = 1, onZoomIn, onZoomOut, onReset }) {
  const isMin = zoom <= 1.00001;

  return (
    <div className="garden-map__toolbar-group" aria-label="지도 확대/축소">
      <span className="garden-map__toolbar-label">확대</span>
      <button
        type="button"
        className="garden-map__toolbar-btn"
        onClick={onZoomOut}
        disabled={isMin}
        aria-label="축소"
      >
        -
      </button>
      <button
        type="button"
        className="garden-map__toolbar-btn"
        onClick={onReset}
        disabled={isMin}
        aria-label="원래 크기(100%)"
      >
        100%
      </button>
      <button
        type="button"
        className="garden-map__toolbar-btn"
        onClick={onZoomIn}
        aria-label="확대"
      >
        +
      </button>
    </div>
  );
}

