import { Icon } from '@iconify/react';
import addCircleLine from '@iconify-icons/mingcute/add-circle-line';
import cursorLine from '@iconify-icons/mingcute/cursor-line';
import hexagonLine from '@iconify-icons/mingcute/hexagon-line';
import minusCircleLine from '@iconify-icons/mingcute/minus-circle-line';
import moveLine from '@iconify-icons/mingcute/move-line';
import penLine from '@iconify-icons/mingcute/pen-line';
import roundLine from '@iconify-icons/mingcute/round-line';
import rulerLine from '@iconify-icons/mingcute/ruler-line';
import scanLine from '@iconify-icons/mingcute/scan-line';
import squareLine from '@iconify-icons/mingcute/square-line';
import triangleLine from '@iconify-icons/mingcute/triangle-line';
import './MapBuilderToolDock.css';

export default function MapBuilderToolDock() {
  return (
    <section className="map-builder-tool-dock" aria-label="도구">
      <div className="map-builder-tool-dock__toolbars">
        <div className="map-builder-tool-dock__toolbar">
          <div className="map-builder-tool-dock__group">
            <button type="button" className="map-builder-tool-dock__tool map-builder-tool-dock__tool--active" title="선택" aria-label="선택">
              <Icon icon={cursorLine} width={20} height={20} />
            </button>
            <button type="button" className="map-builder-tool-dock__tool" title="이동" aria-label="이동">
              <Icon icon={moveLine} width={20} height={20} />
            </button>
          </div>
          <div className="map-builder-tool-dock__group">
            <button type="button" className="map-builder-tool-dock__tool" title="사각형" aria-label="사각형">
              <Icon icon={squareLine} width={20} height={20} />
            </button>
            <button type="button" className="map-builder-tool-dock__tool" title="원" aria-label="원">
              <Icon icon={roundLine} width={20} height={20} />
            </button>
            <button type="button" className="map-builder-tool-dock__tool" title="삼각형" aria-label="삼각형">
              <Icon icon={triangleLine} width={20} height={20} />
            </button>
            <button type="button" className="map-builder-tool-dock__tool" title="다각형" aria-label="다각형">
              <Icon icon={hexagonLine} width={20} height={20} />
            </button>
            <button type="button" className="map-builder-tool-dock__tool" title="선" aria-label="선">
              <Icon icon={rulerLine} width={20} height={20} />
            </button>
            <button type="button" className="map-builder-tool-dock__tool" title="자유 그리기" aria-label="자유 그리기">
              <Icon icon={penLine} width={20} height={20} />
            </button>
          </div>
          <div className="map-builder-tool-dock__group">
            <button type="button" className="map-builder-tool-dock__tool" title="축소" aria-label="축소">
              <Icon icon={minusCircleLine} width={20} height={20} />
            </button>
            <button type="button" className="map-builder-tool-dock__tool" title="확대" aria-label="확대">
              <Icon icon={addCircleLine} width={20} height={20} />
            </button>
            <button type="button" className="map-builder-tool-dock__tool" title="맞춤 보기" aria-label="맞춤 보기">
              <Icon icon={scanLine} width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
