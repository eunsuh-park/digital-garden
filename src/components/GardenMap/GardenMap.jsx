import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import refresh2Line from '@iconify-icons/mingcute/refresh-2-line';
import { useMapPanelLayout } from '../../context/MapPanelLayoutContext';
import { useMapPanelDetail } from '../../context/MapPanelDetailContext';
import Popover from '../Popover/Popover';
import './GardenMap.css';
import gardenMapSvg from '../../gardenMap.svg?raw';

/**
 * SVG 간이 지도 - 실제 대지를 반영한 핵심 인터페이스
 * CP-04: Section 좌표/SVG id, hover/click → 팝오버·하이라이트·드로어 연결
 * @param {Object[]} locations - 구역(Locations) 목록
 * @param {Function} getTasksByLocation - (locationId) => tasks
 * @param {Function} getPlantsByLocation - (locationId) => plants
 * @param {Function} getLocationById - (id) => location
 */
export default function GardenMap({ locations = [], getTasksByLocation, getPlantsByLocation, getLocationById }) {
  const { stackedLayout } = useMapPanelLayout();
  const { openLocationDetail } = useMapPanelDetail();
  const [activeLocationId, setActiveLocationId] = useState(null);
  const [hoverLocationId, setHoverLocationId] = useState(null);
  const [mapBase, setMapBase] = useState('road'); // road | house
  const [mapDirection, setMapDirection] = useState('horizontal'); // vertical | horizontal
  const [zoom, setZoom] = useState(1); // 1 = 100% (최소)
  const [mapOnlyMode, setMapOnlyMode] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const svgHostRef = useRef(null);
  const svgViewBoxRef = useRef(null);
  const svgOriginalViewBoxRef = useRef(null);
  const panRef = useRef({ active: false, startX: 0, startY: 0, startVbX: 0, startVbY: 0 });
  const pinchRef = useRef({ active: false, startDistance: 0, startZoom: 1 });

  const ORIENTATION_OPTIONS = useMemo(
    () => [
      { value: 'road-horizontal', label: '도로를 기준으로 수평 View', base: 'road', direction: 'horizontal' },
      { value: 'road-vertical', label: '도로를 기준으로 수직 View', base: 'road', direction: 'vertical' },
      { value: 'house-horizontal', label: '집을 기준으로 수평 View', base: 'house', direction: 'horizontal' },
      { value: 'house-vertical', label: '집을 기준으로 수직 View', base: 'house', direction: 'vertical' },
    ],
    []
  );
  const orientationValue = `${mapBase}-${mapDirection}`;

  const handleLocationClick = useCallback((e, locationId) => {
    setActiveLocationId(locationId);
    const loc = getLocationById ? getLocationById(locationId) : null;
    if (loc) openLocationDetail(loc);
    // 섹션 클릭 시 hover 상태 팝오버는 닫기
    setHoverLocationId(null);
  }, [getLocationById, openLocationDetail]);

  const handleLocationHover = useCallback((e, locationId, isEnter) => {
    setHoverLocationId(isEnter ? locationId : null);
    if (isEnter) {
      setPopoverPos({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const clampZoom = useCallback((v) => {
    const min = 1;
    const max = 3;
    return Math.max(min, Math.min(max, v));
  }, []);

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

  const applyPanFromClient = useCallback(
    (wrapper, clientX, clientY) => {
      const rect = wrapper.getBoundingClientRect();
      const vb = svgViewBoxRef.current;
      const svg = svgHostRef.current?.querySelector?.('svg');
      if (!vb || !svg) return;

      const dxPx = clientX - panRef.current.startX;
      const dyPx = clientY - panRef.current.startY;
      const dx = (dxPx * vb.w) / rect.width;
      const dy = (dyPx * vb.h) / rect.height;

      const next = clampViewBox({
        x: panRef.current.startVbX - dx,
        y: panRef.current.startVbY - dy,
        w: vb.w,
        h: vb.h,
      });
      svgViewBoxRef.current = next;
      svg.setAttribute('viewBox', `${next.x} ${next.y} ${next.w} ${next.h}`);
    },
    []
  );

  const rotationDeg = useMemo(() => {
    // 기본: 도로 기준 + 수평 = 0°
    // 수직 = 좌측 90° (-90°)
    // 집 = SVG 내 rect.st2(집)가 rotate(45) 되어 있음 → 그 직사각형이 똑바르게 보이는 게 기준
    //   집+수평: -45°  /  집+수직: -45° - 90° = -135°
    if (mapBase === 'road') {
      return mapDirection === 'vertical' ? 270 : 0; // 수직 = 좌측 90° → 270°
    }
    // house: 집 도형이 똑바르게 보이도록 -45°, 수직은 그에서 좌측 90°
    return mapDirection === 'vertical' ? 225 : 315; // -45° → 315°, -135° → 225°
  }, [mapBase, mapDirection]);

  // SVG viewBox 기반 줌(스크롤바 없이 확대/축소) + 팬(드래그 이동)
  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) return;
    const svg = host.querySelector('svg');
    if (!svg) return;

    // 최초 viewBox 저장
    if (!svgOriginalViewBoxRef.current) {
      const vbAttr = svg.getAttribute('viewBox');
      let x = 0;
      let y = 0;
      let w = 1920;
      let h = 1080;
      if (vbAttr) {
        const parts = vbAttr.split(/[\s,]+/).map((n) => Number(n));
        if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
          [x, y, w, h] = parts;
        }
      }
      svgOriginalViewBoxRef.current = { x, y, w, h };
      svgViewBoxRef.current = { x, y, w, h };
    }

    const orig = svgOriginalViewBoxRef.current;
    const prev = svgViewBoxRef.current || orig;
    const nextW = orig.w / zoom;
    const nextH = orig.h / zoom;
    const cx = prev.x + prev.w / 2;
    const cy = prev.y + prev.h / 2;

    let nextX = cx - nextW / 2;
    let nextY = cy - nextH / 2;

    // 원본 범위 안으로 클램프
    nextX = Math.max(orig.x, Math.min(orig.x + orig.w - nextW, nextX));
    nextY = Math.max(orig.y, Math.min(orig.y + orig.h - nextH, nextY));

    const next = { x: nextX, y: nextY, w: nextW, h: nextH };
    svgViewBoxRef.current = next;
    svg.setAttribute('viewBox', `${next.x} ${next.y} ${next.w} ${next.h}`);
  }, [zoom]);

  const clampViewBox = useCallback((vb) => {
    const orig = svgOriginalViewBoxRef.current;
    if (!orig) return vb;
    const x = Math.max(orig.x, Math.min(orig.x + orig.w - vb.w, vb.x));
    const y = Math.max(orig.y, Math.min(orig.y + orig.h - vb.h, vb.y));
    return { ...vb, x, y };
  }, []);

  const handlePanStart = useCallback(
    (e) => {
      if (zoom <= 1.00001) return;
      const host = svgHostRef.current;
      const svg = host?.querySelector?.('svg');
      if (!svg || !svgViewBoxRef.current) return;
      panRef.current.active = true;
      panRef.current.startX = e.clientX;
      panRef.current.startY = e.clientY;
      panRef.current.startVbX = svgViewBoxRef.current.x;
      panRef.current.startVbY = svgViewBoxRef.current.y;
    },
    [zoom]
  );

  const handlePanMove = useCallback(
    (e) => {
      if (!panRef.current.active) return;
      e.preventDefault();
      applyPanFromClient(e.currentTarget, e.clientX, e.clientY);
    },
    [applyPanFromClient]
  );

  const handlePanEnd = useCallback(() => {
    panRef.current.active = false;
  }, []);

  const distanceBetweenTouches = useCallback((touchA, touchB) => {
    const dx = touchA.clientX - touchB.clientX;
    const dy = touchA.clientY - touchB.clientY;
    return Math.hypot(dx, dy);
  }, []);

  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        pinchRef.current.active = true;
        pinchRef.current.startDistance = distanceBetweenTouches(e.touches[0], e.touches[1]);
        pinchRef.current.startZoom = zoom;
        panRef.current.active = false;
        return;
      }
      if (e.touches.length === 1 && zoom > 1.00001 && svgViewBoxRef.current) {
        panRef.current.active = true;
        panRef.current.startX = e.touches[0].clientX;
        panRef.current.startY = e.touches[0].clientY;
        panRef.current.startVbX = svgViewBoxRef.current.x;
        panRef.current.startVbY = svgViewBoxRef.current.y;
      }
    },
    [distanceBetweenTouches, zoom]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 2 && pinchRef.current.active) {
        e.preventDefault();
        const dist = distanceBetweenTouches(e.touches[0], e.touches[1]);
        const ratio = pinchRef.current.startDistance > 0 ? dist / pinchRef.current.startDistance : 1;
        const next = clampZoom(Number((pinchRef.current.startZoom * ratio).toFixed(2)));
        setZoom(next);
        return;
      }
      if (e.touches.length === 1 && panRef.current.active) {
        e.preventDefault();
        applyPanFromClient(e.currentTarget, e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [applyPanFromClient, clampZoom, distanceBetweenTouches]
  );

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) pinchRef.current.active = false;
    if (e.touches.length === 0) panRef.current.active = false;
  }, []);

  const handleOrientationChange = useCallback(
    (e) => {
      const selected = ORIENTATION_OPTIONS.find((opt) => opt.value === e.target.value);
      if (!selected) return;
      setMapBase(selected.base);
      setMapDirection(selected.direction);
    },
    [ORIENTATION_OPTIONS]
  );

  const toggleMapOnlyMode = useCallback(() => {
    setMapOnlyMode((prev) => !prev);
  }, []);

  useEffect(() => {
    const cls = 'map-only-mode';
    document.body.classList.toggle(cls, mapOnlyMode);
    if (mapOnlyMode) {
      setHoverLocationId(null);
      setPopoverPos({ x: 0, y: 0 });
    }
    return () => document.body.classList.remove(cls);
  }, [mapOnlyMode]);

  const selectedLocation = activeLocationId && getLocationById ? getLocationById(activeLocationId) : null;
  const hoverLocation = hoverLocationId && getLocationById ? getLocationById(hoverLocationId) : null;
  const getTasks = getTasksByLocation || (() => []);
  const getPlants = getPlantsByLocation || (() => []);

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
      el.style.pointerEvents = 'auto';
      if (location.color_token) {
        el.style.fill = location.color_token;
      }
      el.style.stroke = isActive || isHover ? '#2d5a27' : 'rgba(0,0,0,0.15)';
      el.style.strokeWidth = isActive || isHover ? '2' : '1';
    });
  }, [resolvedLocations, activeLocationId, hoverLocationId, svgIdFallbackMap]);

  return (
    <div className={stackedLayout ? 'garden-map garden-map--stacked' : 'garden-map'}>
      <div
        className="garden-map__svg-wrapper"
        onWheel={handleWheelZoom}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ transform: `rotate(${rotationDeg}deg)` }}
      >
        <div
          className="garden-map__asset"
          aria-label="정원 지도"
          // SVG 원본을 그대로 보여주기 (스케일 깨짐 방지)
          ref={svgHostRef}
          dangerouslySetInnerHTML={{ __html: gardenMapSvg }}
        />
      </div>

      <div className="garden-map__controls" aria-label="지도 도구">
        <div className="garden-map__toolbar" role="toolbar" aria-label="지도 도구">
          <div className="garden-map__toolbar-inner">
            {!mapOnlyMode ? (
              <label className="garden-map__select-wrap" aria-label="지도의 기준과 방향 선택">
                <select
                  className="garden-map__select"
                  value={orientationValue}
                  onChange={handleOrientationChange}
                >
                  {ORIENTATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {!mapOnlyMode ? (
              <button
                type="button"
                className="garden-map__icon-btn"
                onClick={handleZoomReset}
                disabled={zoom <= 1.00001}
                aria-label="축척 원래대로"
                title="축척 원래대로"
              >
                <Icon icon={refresh2Line} width={16} height={16} />
              </button>
            ) : null}

            <button
              type="button"
              className="garden-map__icon-btn"
              onClick={toggleMapOnlyMode}
              aria-label={mapOnlyMode ? '전체 UI 다시 표시' : '맵만 보기'}
              title={mapOnlyMode ? '전체 UI 다시 표시' : '맵만 보기'}
            >
              ⛶
            </button>
          </div>
        </div>
      </div>

      {!mapOnlyMode && hoverLocation ? (
        <Popover
          section={hoverLocation}
          tasks={getTasks(hoverLocation.id)}
          plants={getPlants(hoverLocation.id)}
          position={popoverPos}
          onOpenDrawer={() => {
            setActiveLocationId(hoverLocation.id);
            const loc = getLocationById ? getLocationById(hoverLocation.id) : null;
            if (loc) openLocationDetail(loc);
            setHoverLocationId(null);
          }}
        />
      ) : null}
    </div>
  );
}

