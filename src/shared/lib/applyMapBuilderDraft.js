import {
  createZone,
  deleteZone,
  fetchZones,
} from '@/shared/api/gardenApi';
import { colorTokenFromRaw } from '@/entities/zone/lib/notion-schema';
import { encodeDgMapDescription } from '@/shared/lib/dgMapZonePayload';
import { getMapBuilderLayer } from '@/shared/lib/mapBuilderLayers';
import { getShapeInspectorName } from '@/shared/lib/mapBuilderUserShapes';
import {
  loadMockGardenZones,
  saveMockGardenZones,
} from '@/shared/lib/mockGardenZonesStorage';
import {
  clearProjectMapBuilderDraft,
  loadProjectMapBuilderDraft,
} from '@/shared/lib/projectMapBuilderDraft';

const GARDEN_W = 1920;
const GARDEN_H = 1080;

function newSvgDomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `dgm_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `dgm_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function geomBBox(kind, geom) {
  if (!geom) return null;
  switch (kind) {
    case 'rect': {
      const { x, y, w, h } = geom;
      return { minX: x, minY: y, maxX: x + w, maxY: y + h };
    }
    case 'ellipse': {
      const { cx, cy, rx, ry } = geom;
      return { minX: cx - rx, minY: cy - ry, maxX: cx + rx, maxY: cy + ry };
    }
    case 'triangle':
    case 'polygon': {
      const pts = geom.points;
      if (!pts?.length) return null;
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    case 'polyline':
    case 'freepath': {
      const pts = geom.points;
      if (!pts?.length) return null;
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      return {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };
    }
    default:
      return null;
  }
}

function unionBoundsFromItems(items) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const it of items) {
    const b = geomBBox(it.kind, it.geom);
    if (!b) continue;
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  }
  if (!Number.isFinite(minX)) return null;
  const pad = 4;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  return { minX, minY, w, h };
}

function mapPt(x, y, bounds) {
  return {
    x: ((x - bounds.minX) / bounds.w) * GARDEN_W,
    y: ((y - bounds.minY) / bounds.h) * GARDEN_H,
  };
}

/** 스테이지 좌표 → 정원 지도 viewBox (0..1920 × 0..1080) */
function mapShapeToGarden(kind, geom, bounds) {
  const sx = GARDEN_W / bounds.w;
  const sy = GARDEN_H / bounds.h;

  switch (kind) {
    case 'rect': {
      const p = mapPt(geom.x, geom.y, bounds);
      return { kind: 'rect', geom: { x: p.x, y: p.y, w: geom.w * sx, h: geom.h * sy } };
    }
    case 'ellipse': {
      const c = mapPt(geom.cx, geom.cy, bounds);
      return {
        kind: 'ellipse',
        geom: { cx: c.x, cy: c.y, rx: geom.rx * sx, ry: geom.ry * sy },
      };
    }
    case 'triangle':
    case 'polygon': {
      const pts = (geom.points || []).map(([x, y]) => {
        const p = mapPt(x, y, bounds);
        return [p.x, p.y];
      });
      return { kind, geom: { points: pts } };
    }
    case 'polyline':
    case 'freepath': {
      const pts = (geom.points || []).map(([x, y]) => {
        const p = mapPt(x, y, bounds);
        return [p.x, p.y];
      });
      return { kind, geom: { points: pts } };
    }
    default:
      return null;
  }
}

function zoneLabelForItem(key, mapUserShapes) {
  if (key === 'base') {
    const layer = getMapBuilderLayer('base');
    return layer?.name || '기본 구역';
  }
  const preset = getMapBuilderLayer(key);
  if (preset) return preset.name;
  const shape = mapUserShapes.find((s) => s.id === key);
  return shape ? getShapeInspectorName(shape) : '구역';
}

/**
 * 드래프트에서 구역 후보만 모읍니다 (도형 유형이 zone 인 것).
 * @returns {{ key: string, name: string, kind: string, geom: object }[]}
 */
