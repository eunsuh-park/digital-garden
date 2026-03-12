import { Icon } from '@iconify/react';
import minusCircleFill from '@iconify-icons/mingcute/minus-circle-fill';
import refresh2Fill from '@iconify-icons/mingcute/refresh-2-fill';
import addCircleFill from '@iconify-icons/mingcute/add-circle-fill';

/**
 * ì§€???•ë?/ì¶•ì†Œ ?„êµ¬
 * - ?„ìž¬ ?¬ê¸°(100%)ê°€ ìµœì†Œ, ê·??´ìƒë§??•ë? ê°€??
 * @param {number} zoom - ?„ìž¬ ë°°ìœ¨ (1.0 = 100%)
 * @param {() => void} onZoomIn - ?•ë?
 * @param {() => void} onZoomOut - ì¶•ì†Œ (ìµœì†Œ 100%ê¹Œì?)
 * @param {() => void} onReset - 100%ë¡?ì´ˆê¸°??
 */
export default function MapZoomTool({ zoom = 1, onZoomIn, onZoomOut, onReset }) {
  const isMin = zoom <= 1.00001;

  return (
    <div className="garden-map__toolbar-group garden-map__zoom-ui__group" aria-label="ì§€???•ë?/ì¶•ì†Œ">
      <button
        type="button"
        className="garden-map__toolbar-btn"
        onClick={onZoomOut}
        disabled={isMin}
        aria-label="ì¶•ì†Œ"
      >
        <Icon icon={zoomOutLine} width={16} height={16} />
      </button>
      <button
        type="button"
        className="garden-map__toolbar-btn"
        onClick={onReset}
        disabled={isMin}
        aria-label="?ëž˜ ?¬ê¸°(100%)"
      >
        <Icon icon={refresh2Line} width={16} height={16} />
      </button>
      <button
        type="button"
        className="garden-map__toolbar-btn"
        onClick={onZoomIn}
        aria-label="?•ë?"
      >
        <Icon icon={zoomInLine} width={16} height={16} />
      </button>
    </div>
  );
}

