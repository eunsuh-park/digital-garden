import { useEffect, useRef } from 'react';
import gardenMapSvg from '../../gardenMap.svg?raw';

function resolveSvgIds(raw) {
  const v = (raw || '').trim();
  if (!v) return [];
  return v
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Locations 카드용 지도 썸네일
 * - location.svg_id에 해당하는 도형만 color_token으로 하이라이트
 */
export default function LocationMapThumb({ svgId, colorToken }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const svg = host.querySelector('svg');
    if (!svg) return;

    // 전체를 은은하게 만들고(지도 형태 유지), 대상만 강조
    const allShapes = svg.querySelectorAll('path, rect, polygon, circle, ellipse, line, polyline');
    allShapes.forEach((el) => {
      el.style.opacity = '0.18';
    });

    const ids = resolveSvgIds(svgId);
    ids.forEach((id) => {
      const el = svg.querySelector(`#${id}`);
      if (!el) return;
      el.style.opacity = '1';
      if (colorToken) {
        el.style.setProperty('fill', colorToken, 'important');
      }
      el.style.setProperty('stroke', 'rgba(0,0,0,0.2)', 'important');
      el.style.setProperty('stroke-width', '1', 'important');
    });
  }, [svgId, colorToken]);

  return (
    <div className="locations-page__thumb" aria-hidden ref={hostRef} dangerouslySetInnerHTML={{ __html: gardenMapSvg }} />
  );
}