export function collectZoneItemsFromDraft(draft) {
  const mapPresentLayerIds = draft.mapPresentLayerIds || [];
  const mapLayerTypes = draft.mapLayerTypes || {};
  const mapUserShapes = draft.mapUserShapes || [];
  const stage = draft.stageSize || { w: 1000, h: 700 };
  const sw = Math.max(1, stage.w);
  const sh = Math.max(1, stage.h);

  const out = [];

  if (mapPresentLayerIds.includes('base') && mapLayerTypes.base === 'zone') {
    out.push({
      key: 'base',
      name: zoneLabelForItem('base', mapUserShapes),
      kind: 'rect',
      geom: { x: 80, y: 52, w: sw - 160, h: sh - 108 },
    });
  }

  for (const s of mapUserShapes) {
    if (mapLayerTypes[s.id] !== 'zone') continue;
    const k = s.kind;
    const g = s.geom;
    if (!g) continue;

    if (k === 'polyline' || k === 'freepath') {
      const pts = g.points;
      if (!pts?.length) continue;
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      if (maxX - minX < 2 && maxY - minY < 2) continue;
      out.push({
        key: s.id,
        name: zoneLabelForItem(s.id, mapUserShapes),
        kind: 'rect',
        geom: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
      });
      continue;
    }

    if (k === 'rect' || k === 'ellipse' || k === 'triangle' || k === 'polygon') {
      out.push({
        key: s.id,
        name: zoneLabelForItem(s.id, mapUserShapes),
        kind: k,
        geom: JSON.parse(JSON.stringify(g)),
      });
    }
  }

  return out;
}

/**
 * @returns {{ items: ReturnType<typeof collectZoneItemsFromDraft>, bounds: NonNullable<ReturnType<typeof unionBoundsFromItems>> }}
 */
function prepareMapBuilderDraftApply(projectId) {
  const draft = loadProjectMapBuilderDraft(projectId);
  if (!draft) {
    throw new Error('맵 빌더 데이터가 없어요. 맵·구역 단계에서 다시 저장하고 와 주세요.');
  }

  const items = collectZoneItemsFromDraft(draft);
  if (!items.length) {
    throw new Error('맵에 “구역” 유형으로 지정된 도형이 없어요. 맵 빌더에서 유형을 확인해 주세요.');
  }

  const bounds = unionBoundsFromItems(items);
  if (!bounds) {
    throw new Error('맵 도형 좌표를 계산하지 못했습니다.');
  }

  return { items, bounds };
}

/**
 * 개발 목 모드: Supabase에 garden_zones 테이블이 없으므로 sessionStorage에만 저장합니다.
 * @param {string|number} projectId
 * @returns {{ created: number }}
 */
export function applyMapBuilderDraftToMockStorage(projectId) {
  const { items, bounds } = prepareMapBuilderDraftApply(projectId);
  const existing = loadMockGardenZones(projectId);
  const kept = existing.filter((z) => !z.isDgMapBuilt);
  const colorLabel = '초록';
  const colorToken = colorTokenFromRaw(colorLabel);

  const newRows = [];
  for (const it of items) {
    const mapped = mapShapeToGarden(it.kind, it.geom, bounds);
    if (!mapped) continue;
    const svgId = newSvgDomId();
    newRows.push({
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: it.name,
      color_label: colorLabel,
      color_token: colorToken,
      svg_id: svgId,
      description: '',
      dgMapShape: mapped,
      isDgMapBuilt: true,
      taskCount: 0,
      plantCount: 0,
    });
  }

  if (!newRows.length) {
    throw new Error('저장할 구역이 없습니다.');
  }

  saveMockGardenZones(projectId, [...kept, ...newRows]);
  clearProjectMapBuilderDraft(projectId);
  return { created: newRows.length };
}

/**
 * @param {string|number} projectId
 * @returns {Promise<{ created: number }>}
 */
export async function applyMapBuilderDraftToGarden(projectId) {
  const { items, bounds } = prepareMapBuilderDraftApply(projectId);

  const existing = await fetchZones(projectId);
  for (const z of existing) {
    if (z.isDgMapBuilt && z.id) {
      await deleteZone(projectId, z.id);
    }
  }

  let created = 0;
  for (const it of items) {
    const mapped = mapShapeToGarden(it.kind, it.geom, bounds);
    if (!mapped) continue;
    const svgId = newSvgDomId();
    const desc = encodeDgMapDescription('', mapped);
    await createZone(projectId, {
      name: it.name,
      description: desc,
      color: '초록',
      svg_id: svgId,
    });
    created += 1;
  }

  clearProjectMapBuilderDraft(projectId);
  return { created };
}
