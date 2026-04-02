import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useMapPanelLayout } from '@/app/providers/MapPanelLayoutContext';
import { useMapPanelDetail } from '@/app/providers/MapPanelDetailContext';
import {
  getMapViewPreference,
  subscribeMapViewPreference,
} from '@/shared/lib/mapViewPreferences';
import Popover from './Popover';
import './GardenMap.css';
import gardenMapSvg from '@/gardenMap.svg?raw';

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
  const { detail, openLocationDetail } = useMapPanelDetail();
  const [activeLocationId, setActiveLocationId] = useState(null);
  const [hoverLocationId, setHoverLocationId] = useState(null);
  const initialView = useMemo(() => getMapViewPreference(), []);
  const [mapBase, setMapBase] = useState(initialView.base); // road | house
  const [mapDirection, setMapDirection] = useState(initialView.direction); // vertical | horizontal
  const [zoom, setZoom] = useState(1); // 1 = 100% (최소)
  const [manualRotationDeg, setManualRotationDeg] = useState(0);
  const [svgReady, setSvgReady] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const svgHostRef = useRef(null);
  const svgViewBoxRef = useRef(null);
  const svgOriginalViewBoxRef = useRef(null);
  const panRef = useRef({ active: false, startX: 0, startY: 0, startVbX: 0, startVbY: 0 });
  const pinchRef = useRef({ active: false, startDistance: 0, startZoom: 1, startAngle: 0, startRotation: 0 });
  const rotateRef = useRef({ active: false, startX: 0, startRotation: 0 });

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

  const handleWheelZoom = useCallback(
    (e) => {
      e.preventDefault();
      if (e.shiftKey) {
        setManualRotationDeg((prev) => Number((prev - e.deltaY * 0.18).toFixed(2)));
        return;
      }
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

  const baseRotationDeg = useMemo(() => {
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
  const rotationDeg = baseRotationDeg + manualRotationDeg;

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
      setSvgReady(true);
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
      if (e.button === 2 || e.shiftKey) {
        rotateRef.current.active = true;
        rotateRef.current.startX = e.clientX;
        rotateRef.current.startRotation = manualRotationDeg;
        panRef.current.active = false;
        return;
      }
      if (zoom <= 1.00001 || e.button !== 0) return;
      const host = svgHostRef.current;
      const svg = host?.querySelector?.('svg');
      if (!svg || !svgViewBoxRef.current) return;
      panRef.current.active = true;
      panRef.current.startX = e.clientX;
      panRef.current.startY = e.clientY;
      panRef.current.startVbX = svgViewBoxRef.current.x;
      panRef.current.startVbY = svgViewBoxRef.current.y;
    },
    [zoom, manualRotationDeg]
  );

  const handlePanMove = useCallback(
    (e) => {
      if (rotateRef.current.active) {
        e.preventDefault();
        const deltaX = e.clientX - rotateRef.current.startX;
        setManualRotationDeg(Number((rotateRef.current.startRotation + deltaX * 0.35).toFixed(2)));
        return;
      }
      if (!panRef.current.active) return;
      e.preventDefault();
      applyPanFromClient(e.currentTarget, e.clientX, e.clientY);
    },
    [applyPanFromClient]
  );

  const handlePanEnd = useCallback(() => {
    panRef.current.active = false;
    rotateRef.current.active = false;
  }, []);

  const distanceBetweenTouches = useCallback((touchA, touchB) => {
    const dx = touchA.clientX - touchB.clientX;
    const dy = touchA.clientY - touchB.clientY;
    return Math.hypot(dx, dy);
  }, []);

  const angleBetweenTouches = useCallback((touchA, touchB) => {
    const dx = touchB.clientX - touchA.clientX;
    const dy = touchB.clientY - touchA.clientY;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }, []);

  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        pinchRef.current.active = true;
        pinchRef.current.startDistance = distanceBetweenTouches(e.touches[0], e.touches[1]);
        pinchRef.current.startZoom = zoom;
        pinchRef.current.startAngle = angleBetweenTouches(e.touches[0], e.touches[1]);
        pinchRef.current.startRotation = manualRotationDeg;
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
    [distanceBetweenTouches, angleBetweenTouches, zoom, manualRotationDeg]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 2 && pinchRef.current.active) {
        e.preventDefault();
        const dist = distanceBetweenTouches(e.touches[0], e.touches[1]);
        const ratio = pinchRef.current.startDistance > 0 ? dist / pinchRef.current.startDistance : 1;
        const next = clampZoom(Number((pinchRef.current.startZoom * ratio).toFixed(2)));
        const nextAngle = angleBetweenTouches(e.touches[0], e.touches[1]);
        let deltaAngle = nextAngle - pinchRef.current.startAngle;
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        setZoom(next);
        setManualRotationDeg(Number((pinchRef.current.startRotation + deltaAngle).toFixed(2)));
        return;
      }
      if (e.touches.length === 1 && panRef.current.active) {
        e.preventDefault();
        applyPanFromClient(e.currentTarget, e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [applyPanFromClient, clampZoom, distanceBetweenTouches, angleBetweenTouches]
  );

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) pinchRef.current.active = false;
    if (e.touches.length === 0) panRef.current.active = false;
  }, []);

  useEffect(() => {
    return subscribeMapViewPreference((next) => {
      setMapBase(next.base);
      setMapDirection(next.direction);
    });
  }, []);

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

  const getTargetEl = useCallback((svg, svgId) => {
    if (!svgId || !svg) return null;
    const direct = svg.querySelector(`#${svgId}`);
    if (direct) return direct;
    const fallback = svgIdFallbackMap[svgId];
    if (fallback) return svg.querySelector(`#${fallback}`);
    return null;
  }, [svgIdFallbackMap]);

  const focusedLocationIds = useMemo(() => {
    if (!detail) return [];
    if (detail.type === 'location') return detail.location?.id ? [detail.location.id] : [];
    if (detail.type === 'task') {
      if (detail.task?.section_id) return [detail.task.section_id];
      return detail.task?.target_location_ids || [];
    }
    if (detail.type === 'plant') {
      if (detail.plant?.section_id) return [detail.plant.section_id];
      return detail.plant?.location_ids || [];
    }
    return [];
  }, [detail]);

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

    // 이벤트 바인딩 + 기본 스타일 적용
    resolvedLocations.forEach((location) => {
      const svgId = resolveSvgId(location.resolved_svg_id);
      const el = getTargetEl(svg, svgId);
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
  }, [resolvedLocations, getTargetEl, handleLocationClick, handleLocationHover]);

  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) return;
    const svg = host.querySelector('svg');
    if (!svg) return;

    const focusedIdSet = new Set(focusedLocationIds);
    const hasFocusedTarget = focusedIdSet.size > 0;

    resolvedLocations.forEach((location) => {
      const el = getTargetEl(svg, location.resolved_svg_id);
      if (!el) return;

      const isActive = activeLocationId === location.id;
      const isHover = hoverLocationId === location.id;
      const isFocused = focusedIdSet.has(location.id);
      el.style.opacity = hasFocusedTarget && !isFocused ? '0.72' : '1';
      el.style.fillOpacity = '1';
      el.style.pointerEvents = 'auto';
      if (location.color_token) {
        el.style.fill = location.color_token;
      }
      el.style.stroke = isFocused || isActive || isHover ? '#2d5a27' : 'rgba(0,0,0,0.15)';
      el.style.strokeWidth = isFocused ? '3.5' : isActive || isHover ? '2' : '1';
      el.style.filter = isFocused ? 'drop-shadow(0 0 10px rgba(45, 90, 39, 0.28))' : 'none';
    });
  }, [resolvedLocations, activeLocationId, hoverLocationId, focusedLocationIds, getTargetEl]);

  // 할 일이 있는 구역(taskCount > 0)에 지도 배지(빨간 점) 표시
  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) return;
    const svg = host.querySelector('svg');
    if (!svg) return;

    const NS = 'http://www.w3.org/2000/svg';
    const layerId = 'map-task-badge-layer';

    const prevLayer = svg.querySelector(`#${layerId}`);
    if (prevLayer) prevLayer.remove();

    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('id', layerId);
    layer.setAttribute('pointer-events', 'none');

    resolvedLocations.forEach((location) => {
      const pendingTasks = Number(location.taskCount || 0);
      if (pendingTasks <= 0) return;

      const target = getTargetEl(svg, location.resolved_svg_id);
      if (!target || typeof target.getBBox !== 'function') return;

      const box = target.getBBox();
      if (!Number.isFinite(box?.x) || !Number.isFinite(box?.y)) return;

      // 도형 우상단 근처(살짝 바깥)에 배지 점 배치
      const cx = box.x + box.width + 5;
      const cy = box.y - 5;
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', String(cx));
      dot.setAttribute('cy', String(cy));
      dot.setAttribute('r', '6');
      dot.setAttribute('fill', '#e53935');
      dot.setAttribute('stroke', '#ffffff');
      dot.setAttribute('stroke-width', '2');
      dot.setAttribute('opacity', '0.96');

      layer.appendChild(dot);
    });

    svg.appendChild(layer);
    return () => layer.remove();
  }, [resolvedLocations, getTargetEl]);

  useEffect(() => {
    if (!focusedLocationIds.length) return;
    const host = svgHostRef.current;
    const svg = host?.querySelector?.('svg');
    const orig = svgOriginalViewBoxRef.current;
    if (!svg || !orig) return;

    const focusedLocations = resolvedLocations.filter((location) => focusedLocationIds.includes(location.id));
    const boxes = focusedLocations
      .map((location) => getTargetEl(svg, location.resolved_svg_id))
      .filter(Boolean)
      .map((el) => {
        try {
          return el.getBBox();
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (!boxes.length) return;

    const bounds = boxes.reduce(
      (acc, box) => ({
        minX: Math.min(acc.minX, box.x),
        minY: Math.min(acc.minY, box.y),
        maxX: Math.max(acc.maxX, box.x + box.width),
        maxY: Math.max(acc.maxY, box.y + box.height),
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const padding = 48;
    const targetW = Math.min(orig.w, Math.max(220, bounds.maxX - bounds.minX + padding * 2));
    const targetH = Math.min(orig.h, Math.max(180, bounds.maxY - bounds.minY + padding * 2));
    const next = clampViewBox({
      x: bounds.minX - padding,
      y: bounds.minY - padding,
      w: targetW,
      h: targetH,
    });
    svgViewBoxRef.current = next;
    svg.setAttribute('viewBox', `${next.x} ${next.y} ${next.w} ${next.h}`);
    const nextZoom = clampZoom(Number((orig.w / next.w).toFixed(2)));
    setZoom(nextZoom);
  }, [focusedLocationIds, resolvedLocations, getTargetEl, clampViewBox, clampZoom, svgReady]);

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
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={() => {
          setZoom(1);
          setManualRotationDeg(0);
        }}
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

      {hoverLocation ? (
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

