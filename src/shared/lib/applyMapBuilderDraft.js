import {
  createZone,
  deleteZone,
  fetchZones,
} from '@/shared/api/gardenApi';
import { colorTokenFromRaw } from '@/entities/zone/lib/notion-schema';
import { encodeDgMapDescription } from '@/shared/lib/dgMapZonePayload';
import { getMapBuilderLayer } from '@/shared/lib/mapBuilderLayers';
import { getLayerHitBoundsPx } from '@/shared/lib/mapBuilderLayerBounds';
import { getShapeInspectorName } from '@/shared/lib/mapBuilderUserShapes';
import {
  loadMockGardenZones,
  saveMockGardenZones,
} from '@/shared/lib/mockGardenZonesStorage';
import {
  loadProjectMapBuilderDraft,
} from '@/shared/lib/projectMapBuilderDraft';

const GARDEN_W = 1920;
const GARDEN_H = 1080;
const PRESET_RENDER_LAYER_IDS = ['house', 'shed'];
const MAP_DRAW_TYPES = new Set(['zone', 'path', 'building']);

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
  const sx = GARDEN_W / bounds.w;
  const sy = GARDEN_H / bounds.h;
  const s = Math.min(sx, sy);
  const ox = (GARDEN_W - bounds.w * s) / 2;
  const oy = (GARDEN_H - bounds.h * s) / 2;
  return {
    x: (x - bounds.minX) * s + ox,
    y: (y - bounds.minY) * s + oy,
  };
}

/** 스테이지 좌표 → 정원 지도 viewBox (0..1920 × 0..1080) */
function mapShapeToGarden(kind, geom, bounds) {
  const sx = GARDEN_W / bounds.w;
  const sy = GARDEN_H / bounds.h;
  const s = Math.min(sx, sy);

  switch (kind) {
    case 'rect': {
      const p = mapPt(geom.x, geom.y, bounds);
      return { kind: 'rect', geom: { x: p.x, y: p.y, w: geom.w * s, h: geom.h * s } };
    }
    case 'ellipse': {
      const c = mapPt(geom.cx, geom.cy, bounds);
      return {
        kind: 'ellipse',
        geom: { cx: c.x, cy: c.y, rx: geom.rx * s, ry: geom.ry * s },
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

function normalizeLayerType(type) {
  if (MAP_DRAW_TYPES.has(type)) return type;
  return 'zone';
}

function colorByType(type) {
  const t = normalizeLayerType(type);
  if (t === 'building') {
    return { label: '회색', token: '#9a9a9a' };
  }
  if (t === 'path') {
    return { label: '흰색', token: '#ffffff' };
  }
  return { label: '초록', token: '#2ecc71' };
}

function colorForItem(item) {
  if (item?.key === 'base') {
    return { label: '연두', token: '#c3dfb1' };
  }
  return colorByType(item?.layerType);
}

/**
 * 드래프트에서 맵에 표시할 도형 후보를 모읍니다.
 * - 기본 건축물: 집/창고
 * - 사용자 도형: zone 유형만
 * @returns {{ key: string, name: string, kind: string, geom: object, layerType: 'zone'|'path'|'building' }[]}
 */
export function collectZoneItemsFromDraft(draft) {
  const mapPresentLayerIds = draft.mapPresentLayerIds || [];
  const mapLayerTypes = draft.mapLayerTypes || {};
  const mapUserShapes = draft.mapUserShapes || [];
  const stage = draft.stageSize || { w: 1000, h: 700 };
  const mapSpaceSize = typeof draft.mapSpaceSize === 'string' ? draft.mapSpaceSize : 'medium';
  const sw = Math.max(1, stage.w);
  const sh = Math.max(1, stage.h);

  const out = [];
  if (mapPresentLayerIds.includes('base')) {
    const bounds = getLayerHitBoundsPx(sw, sh, 'base', { spaceSize: mapSpaceSize });
    if (bounds) {
      out.push({
        key: 'base',
        name: zoneLabelForItem('base', mapUserShapes),
        kind: 'rect',
        geom: { x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h },
        layerType: 'zone',
      });
    }
  }

  const presetIds = mapPresentLayerIds.filter((id) => PRESET_RENDER_LAYER_IDS.includes(id));
  for (const layerId of presetIds) {
    const layerType = normalizeLayerType(mapLayerTypes[layerId] ?? 'building');
    const bounds = getLayerHitBoundsPx(sw, sh, layerId, { spaceSize: mapSpaceSize });
    if (!bounds) continue;
    out.push({
      key: layerId,
      name: zoneLabelForItem(layerId, mapUserShapes),
      kind: 'rect',
      geom: { x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h },
      layerType,
    });
  }

  for (const s of mapUserShapes) {
    if (!MAP_DRAW_TYPES.has(mapLayerTypes[s.id])) continue;
    const layerType = normalizeLayerType(mapLayerTypes[s.id]);
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
        layerType,
      });
      continue;
    }

    if (k === 'rect' || k === 'ellipse' || k === 'triangle' || k === 'polygon') {
      out.push({
        key: s.id,
        name: zoneLabelForItem(s.id, mapUserShapes),
        kind: k,
        geom: JSON.parse(JSON.stringify(g)),
        layerType,
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
    throw new Error('저장할 맵 도형이 없어요. 집/창고 또는 구역 도형을 확인해 주세요.');
  }

  const stage = draft.stageSize || { w: 1000, h: 700 };
  const mapSpaceSize = typeof draft.mapSpaceSize === 'string' ? draft.mapSpaceSize : 'medium';
  const sw = Math.max(1, stage.w);
  const sh = Math.max(1, stage.h);
  const baseBounds = getLayerHitBoundsPx(sw, sh, 'base', { spaceSize: mapSpaceSize });
  const bounds = baseBounds
    ? { minX: baseBounds.x, minY: baseBounds.y, w: baseBounds.w, h: baseBounds.h }
    : unionBoundsFromItems(items);
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

  const newRows = [];
  for (const it of items) {
    const mapped = mapShapeToGarden(it.kind, it.geom, bounds);
    if (!mapped) continue;
    const mappedColor = colorForItem(it);
    const colorLabel = mappedColor.label;
    const colorToken = mappedColor.token || colorTokenFromRaw(colorLabel);
    const svgId = it.key === 'base' ? 'dg_base_zone' : newSvgDomId();
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
    throw new Error('저장할 맵 도형이 없습니다.');
  }

  saveMockGardenZones(projectId, [...kept, ...newRows]);
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
    const mappedColor = colorForItem(it);
    const svgId = it.key === 'base' ? 'dg_base_zone' : newSvgDomId();
    const desc = encodeDgMapDescription('', mapped);
    await createZone(projectId, {
      name: it.name,
      description: desc,
      color: mappedColor.label,
      svg_id: svgId,
    });
    created += 1;
  }

  return { created };
}
