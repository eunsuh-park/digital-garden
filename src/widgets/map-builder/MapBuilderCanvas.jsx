import { Icon } from '@iconify/react';
import arrowDownLine from '@iconify-icons/mingcute/arrow-down-line';
import arrowUpLine from '@iconify-icons/mingcute/arrow-up-line';
import copy2Line from '@iconify-icons/mingcute/copy-2-line';
import delete2Line from '@iconify-icons/mingcute/delete-2-line';
import eyeCloseLine from '@iconify-icons/mingcute/eye-close-line';
import flipHorizontalLine from '@iconify-icons/mingcute/flip-horizontal-line';
import flipVerticalLine from '@iconify-icons/mingcute/flip-vertical-line';
import fullscreen2Line from '@iconify-icons/mingcute/fullscreen-2-line';
import lockLine from '@iconify-icons/mingcute/lock-line';
import targetLine from '@iconify-icons/mingcute/target-line';
import './MapBuilderCanvas.css';

export default function MapBuilderCanvas() {
  return (
    <section className="map-builder-canvas">
      <div className="map-builder-canvas__toolbar-floating">
        <button type="button" className="map-builder-canvas__chip" title="세로 뒤집기">
          <Icon icon={flipVerticalLine} width={16} height={16} aria-hidden />
          <span>flip vertically</span>
        </button>
        <button type="button" className="map-builder-canvas__chip" title="가로 뒤집기">
          <Icon icon={flipHorizontalLine} width={16} height={16} aria-hidden />
          <span>flip horizontally</span>
        </button>
        <button type="button" className="map-builder-canvas__chip map-builder-canvas__chip--icon" title="복제" aria-label="복제">
          <Icon icon={copy2Line} width={18} height={18} />
        </button>
        <button type="button" className="map-builder-canvas__chip map-builder-canvas__chip--icon" title="앞으로" aria-label="앞으로 가져오기">
          <Icon icon={arrowUpLine} width={18} height={18} />
        </button>
        <button type="button" className="map-builder-canvas__chip map-builder-canvas__chip--icon" title="뒤로" aria-label="뒤로 보내기">
          <Icon icon={arrowDownLine} width={18} height={18} />
        </button>
        <button type="button" className="map-builder-canvas__chip map-builder-canvas__chip--icon" title="잠금" aria-label="잠금">
          <Icon icon={lockLine} width={18} height={18} />
        </button>
        <button type="button" className="map-builder-canvas__chip map-builder-canvas__chip--icon" title="숨김" aria-label="숨김">
          <Icon icon={eyeCloseLine} width={18} height={18} />
        </button>
        <button type="button" className="map-builder-canvas__chip map-builder-canvas__chip--icon" title="삭제" aria-label="삭제">
          <Icon icon={delete2Line} width={18} height={18} />
        </button>
      </div>

      <div className="map-builder-canvas__hero-title">내가 관리하고 싶은 정원을 그려보세요</div>

      <div className="map-builder-canvas__stage">
        <div className="map-builder-canvas__lot-border" />
        <div className="map-builder-canvas__roof" />
        <div className="map-builder-canvas__main-house" />
        <div className="map-builder-canvas__path" />

        <div className="map-builder-canvas__tree map-builder-canvas__tree--tl">
          <div className="map-builder-canvas__crown" />
          <div className="map-builder-canvas__trunk" />
        </div>
        <div className="map-builder-canvas__tree map-builder-canvas__tree--tr">
          <div className="map-builder-canvas__crown" />
          <div className="map-builder-canvas__trunk" />
        </div>
        <div className="map-builder-canvas__tree map-builder-canvas__tree--bl">
          <div className="map-builder-canvas__crown" />
          <div className="map-builder-canvas__trunk" />
        </div>
        <div className="map-builder-canvas__tree map-builder-canvas__tree--br">
          <div className="map-builder-canvas__crown" />
          <div className="map-builder-canvas__trunk" />
        </div>
        <div className="map-builder-canvas__tree map-builder-canvas__tree--small map-builder-canvas__tree--mid">
          <div className="map-builder-canvas__crown map-builder-canvas__crown--small" />
          <div className="map-builder-canvas__trunk map-builder-canvas__trunk--small" />
        </div>
        <div className="map-builder-canvas__tree map-builder-canvas__tree--small map-builder-canvas__tree--back">
          <div className="map-builder-canvas__crown map-builder-canvas__crown--small" />
          <div className="map-builder-canvas__trunk map-builder-canvas__trunk--small" />
        </div>

        <div className="map-builder-canvas__hedge map-builder-canvas__hedge--left">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="map-builder-canvas__bush">
              <div className="map-builder-canvas__leaf" />
              <div className="map-builder-canvas__stick" />
            </div>
          ))}
        </div>
        <div className="map-builder-canvas__hedge map-builder-canvas__hedge--right">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="map-builder-canvas__bush">
              <div className="map-builder-canvas__leaf" />
              <div className="map-builder-canvas__stick" />
            </div>
          ))}
        </div>

        <div className="map-builder-canvas__selection">
          <div className="map-builder-canvas__obj-label">집 · 선택됨</div>
          <div className="map-builder-canvas__handle map-builder-canvas__handle--1" />
          <div className="map-builder-canvas__handle map-builder-canvas__handle--2" />
          <div className="map-builder-canvas__handle map-builder-canvas__handle--3" />
          <div className="map-builder-canvas__handle map-builder-canvas__handle--4" />
          <div className="map-builder-canvas__handle map-builder-canvas__handle--5" />
        </div>
      </div>

      <div className="map-builder-canvas__fabs">
        <button type="button" className="map-builder-canvas__fab" title="전체 화면" aria-label="전체 화면">
          <Icon icon={fullscreen2Line} width={20} height={20} />
        </button>
        <button type="button" className="map-builder-canvas__fab" title="뷰 맞춤" aria-label="뷰 맞춤">
          <Icon icon={targetLine} width={20} height={20} />
        </button>
      </div>
    </section>
  );
}
