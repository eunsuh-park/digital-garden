import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Drawer from '../Drawer/Drawer';
import MapRotationTool from '../MapRotationTool/MapRotationTool';
import MapZoomTool from '../MapZoomTool/MapZoomTool';
import Popover from '../Popover/Popover';
import Switch from '../Switch/Switch';
import './GardenMap.css';
import gardenMapSvg from '../../gardenMap.svg?raw';

/**
 * SVG 간이 지도 - 실제 대지를 반영한 핵심 인터페이스
 * CP-04: Section 좌표/SVG id, hover/click → 팝오버·하이라이트·드로어 연결
 * @param {Object[]} locations - 구역(Locations) 목록
 * @param {Function} getTasksByLocation - (locationId) => tasks
 * @param {Function} getLocationById - (id) => location
 */
export default function GardenMap({ locations = [], getTasksByLocation, getLocationById }) {
  const [activeLocationId, setActiveLocationId] = useState(null);
  const [hoverLocationId, setHoverLocationId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orientation, setOrientation] = useState('road'); // road | house | vertical | horizontal
  const [viewMode, setViewMode] = useState('default'); // default | satellite
  const [zoom, setZoom] = useState(1); // 1 = 100% (최소)
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const svgHostRef = useRef(null);

  const handleLocationClick = useCallback((e, locationId) => {
    setActiveLocationId(locationId);
    setDrawerOpen(true);
  }, []);

  const handleLocationHover = useCallback((e, locationId, isEnter) => {
    setHoverLocationId(isEnter ? locationId : null);
    if (isEnter) {
      setPopoverPos({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const clampZoom = useCallback((v) => {
    const min = 1;
    const max = 3;
    return Math.max(min, Math.min(max, v));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => clampZoom(Number((z + 0.1).toFixed(2))));
  }, [clampZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => clampZoom(Number((z - 0.1).toFixed(2))));
  }, [clampZoom]);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
  }, []);

  const handleWheelZoom = useCallback(
    (e) => {
      // 지도 위에서 휠 스크롤이 페이지 스크롤로 전파되지 않게 막고 줌만 수행
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1; // up=zoom in, down=zoom out
      setZoom((prev) => {
        const next = dir > 0 ? prev + 0.1 : prev - 0.1;
        return clampZoom(Number(next.toFixed(2)));
      });
    },
    [clampZoom]
  );

  const selectedLocation = activeLocationId && getLocationById ? getLocationById(activeLocationId) : null;
  const hoverLocation = hoverLocationId && getLocationById ? getLocationById(hoverLocationId) : null;
  const getTasks = getTasksByLocation || (() => []);

  const svgIdFallbackMap = useMemo(
    () => ({
      // 이전 간이 지도 id → 실제 SVG 도형 id (호환)
      'section-front': 'front_yard',
      'section-back': 'back_yard',
      'section-garden': 'vegetable_patch',
    }),
    []
  );

  const resolvedLocations = useMemo(() => {
    return locations.map((l) => ({
      ...l,
      resolved_svg_id: l.svg_id || '',
    }));
  }, [locations]);

  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) return;
    const svg = host.querySelector('svg');
    if (!svg) return;

    const cleanups = [];

    function resolveSvgId(rawId) {
      if (!rawId) return '';
      return rawId;
    }

    function getTargetEl(svgId) {
      if (!svgId) return null;
      // CSS.escape는 구형 브라우저에서 없을 수 있으니 단순 케이스만 지원
      const direct = svg.querySelector(`#${svgId}`);
      if (direct) return direct;
      const fallback = svgIdFallbackMap[svgId];
      if (fallback) return svg.querySelector(`#${fallback}`);
      return null;
    }

    // 이벤트 바인딩 + 기본 스타일 적용
    resolvedLocations.forEach((location) => {
      const svgId = resolveSvgId(location.resolved_svg_id);
      const el = getTargetEl(svgId);
      if (!el) return;

      el.style.cursor = 'pointer';
      el.style.opacity = '1';
      el.style.fillOpacity = '1';
      el.style.strokeLinejoin = 'round';
      el.style.strokeLinecap = 'round';
      if (el.tagName?.toLowerCase() === 'rect') {
        el.setAttribute('rx', '10');
        el.setAttribute('ry', '10');
      }
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute(
        'aria-label',
        `${location.name} 구역, 할 일 ${location.taskCount ?? 0}건`
      );

      const onClick = (e) => handleLocationClick(e, location.id);
      const onEnter = (e) => handleLocationHover(e, location.id, true);
      const onLeave = (e) => handleLocationHover(e, location.id, false);
      const onKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleLocationClick(e, location.id);
        }
      };

      el.addEventListener('click', onClick);
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('keydown', onKeyDown);

      cleanups.push(() => {
        el.removeEventListener('click', onClick);
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('keydown', onKeyDown);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [resolvedLocations, svgIdFallbackMap, handleLocationClick, handleLocationHover]);

  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) return;
    const svg = host.querySelector('svg');
    if (!svg) return;

    function getTargetEl(svgId) {
      if (!svgId) return null;
      const direct = svg.querySelector(`#${svgId}`);
      if (direct) return direct;
      const fallback = svgIdFallbackMap[svgId];
      if (fallback) return svg.querySelector(`#${fallback}`);
      return null;
    }

    resolvedLocations.forEach((location) => {
      const el = getTargetEl(location.resolved_svg_id);
      if (!el) return;

      const isActive = activeLocationId === location.id;
      const isHover = hoverLocationId === location.id;
      el.style.opacity = '1';
      el.style.fillOpacity = '1';
      // 원본 fill을 덮어쓰기 (Notion의 color_token 사용)
      if (location.color_token) {
        el.style.fill = location.color_token;
      }
      el.style.stroke = isActive || isHover ? '#2d5a27' : 'rgba(0,0,0,0.15)';
      el.style.strokeWidth = isActive || isHover ? '2' : '1';
    });
  }, [resolvedLocations, activeLocationId, hoverLocationId, svgIdFallbackMap]);

  return (
    <div className="garden-map">
      <div className="garden-map__toolbar" role="toolbar" aria-label="지도 도구">
        <div className="garden-map__toolbar-inner">
          <MapRotationTool value={orientation} onChange={setOrientation} />

          <div className="garden-map__toolbar-divider" aria-hidden />

          <div className="garden-map__toolbar-group">
            <span className="garden-map__toolbar-label">위성 지도</span>
            <Switch
              checked={viewMode === 'satellite'}
              onChange={(on) => setViewMode(on ? 'satellite' : 'default')}
              ariaLabel={viewMode === 'satellite' ? '위성 지도 끄기' : '위성 지도 켜기'}
            />
          </div>

          <div className="garden-map__toolbar-divider" aria-hidden />

          <MapZoomTool zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleZoomReset} />
        </div>
      </div>

      <div
        className={`garden-map__svg-wrapper garden-map__svg-wrapper--${orientation}`}
        onWheel={handleWheelZoom}
      >
        <div
          className={`garden-map__asset ${viewMode === 'satellite' ? 'garden-map__asset--satellite' : ''}`}
          aria-label="정원 지도"
          // SVG 원본을 그대로 보여주기 (스케일 깨짐 방지)
          ref={svgHostRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          dangerouslySetInnerHTML={{ __html: gardenMapSvg }}
        />
      </div>

      <div className="garden-map__legend">
        {locations.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`garden-map__legend-item ${activeLocationId === l.id ? 'garden-map__legend-item--active' : ''}`}
            onClick={() => {
              setActiveLocationId(l.id);
              setDrawerOpen(true);
            }}
          >
            <span className="garden-map__legend-color" style={{ background: l.color_token }} />
            {l.name}
          </button>
        ))}
      </div>

      {hoverLocation && (
        <Popover
          section={hoverLocation}
          tasks={getTasks(hoverLocation.id)}
          position={popoverPos}
          onOpenDrawer={() => {
            setActiveLocationId(hoverLocation.id);
            setDrawerOpen(true);
          }}
        />
      )}

      <Drawer
        section={selectedLocation}
        tasks={selectedLocation ? getTasks(selectedLocation.id) : []}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}

