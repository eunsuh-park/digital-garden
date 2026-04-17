import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import up from '@iconify-icons/mingcute/arrow-up-line';
import down from '@iconify-icons/mingcute/arrow-down-line';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import arrowRightLine from '@iconify-icons/mingcute/arrow-right-line';
import { useZones } from '@/app/providers/ZonesContext';
import { useMapPanelDetail } from '@/app/providers/MapPanelDetailContext';
import { useToast } from '@/app/providers/ToastContext';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import {
  getMapBuilderMode,
  setMapBuilderMode,
  subscribeMapBuilderMode,
} from '@/features/map-builder/lib/mapBuilderMode';
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
import MapBuilderInspector from '@/features/map-builder/components/MapBuilderInspector';
import './MapSidePanel.css';

function ZoneTabContent() {
  const { zones, loading, error } = useZones();
  const { openZoneDetail } = useMapPanelDetail();
  const visibleZones = useMemo(
    () => zones.filter((z) => z.svg_id !== 'dg_base_zone' && z.name !== '기본 구역'),
    [zones],
  );

  if (loading) {
    return <p className="map-side-panel__hint">구역을 불러오는 중…</p>;
  }

  if (error) {
    return <p className="map-side-panel__hint map-side-panel__hint--error">{error}</p>;
  }

  if (!visibleZones.length) {
    return <p className="map-side-panel__hint">등록된 구역이 없습니다.</p>;
  }

  return (
    <ul className="map-side-panel__list" role="list">
      {visibleZones.map((z) => (
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
  );
}

function parseProjectMapPath(pathname) {
  const m = pathname.match(/^\/project\/([^/]+)(?:\/(tasks|plants|map-builder))?$/);
  if (!m || m[1] === 'new') return null;
  return { projectId: m[1], suffix: m[2] };
}

export default function MapSidePanel({ collapsed, onToggleCollapsed }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { mapBuilderOpen } = useProjectNewMapBuilderUi();
  const mapPath = useMemo(() => parseProjectMapPath(pathname), [pathname]);
  const isProjectOpen =
    Boolean(mapPath) || (mapBuilderOpen && pathname === '/project/new');
  const projectBase = mapPath ? `/project/${mapPath.projectId}` : null;
  const { zones, tasks, plants, loading } = useZones();
  const { detail, closeDetail, closeAllDetail } = useMapPanelDetail();
  const { showToast } = useToast();
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
    mapPath?.suffix === 'tasks' ? 'tasks' : mapPath?.suffix === 'plants' ? 'plants' : 'zone';

  const pendingTasksCount = useMemo(
    () => tasks.filter((t) => t.status !== 'completed').length,
    [tasks]
  );

  const zoneTotal = loading ? '…' : String(zones.filter((z) => z.svg_id !== 'dg_base_zone' && z.name !== '기본 구역').length);
  const tasksCountLabel = loading ? '…' : String(pendingTasksCount);
  const plantsCountLabel = loading ? '…' : String(plants.length);

  const collapsedVisual = collapsed && !detail;
  const asideClass = [
    'map-side-panel',
    mapBuilderOpen ? 'map-side-panel--map-builder' : '',
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
        {!detail && projectBase ? (
          <div className="map-side-panel__tabs" role="tablist" aria-label="보기 전환">
            <NavLink
              to={projectBase}
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
              to={`${projectBase}/tasks`}
              role="tab"
              aria-selected={tabFromPath === 'tasks'}
              className={({ isActive }) =>
                `map-side-panel__tab ${isActive ? 'map-side-panel__tab--active' : ''}`
              }
            >
              Tasks <span className="map-side-panel__tab-count">({tasksCountLabel})</span>
            </NavLink>
            <NavLink
              to={`${projectBase}/plants`}
              role="tab"
              aria-selected={tabFromPath === 'plants'}
              className={({ isActive }) =>
                `map-side-panel__tab ${isActive ? 'map-side-panel__tab--active' : ''}`
              }
            >
              Plants <span className="map-side-panel__tab-count">({plantsCountLabel})</span>
            </NavLink>
          </div>
        ) : null}

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
                    const next = setMapBuilderMode(true);
                    setMapBuilderModeState(next);
                    if (projectBase) {
                      navigate(`${projectBase}/map-builder`, { replace: false });
                    }
                    showToast('맵 빌더 모드로 전환했습니다.');
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
