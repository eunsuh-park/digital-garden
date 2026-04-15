import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@iconify/react';
import delete2Fill from '@iconify-icons/mingcute/delete-2-fill';
import eye2Line from '@iconify-icons/mingcute/eye-2-line';
import eyeCloseLine from '@iconify-icons/mingcute/eye-close-line';
import lockLine from '@iconify-icons/mingcute/lock-line';
import unlockLine from '@iconify-icons/mingcute/unlock-line';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import {
  getMapBuilderLayer,
  mapBuilderRemoveConfirmMessage,
  MAP_BUILDER_LAYERS,
  sortLayersByMapOrder,
  SHAPE_TYPES,
  SHAPE_TYPE_LABELS,
} from '@/shared/lib/mapBuilderLayers';
import {
  inspectorLayerFromUserShape,
  userShapeDisplayName,
} from '@/shared/lib/mapBuilderUserShapes';
import './MapBuilderInspector.css';

function mergeLayerLocked(layer, mapLayerLocked) {
  if (!layer) return null;
  const locked = mapLayerLocked[layer.id] !== undefined ? mapLayerLocked[layer.id] : layer.locked;
  return { ...layer, locked };
}

function LayerDetailPane({ layer, userShape, onUserShapePatch, onDeleteLayer, layerType, onTypeChange }) {
  if (!layer) return null;
  const isUser = !!layer.isUserShape && userShape;
  return (
    <div className="map-builder-inspector__layer-panel map-builder-inspector__layer-panel--full">
      <div className="map-builder-inspector__inline-field-row map-builder-inspector__inline-field-row--wrap">
        <label className="map-builder-inspector__inline-label" htmlFor={`mb-split-size-${layer.id}`}>
          크기
        </label>
        <input
          id={`mb-split-size-${layer.id}`}
          type="text"
          className="map-builder-inspector__mini-field map-builder-inspector__mini-field--grow"
          defaultValue={layer.size}
          readOnly={isUser}
          title={isUser ? '그린 도형은 크기를 여기서 바꾸지 않습니다' : undefined}
        />
        <label className="map-builder-inspector__inline-label" htmlFor={`mb-split-rot-${layer.id}`}>
          회전
        </label>
        <input
          id={`mb-split-rot-${layer.id}`}
          type="text"
          className="map-builder-inspector__mini-field map-builder-inspector__mini-field--grow"
          defaultValue={layer.rotation}
          readOnly={isUser}
          title={isUser ? '그린 도형은 회전을 여기서 바꾸지 않습니다' : undefined}
        />
      </div>
      {isUser ? (
        <div className="map-builder-inspector__inline-field-row map-builder-inspector__inline-field-row--stack">
          <label className="map-builder-inspector__inline-field-label" htmlFor={`mb-split-name-${layer.id}`}>
            이름
          </label>
          <input
            id={`mb-split-name-${layer.id}`}
            type="text"
            className="map-builder-inspector__text-field"
            value={userShape.label ?? ''}
            placeholder={userShapeDisplayName(userShape)}
            onChange={(e) => onUserShapePatch({ label: e.target.value })}
            autoComplete="off"
          />
        </div>
      ) : (
        <div className="map-builder-inspector__inline-field-row">
          <span className="map-builder-inspector__inline-field-label">이름</span>
          <div className="map-builder-inspector__inline-value">{layer.name}</div>
        </div>
      )}
      {isUser ? (
        <div className="map-builder-inspector__inline-field-row map-builder-inspector__inline-field-row--stack">
          <label className="map-builder-inspector__inline-field-label" htmlFor={`mb-split-desc-${layer.id}`}>
            설명
          </label>
          <textarea
            id={`mb-split-desc-${layer.id}`}
            className="map-builder-inspector__text-area"
            value={userShape.description ?? ''}
            placeholder="설명을 입력할 수 있어요."
            rows={3}
            onChange={(e) => onUserShapePatch({ description: e.target.value })}
          />
        </div>
      ) : (
        <div className="map-builder-inspector__inline-field-row">
          <span className="map-builder-inspector__inline-field-label">설명</span>
          <div className="map-builder-inspector__inline-value">{layer.desc}</div>
        </div>
      )}
      <div className="map-builder-inspector__inline-field-row">
        <label
          className="map-builder-inspector__inline-field-label"
          htmlFor={`mb-split-type-${layer.id}`}
        >
          유형
        </label>
        <select
          id={`mb-split-type-${layer.id}`}
          className={[
            'map-builder-inspector__type-select',
            !layerType ? 'map-builder-inspector__type-select--unset' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          value={layerType ?? ''}
          onChange={(e) => onTypeChange(e.target.value || null)}
        >
          <option value="">유형 선택…</option>
          {SHAPE_TYPES.map((t) => (
            <option key={t} value={t}>
              {SHAPE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="map-builder-inspector__actions-row">
        {layer.deletable ? (
          <button
            type="button"
            className="map-builder-inspector__danger-icon"
            aria-label="요소 삭제"
            onClick={() => onDeleteLayer(layer)}
          >
            <Icon icon={delete2Fill} width={20} height={20} aria-hidden />
          </button>
        ) : (
          <span className="map-builder-inspector__danger-placeholder" aria-hidden />
        )}
        <button type="button" className="map-builder-inspector__save">
          확인
        </button>
      </div>
    </div>
  );
}

/**
 * 맵 빌더 전용 우측 패널 본문 — MapSidePanel 안에서만 사용.
 */
export default function MapBuilderInspector() {
  const {
    selectedMapLayerId,
    setSelectedMapLayerId,
    mapLayerDetailOpenId,
    setMapLayerDetailOpenId,
    mapPresentLayerIds,
    mapLayerLocked,
    mapLayerTypes,
    setMapLayerType,
    mapUserShapes,
    updateMapUserShape,
    removeMapPresentLayer,
    removeMapUserShape,
    toggleMapLayerLock,
  } = useProjectNewMapBuilderUi();

  const visibleLayers = useMemo(() => {
    const staticLayers = sortLayersByMapOrder(
      MAP_BUILDER_LAYERS.filter((l) => l.id !== 'base' && mapPresentLayerIds.includes(l.id)),
    );
    const userLayers = mapUserShapes.map((s) => inspectorLayerFromUserShape(s));
    return [...staticLayers, ...userLayers];
  }, [mapPresentLayerIds, mapUserShapes]);

  const confirmAndRemoveLayer = useCallback(
    (layer) => {
      if (layer.isUserShape) {
        if (!window.confirm('이 도형을 삭제할까요?')) return;
        removeMapUserShape(layer.id);
        return;
      }
      const msg = mapBuilderRemoveConfirmMessage(layer, mapLayerLocked);
      if (!msg) return;
      if (!window.confirm(msg)) return;
      removeMapPresentLayer(layer.id);
    },
    [mapLayerLocked, removeMapPresentLayer, removeMapUserShape],
  );

  const cardRefs = useRef({});
  const stripRefs = useRef({});

  useEffect(() => {
    if (!selectedMapLayerId) return;
    const desktopEl = cardRefs.current[selectedMapLayerId];
    const stripEl = stripRefs.current[selectedMapLayerId];
    (desktopEl ?? stripEl)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedMapLayerId]);

  function onDesktopLayerRowClick(layerId) {
    setSelectedMapLayerId(layerId);
    setMapLayerDetailOpenId((prev) => (prev === layerId ? null : layerId));
  }

  function onNarrowStripClick(layerId) {
    setSelectedMapLayerId(layerId);
  }

  const selectedLayer = useMemo(() => {
    if (!selectedMapLayerId) return null;
    if (selectedMapLayerId === 'base') return null;
    const builtIn = getMapBuilderLayer(selectedMapLayerId);
    if (builtIn) return builtIn;
    const userShape = mapUserShapes.find((s) => s.id === selectedMapLayerId);
    return userShape ? inspectorLayerFromUserShape(userShape) : null;
  }, [mapUserShapes, selectedMapLayerId]);

  const selectedUserShape = useMemo(
    () => mapUserShapes.find((s) => s.id === selectedMapLayerId) ?? null,
    [mapUserShapes, selectedMapLayerId],
  );

  return (
    <div className="map-builder-inspector">
      {/* 모바일·태블릿 (<1024px): 좌(상) 스트립 + 우(하) 상세 */}
      <div className="map-builder-inspector__narrow">
        <div className="map-builder-inspector__strip">
          <div className="map-builder-inspector__section-title">레이어</div>
          <ul className="map-builder-inspector__strip-list" role="list">
            {visibleLayers.map((layer) => {
              const merged = mergeLayerLocked(layer, mapLayerLocked);
              const selected = selectedMapLayerId === layer.id;
              const layerType = mapLayerTypes[layer.id] ?? null;
              return (
                <li key={layer.id}>
                  <div
                    className={[
                      'map-builder-inspector__strip-row',
                      selected ? 'map-builder-inspector__strip-row--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) stripRefs.current[layer.id] = el;
                        else delete stripRefs.current[layer.id];
                      }}
                      className="map-builder-inspector__strip-row-body"
                      aria-pressed={selected}
                      onClick={() => onNarrowStripClick(layer.id)}
                    >
                      <span className="map-builder-inspector__strip-ico" aria-hidden>
                        <Icon
                          icon={merged.hidden ? eyeCloseLine : eye2Line}
                          width={18}
                          height={18}
                        />
                      </span>
                      <span className="map-builder-inspector__strip-text">
                        <span className="map-builder-inspector__strip-name">{layer.name}</span>
                        <span className="map-builder-inspector__strip-type">
                          {layerType ? SHAPE_TYPE_LABELS[layerType] : layer.meta}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="map-builder-inspector__strip-lock"
                      aria-label={merged.locked ? '잠금 해제' : '잠금'}
                      title={merged.locked ? '잠금 해제' : '잠금'}
                      onClick={() => toggleMapLayerLock(layer.id)}
                    >
                      <Icon icon={merged.locked ? lockLine : unlockLine} width={18} height={18} aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="map-builder-inspector__pane">
          {selectedLayer ? (
            <div className="map-builder-inspector__pane-inner">
              <LayerDetailPane
                layer={selectedLayer}
                userShape={selectedLayer.isUserShape ? selectedUserShape : null}
                onUserShapePatch={(patch) => {
                  if (selectedUserShape) updateMapUserShape(selectedUserShape.id, patch);
                }}
                onDeleteLayer={confirmAndRemoveLayer}
                layerType={mapLayerTypes[selectedLayer.id] ?? null}
                onTypeChange={(type) => setMapLayerType(selectedLayer.id, type)}
              />
            </div>
          ) : (
            <div className="map-builder-inspector__pane-empty">선택된 오브젝트가 없습니다</div>
          )}
        </div>
      </div>

      {/* 데스크톱 (≥1024px): 기존 카드 + 아코디언 */}
      <div className="map-builder-inspector__desktop">
        <div className="map-builder-inspector__scroll">
          <div className="map-builder-inspector__section-title">레이어</div>
          <div className="map-builder-inspector__layer-list">
            {visibleLayers.map((layer) => {
              const merged = mergeLayerLocked(layer, mapLayerLocked);
              const open = mapLayerDetailOpenId === layer.id;
              const selected = selectedMapLayerId === layer.id;
              const layerType = mapLayerTypes[layer.id] ?? null;
              const rowUserShape = layer.isUserShape
                ? mapUserShapes.find((s) => s.id === layer.id)
                : null;
              return (
                <div
                  key={layer.id}
                  ref={(el) => {
                    if (el) cardRefs.current[layer.id] = el;
                    else delete cardRefs.current[layer.id];
                  }}
                  className={[
                    'map-builder-inspector__layer-card',
                    selected ? 'map-builder-inspector__layer-card--selected' : '',
                    open ? 'map-builder-inspector__layer-card--open' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="map-builder-inspector__layer-top">
                    <span className="map-builder-inspector__layer-ico" aria-hidden>
                      <Icon icon={merged.hidden ? eyeCloseLine : eye2Line} width={18} height={18} />
                    </span>
                    <button
                      type="button"
                      className="map-builder-inspector__layer-toggle"
                      onClick={() => onDesktopLayerRowClick(layer.id)}
                      aria-expanded={open}
                      aria-pressed={selected}
                    >
                      <span className="map-builder-inspector__layer-main">
                        <strong className="map-builder-inspector__layer-name">{layer.name}</strong>
                        <span className="map-builder-inspector__layer-meta">
                          {layerType ? SHAPE_TYPE_LABELS[layerType] : layer.meta}
                        </span>
                        {open ? (
                          <>
                            <label className="map-builder-inspector__inline-label" htmlFor={`mb-size-${layer.id}`}>
                              크기
                            </label>
                            <input
                              id={`mb-size-${layer.id}`}
                              type="text"
                              className="map-builder-inspector__mini-field"
                              defaultValue={layer.size}
                              readOnly={!!layer.isUserShape}
                              title={layer.isUserShape ? '그린 도형은 크기를 여기서 바꾸지 않습니다' : undefined}
                            />
                            <label className="map-builder-inspector__inline-label" htmlFor={`mb-rot-${layer.id}`}>
                              회전
                            </label>
                            <input
                              id={`mb-rot-${layer.id}`}
                              type="text"
                              className="map-builder-inspector__mini-field"
                              defaultValue={layer.rotation}
                              readOnly={!!layer.isUserShape}
                              title={layer.isUserShape ? '그린 도형은 회전을 여기서 바꾸지 않습니다' : undefined}
                            />
                          </>
                        ) : null}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="map-builder-inspector__layer-ico map-builder-inspector__layer-lock-btn"
                      aria-label={merged.locked ? '잠금 해제' : '잠금'}
                      title={merged.locked ? '잠금 해제' : '잠금'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMapLayerLock(layer.id);
                      }}
                    >
                      <Icon icon={merged.locked ? lockLine : unlockLine} width={18} height={18} aria-hidden />
                    </button>
                    <span
                      className={[
                        'map-builder-inspector__dot',
                        selected ? '' : 'map-builder-inspector__dot--muted',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  </div>

                  {open ? (
                    <div className="map-builder-inspector__layer-panel">
                      {rowUserShape ? (
                        <div className="map-builder-inspector__inline-field-row map-builder-inspector__inline-field-row--stack">
                          <label
                            className="map-builder-inspector__inline-field-label"
                            htmlFor={`mb-name-${layer.id}`}
                          >
                            이름
                          </label>
                          <input
                            id={`mb-name-${layer.id}`}
                            type="text"
                            className="map-builder-inspector__text-field"
                            value={rowUserShape.label ?? ''}
                            placeholder={userShapeDisplayName(rowUserShape)}
                            onChange={(e) => updateMapUserShape(layer.id, { label: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            autoComplete="off"
                          />
                        </div>
                      ) : (
                        <div className="map-builder-inspector__inline-field-row">
                          <span className="map-builder-inspector__inline-field-label">이름</span>
                          <div className="map-builder-inspector__inline-value">{layer.name}</div>
                        </div>
                      )}
                      {rowUserShape ? (
                        <div className="map-builder-inspector__inline-field-row map-builder-inspector__inline-field-row--stack">
                          <label
                            className="map-builder-inspector__inline-field-label"
                            htmlFor={`mb-desc-${layer.id}`}
                          >
                            설명
                          </label>
                          <textarea
                            id={`mb-desc-${layer.id}`}
                            className="map-builder-inspector__text-area"
                            value={rowUserShape.description ?? ''}
                            placeholder="설명을 입력할 수 있어요."
                            rows={3}
                            onChange={(e) => updateMapUserShape(layer.id, { description: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : (
                        <div className="map-builder-inspector__inline-field-row">
                          <span className="map-builder-inspector__inline-field-label">설명</span>
                          <div className="map-builder-inspector__inline-value">{layer.desc}</div>
                        </div>
                      )}
                      <div className="map-builder-inspector__inline-field-row">
                        <label
                          className="map-builder-inspector__inline-field-label"
                          htmlFor={`mb-type-${layer.id}`}
                        >
                          유형
                        </label>
                        <select
                          id={`mb-type-${layer.id}`}
                          className={[
                            'map-builder-inspector__type-select',
                            !layerType ? 'map-builder-inspector__type-select--unset' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          value={layerType ?? ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setMapLayerType(layer.id, e.target.value || null)}
                        >
                          <option value="">유형 선택…</option>
                          {SHAPE_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {SHAPE_TYPE_LABELS[t]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="map-builder-inspector__actions-row">
                        {layer.deletable ? (
                          <button
                            type="button"
                            className="map-builder-inspector__danger-icon"
                            aria-label="요소 삭제"
                            onClick={() => confirmAndRemoveLayer(layer)}
                          >
                            <Icon icon={delete2Fill} width={20} height={20} aria-hidden />
                          </button>
                        ) : (
                          <span className="map-builder-inspector__danger-placeholder" aria-hidden />
                        )}
                        <button type="button" className="map-builder-inspector__save">
                          확인
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
