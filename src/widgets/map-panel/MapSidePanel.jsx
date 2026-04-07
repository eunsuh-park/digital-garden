import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useMatch } from 'react-router-dom';
import { Icon } from '@iconify/react';
import up from '@iconify-icons/mingcute/arrow-up-line';
import down from '@iconify-icons/mingcute/arrow-down-line';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import arrowRightLine from '@iconify-icons/mingcute/arrow-right-line';
import { useZones } from '@/app/providers/ZonesContext';
import { useMapPanelDetail } from '@/app/providers/MapPanelDetailContext';
import { useToast } from '@/app/providers/ToastContext';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import { groupZonesByColor, labelForColorGroup } from '@/shared/lib/zonesGroup';
import {
  getMapBuilderMode,
  setMapBuilderMode,
  subscribeMapBuilderMode,
} from '@/shared/lib/mapBuilderMode';
import TaskListView from '@/features/task-list/TaskListView';
import PlantListView from '@/features/plant-list/PlantListView';
import {
  MapPanelZoneDetail,
  MapPanelZoneCreate,
  MapPanelPlantDetail,
  MapPanelPlantCreate,
  MapPanelTaskCreate,
  MapPanelTaskDetail,
} from './MapPanelDetailViews';
import MapBuilderInspector from '@/widgets/map-builder/MapBuilderInspector';
import './MapSidePanel.css';

