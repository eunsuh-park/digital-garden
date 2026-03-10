import { useState, useCallback } from 'react';
import { SECTIONS, getTasksBySection, getSectionById } from '../data/mockData';
import SectionDrawer from './SectionDrawer';
import SectionPopover from './SectionPopover';
import './GardenMap.css';

/**
 * SVG 간이 지도 - 실제 대지를 반영한 핵심 인터페이스
 * CP-04: Section 좌표/SVG id, hover/click → 팝오버·하이라이트·드로어 연결
 */
export default function GardenMap() {
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [hoverSectionId, setHoverSectionId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orientation, setOrientation] = useState('road'); // road | house
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });

  const handleSectionClick = useCallback((e, sectionId) => {
    setActiveSectionId(sectionId);
    setDrawerOpen(true);
  }, []);

  const handleSectionHover = useCallback((e, sectionId, isEnter) => {
    setHoverSectionId(isEnter ? sectionId : null);
    if (isEnter) {
      setPopoverPos({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const selectedSection = activeSectionId ? getSectionById(activeSectionId) : null;
  const hoverSection = hoverSectionId ? getSectionById(hoverSectionId) : null;

  return (
    <div className="garden-map">
      <div className="garden-map__toolbar">
        <button
          type="button"
          className="garden-map__rotate-btn"
          onClick={() => setOrientation((o) => (o === 'road' ? 'house' : 'road'))}
          aria-label={orientation === 'road' ? '집 기준으로 보기' : '도로 기준으로 보기'}
        >
          {orientation === 'road' ? '🏠 집 기준' : '🛣️ 도로 기준'}
        </button>
      </div>

      <div className={`garden-map__svg-wrapper garden-map__svg-wrapper--${orientation}`}>
        <svg
          viewBox="0 0 400 300"
          className="garden-map__svg"
          aria-label="정원 지도"
        >
          <defs>
            <filter id="shadow">
              <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.2" />
            </filter>
          </defs>
          {SECTIONS.map((section) => {
            const isActive = activeSectionId === section.id;
            const isHover = hoverSectionId === section.id;
            const isHighlighted = isActive || isHover || !activeSectionId;
            const opacity = isHighlighted ? (isActive || isHover ? 1 : 0.7) : 0.25;

            return (
              <g key={section.id}>
                <path
                  id={section.svg_id}
                  className="garden-map__section"
                  d={getSectionPath(section.svg_id)}
                  fill={section.color_token}
                  fillOpacity={opacity}
                  stroke={isActive || isHover ? '#2d5a27' : 'rgba(0,0,0,0.15)'}
                  strokeWidth={isActive || isHover ? 2 : 1}
                  filter="url(#shadow)"
                  onClick={(e) => handleSectionClick(e, section.id)}
                  onMouseEnter={(e) => handleSectionHover(e, section.id, true)}
                  onMouseLeave={(e) => handleSectionHover(e, section.id, false)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${section.name} 섹션, 할 일 ${section.taskCount}건`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSectionClick(e, section.id);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="garden-map__legend">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`garden-map__legend-item ${activeSectionId === s.id ? 'garden-map__legend-item--active' : ''}`}
            onClick={() => {
              setActiveSectionId(s.id);
              setDrawerOpen(true);
            }}
          >
            <span className="garden-map__legend-color" style={{ background: s.color_token }} />
            {s.name}
          </button>
        ))}
      </div>

      {hoverSection && (
        <SectionPopover
          section={hoverSection}
          tasks={getTasksBySection(hoverSection.id)}
          position={popoverPos}
          onOpenDrawer={() => {
            setActiveSectionId(hoverSection.id);
            setDrawerOpen(true);
          }}
        />
      )}

      <SectionDrawer
        section={selectedSection}
        tasks={selectedSection ? getTasksBySection(selectedSection.id) : []}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}

/**
 * 섹션별 SVG path (간이 정원 레이아웃 - 도로 기준 수평)
 * 앞마당(하단), 화단A(좌), 화단B(우), 텃밭(중앙), 뒷마당(상단)
 * 실제 대지 구조에 맞게 DQ-06에 따라 좌표 수정 필요
 */
function getSectionPath(svgId) {
  const paths = {
    'section-front': 'M 120 220 L 280 220 L 280 280 L 120 280 Z',
    'section-flower-a': 'M 20 80 L 120 80 L 120 220 L 20 220 Z',
    'section-flower-b': 'M 280 80 L 380 80 L 380 220 L 280 220 Z',
    'section-garden': 'M 120 80 L 280 80 L 280 220 L 120 220 Z',
    'section-back': 'M 120 20 L 280 20 L 280 80 L 120 80 Z',
  };
  return paths[svgId] || paths['section-front'];
}
