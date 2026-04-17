/**
 * MapBuilderToolDock component file.
 * Shows the bottom builder tools for selection, drawing, zoom, and fit actions.
 */

import { useState } from 'react';
import { Icon } from '@iconify/react';
import addCircleFill from '@iconify-icons/mingcute/add-circle-fill';
import addCircleLine from '@iconify-icons/mingcute/add-circle-line';
import cursorFill from '@iconify-icons/mingcute/cursor-fill';
import cursorLine from '@iconify-icons/mingcute/cursor-line';
import minusCircleFill from '@iconify-icons/mingcute/minus-circle-fill';
import minusCircleLine from '@iconify-icons/mingcute/minus-circle-line';
import moveFill from '@iconify-icons/mingcute/move-fill';
import moveLine from '@iconify-icons/mingcute/move-line';
import penFill from '@iconify-icons/mingcute/pen-fill';
import penLine from '@iconify-icons/mingcute/pen-line';
import roundFill from '@iconify-icons/mingcute/round-fill';
import roundLine from '@iconify-icons/mingcute/round-line';
import scanFill from '@iconify-icons/mingcute/scan-fill';
import scanLine from '@iconify-icons/mingcute/scan-line';
import squareFill from '@iconify-icons/mingcute/square-fill';
import squareLine from '@iconify-icons/mingcute/square-line';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import '../styles/MapBuilderToolDock.css';

function ToolButton({ title, active, iconLine, iconFill, onClick }) {
  const [hovered, setHovered] = useState(false);
  const showFill = active || hovered;

  return (
    <button
      type="button"
      className={[
        'map-builder-tool-dock__tool',
        active ? 'map-builder-tool-dock__tool--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <Icon icon={showFill ? iconFill : iconLine} width={20} height={20} aria-hidden />
    </button>
  );
}

export default function MapBuilderToolDock() {
  const {
    mapBuilderTool,
    setMapBuilderTool,
    zoomMapIn,
    zoomMapOut,
    fitMapView,
  } = useProjectNewMapBuilderUi();

  return (
    <section className="map-builder-tool-dock" aria-label="도구">
      <div className="map-builder-tool-dock__toolbars">
        <div className="map-builder-tool-dock__toolbar">
          <div className="map-builder-tool-dock__group">
            <ToolButton
              title="선택"
              active={mapBuilderTool === 'select'}
              iconLine={cursorLine}
              iconFill={cursorFill}
              onClick={() => setMapBuilderTool('select')}
            />
            <ToolButton
              title="이동 (팬)"
              active={mapBuilderTool === 'pan'}
              iconLine={moveLine}
              iconFill={moveFill}
              onClick={() => setMapBuilderTool('pan')}
            />
          </div>
          <div className="map-builder-tool-dock__group">
            <ToolButton
              title="사각형"
              active={mapBuilderTool === 'rect'}
              iconLine={squareLine}
              iconFill={squareFill}
              onClick={() => setMapBuilderTool('rect')}
            />
            <ToolButton
              title="원"
              active={mapBuilderTool === 'ellipse'}
              iconLine={roundLine}
              iconFill={roundFill}
              onClick={() => setMapBuilderTool('ellipse')}
            />
            <ToolButton
              title="자유 그리기"
              active={mapBuilderTool === 'pen'}
              iconLine={penLine}
              iconFill={penFill}
              onClick={() => setMapBuilderTool('pen')}
            />
          </div>
          <div className="map-builder-tool-dock__group">
            <ToolButton
              title="축소"
              active={false}
              iconLine={minusCircleLine}
              iconFill={minusCircleFill}
              onClick={() => zoomMapOut()}
            />
            <ToolButton
              title="확대"
              active={false}
              iconLine={addCircleLine}
              iconFill={addCircleFill}
              onClick={() => zoomMapIn()}
            />
            <ToolButton
              title="맞춤 보기"
              active={false}
              iconLine={scanLine}
              iconFill={scanFill}
              onClick={() => fitMapView()}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
