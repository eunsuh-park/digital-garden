import { Icon } from '@iconify/react';
import zoomOutLine from '@iconify-icons/mingcute/zoom-out-line';
import refresh2Line from '@iconify-icons/mingcute/refresh-2-line';
import zoomInLine from '@iconify-icons/mingcute/zoom-in-line';

/**
 * ?? ??/?? ??
 * - ?? ??(100%)? ??, ? ??? ?? ??
 * @param {number} zoom - ?? ?? (1.0 = 100%)
 * @param {() => void} onZoomIn - ??
 * @param {() => void} onZoomOut - ?? (?? 100%??)
 * @param {() => void} onReset - 100%? ???
 */
export default function MapZoomTool({ zoom = 1, onZoomIn, onZoomOut, onReset }) {
  const isMin = zoom <= 1.00001;

  return (
    <div className="garden-map__toolbar-group garden-map__zoom-ui__group" aria-label="?? ??/??">
      <button
        type="button"
        className="garden-map__toolbar-btn"
        onClick={onZoomOut}
        disabled={isMin}
        aria-label="??"
      >
        <Icon icon={zoomOutLine} width={16} height={16} />
      </button>
      <button
        type="button"
        className="garden-map__toolbar-btn"
        onClick={onReset}
        disabled={isMin}
        aria-label="?? ??(100%)"
      >
        <Icon icon={refresh2Line} width={16} height={16} />
      </button>
      <button
        type="button"
        className="garden-map__toolbar-btn"
        onClick={onZoomIn}
        aria-label="??"
      >
        <Icon icon={zoomInLine} width={16} height={16} />
      </button>
    </div>
  );
}