function ZoneTabContent() {
  const { zones, loading, error } = useZones();
  const { openZoneDetail } = useMapPanelDetail();
  const [expandedColors, setExpandedColors] = useState(() => new Set());

  const groups = useMemo(() => groupZonesByColor(zones), [zones]);

  const toggleColor = (color) => {
    setExpandedColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  };

  if (loading) {
    return <p className="map-side-panel__hint">구역을 불러오는 중…</p>;
  }

  if (error) {
    return <p className="map-side-panel__hint map-side-panel__hint--error">{error}</p>;
  }

  if (!zones.length) {
    return <p className="map-side-panel__hint">등록된 구역이 없습니다.</p>;
  }

  return (
    <ul className="map-side-panel__list" role="list">
      {groups.map(({ color, items }) => {
        const label = labelForColorGroup(items);
        const count = items.length;
        const expanded = expandedColors.has(color);

        return (
          <li key={color} className="map-side-panel__list-item">
            <button
              type="button"
              className="map-side-panel__row"
              onClick={() => toggleColor(color)}
              aria-expanded={expanded}
            >
              <span className="map-side-panel__dot" style={{ background: color }} aria-hidden />
              <span className="map-side-panel__row-label">{label}</span>
              <span className="map-side-panel__row-count">{count}</span>
              <Icon
                icon={expanded ? up : down}
                width={16}
                height={16}
                className="map-side-panel__row-chevron"
                aria-hidden
              />
            </button>
            {expanded && (
              <ul className="map-side-panel__sublist">
                {items.map((z) => (
                  <li key={z.id} className="map-side-panel__subitem">
                    <button
                      type="button"
                      className="map-side-panel__subitem-btn"
                      onClick={() => openZoneDetail(z)}
                    >
                      <span className="map-side-panel__subitem-name">{z.name}</span>
                      {z.color_label ? (
                        <span className="map-side-panel__subitem-meta">{z.color_label}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function MapSidePanel({ collapsed, onToggleCollapsed }) {
  const { pathname } = useLocation();
  const projectMatch = useMatch({ path: '/project/:projectId', end: true });
  const projectIdParam = projectMatch?.params?.projectId;
  const isProjectOpen = Boolean(projectIdParam && projectIdParam !== 'new');
  const { zones, tasks, plants, loading } = useZones();
  const { detail, closeDetail, closeAllDetail } = useMapPanelDetail();
  const { showToast } = useToast();
  const { mapBuilderOpen } = useProjectNewMapBuilderUi();
  const [mapBuilderMode, setMapBuilderModeState] = useState(() => getMapBuilderMode());

  useEffect(() => {
    closeAllDetail();
  }, [pathname, closeAllDetail]);

  useEffect(() => {
    if (mapBuilderOpen) closeAllDetail();
  }, [mapBuilderOpen, closeAllDetail]);

  useEffect(() => {
    return subscribeMapBuilderMode(setMapBuilderModeState);
  }, []);

  const zoneMap = useMemo(() => Object.fromEntries(zones.map((z) => [z.id, z])), [zones]);
  const plantMap = useMemo(() => Object.fromEntries(plants.map((p) => [p.id, p])), [plants]);
  const taskTitleMap = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t.title])), [tasks]);

  const tabFromPath =
    pathname.startsWith('/tasks') ? 'tasks' : pathname.startsWith('/plants') ? 'plants' : 'zone';

  const pendingTasksCount = useMemo(
    () => tasks.filter((t) => t.status !== 'completed').length,
    [tasks]
  );

  const zoneTotal = loading ? '…' : String(zones.length);
  const tasksCountLabel = loading ? '…' : String(pendingTasksCount);
  const plantsCountLabel = loading ? '…' : String(plants.length);

  const collapsedVisual = collapsed && !detail;
  const asideClass = [
    'map-side-panel',
    !isProjectOpen ? 'map-side-panel--inactive' : '',
    collapsedVisual ? 'map-side-panel--collapsed' : '',
    detail ? 'map-side-panel--detail-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const ariaLabel = mapBuilderOpen ? '맵 빌더 패널' : '구역·할 일·식물 패널';

  return (
    <aside
      className={asideClass}
      aria-label={ariaLabel}
      aria-hidden={!isProjectOpen}
    >
      {!detail && (
        <button
          type="button"
          className="map-side-panel__handle"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? '패널 펼치기' : '패널 접기'}
        >
          <span className="map-side-panel__handle-icons" aria-hidden>
            <span className="map-side-panel__handle-icon map-side-panel__handle-icon--desktop">
              <Icon icon={collapsed ? arrowRightLine : arrowLeftLine} width={14} height={14} />
            </span>
            <span className="map-side-panel__handle-icon map-side-panel__handle-icon--mobile">
              <Icon icon={collapsed ? up : down} width={14} height={14} />
            </span>
          </span>
        </button>
      )}

      <div
        className="map-side-panel__surface"
        aria-hidden={collapsedVisual ? true : undefined}
      >
        {mapBuilderOpen ? (
          <div className="map-side-panel__body map-side-panel__body--map-builder">
            <MapBuilderInspector />
          </div>
        ) : (
          <>
        {!detail && (
          <div className="map-side-panel__tabs" role="tablist" aria-label="보기 전환">
            <NavLink
              to="/"
              end
              role="tab"
              aria-selected={tabFromPath === 'zone'}
              className={({ isActive }) =>
                `map-side-panel__tab ${isActive ? 'map-side-panel__tab--active' : ''}`
              }
            >
              Zone{' '}
              <span className="map-side-panel__tab-count">({zoneTotal})</span>
            </NavLink>
            <NavLink
              to="/tasks"
              role="tab"
              aria-selected={tabFromPath === 'tasks'}
              className={({ isActive }) =>
                `map-side-panel__tab ${isActive ? 'map-side-panel__tab--active' : ''}`
              }
            >
              Tasks <span className="map-side-panel__tab-count">({tasksCountLabel})</span>
            </NavLink>
            <NavLink
              to="/plants"
              role="tab"
              aria-selected={tabFromPath === 'plants'}
              className={({ isActive }) =>
                `map-side-panel__tab ${isActive ? 'map-side-panel__tab--active' : ''}`
              }
            >
              Plants <span className="map-side-panel__tab-count">({plantsCountLabel})</span>
            </NavLink>
          </div>
        )}

        <div
          className={`map-side-panel__body ${detail ? 'map-side-panel__body--detail' : ''}`}
          role="tabpanel"
        >
          {detail?.type === 'zone' && (
            <MapPanelZoneDetail zone={detail.zone} onBack={closeDetail} />
          )}
          {detail?.type === 'zone-create' && <MapPanelZoneCreate onBack={closeDetail} />}
          {detail?.type === 'task-create' && <MapPanelTaskCreate onBack={closeDetail} />}
          {detail?.type === 'plant-create' && <MapPanelPlantCreate onBack={closeDetail} />}
          {detail?.type === 'task' && (
            <MapPanelTaskDetail
              task={detail.task}
              onBack={closeDetail}
              zoneMap={zoneMap}
              plantMap={plantMap}
              taskTitleMap={taskTitleMap}
            />
          )}
          {detail?.type === 'plant' && (
            <MapPanelPlantDetail
              plant={detail.plant}
              onBack={closeDetail}
              zoneMap={zoneMap}
            />
          )}
          {!detail && tabFromPath === 'zone' && (
            <div className="map-side-panel__zone-host">
              <div className="map-side-panel__zone-scroll">
                <ZoneTabContent />
              </div>
              <div className="map-side-panel__zone-footer">
                <button
                  type="button"
                  className={`map-side-panel__add-btn ${mapBuilderMode ? 'map-side-panel__add-btn--active' : ''}`}
                  onClick={() => {
                    const next = setMapBuilderMode(!mapBuilderMode);
                    setMapBuilderModeState(next);
                    showToast(next ? '맵 빌더 모드로 전환했습니다.' : '기본 탐색 모드로 돌아왔습니다.');
                  }}
                >
                  {mapBuilderMode ? '맵 빌더 모드 사용 중' : '맵 빌더 모드로 전환'}
                </button>
              </div>
            </div>
          )}
          {tabFromPath === 'tasks' && (
            <div
              className={
                detail
                  ? 'map-side-panel__page-host map-side-panel__page-host--hidden'
                  : 'map-side-panel__page-host'
              }
            >
              <TaskListView variant="embedded" />
            </div>
          )}
          {tabFromPath === 'plants' && (
            <div
              className={
                detail
                  ? 'map-side-panel__page-host map-side-panel__page-host--hidden'
                  : 'map-side-panel__page-host'
              }
            >
              <PlantListView variant="embedded" />
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </aside>
  );
}
