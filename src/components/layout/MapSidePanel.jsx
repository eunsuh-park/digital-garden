import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import arrowUpLine from '@iconify-icons/mingcute/arrow-up-line';
import arrowDownLine from '@iconify-icons/mingcute/arrow-down-line';
import { useLocations } from '../../context/LocationsContext';
import { useMapPanelDetail } from '../../context/MapPanelDetailContext';
import { groupLocationsByColor, labelForColorGroup } from '../../lib/locationsGroup';
import TasksPage from '../../pages/Tasks/TasksPage';
import PlantsPage from '../../pages/Plants/PlantsPage';
import {
  MapPanelLocationDetail,
  MapPanelPlantDetail,
  MapPanelTaskDetail,
} from './MapPanelDetailViews';
import './MapSidePanel.css';

function LocationTabContent() {
  const { locations, loading, error } = useLocations();
  const { openLocationDetail } = useMapPanelDetail();
  const [expandedColors, setExpandedColors] = useState(() => new Set());

  const groups = useMemo(() => groupLocationsByColor(locations), [locations]);

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

  if (!locations.length) {
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
                icon={expanded ? arrowUpLine : arrowDownLine}
                width={16}
                height={16}
                className="map-side-panel__row-chevron"
                aria-hidden
              />
            </button>
            {expanded && (
              <ul className="map-side-panel__sublist">
                {items.map((loc) => (
                  <li key={loc.id} className="map-side-panel__subitem">
                    <button
                      type="button"
                      className="map-side-panel__subitem-btn"
                      onClick={() => openLocationDetail(loc)}
                    >
                      <span className="map-side-panel__subitem-name">{loc.name}</span>
                      {loc.color_label ? (
                        <span className="map-side-panel__subitem-meta">{loc.color_label}</span>
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
  const { locations, tasks, plants, loading } = useLocations();
  const { detail, closeDetail } = useMapPanelDetail();

  useEffect(() => {
    closeDetail();
  }, [pathname, closeDetail]);

  const locationMap = useMemo(() => Object.fromEntries(locations.map((l) => [l.id, l])), [locations]);
  const plantMap = useMemo(() => Object.fromEntries(plants.map((p) => [p.id, p])), [plants]);
  const taskTitleMap = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t.title])), [tasks]);

  const tabFromPath =
    pathname.startsWith('/tasks') ? 'tasks' : pathname.startsWith('/plants') ? 'plants' : 'location';

  const pendingTasksCount = useMemo(
    () => tasks.filter((t) => t.status !== 'completed').length,
    [tasks]
  );

  const locationTotal = loading ? '…' : String(locations.length);
  const tasksCountLabel = loading ? '…' : String(pendingTasksCount);
  const plantsCountLabel = loading ? '…' : String(plants.length);

  const collapsedVisual = collapsed && !detail;
  const asideClass = [
    'map-side-panel',
    collapsedVisual ? 'map-side-panel--collapsed' : '',
    detail ? 'map-side-panel--detail-expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={asideClass} aria-label="장소·할 일·식물 패널">
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
              {collapsed ? '›' : '‹'}
            </span>
            <span className="map-side-panel__handle-icon map-side-panel__handle-icon--mobile">
              {collapsed ? '▴' : '▾'}
            </span>
          </span>
        </button>
      )}

      <div
        className="map-side-panel__surface"
        aria-hidden={collapsedVisual ? true : undefined}
      >
        {!detail && (
          <div className="map-side-panel__tabs" role="tablist" aria-label="보기 전환">
            <NavLink
              to="/"
              end
              role="tab"
              aria-selected={tabFromPath === 'location'}
              className={({ isActive }) =>
                `map-side-panel__tab ${isActive ? 'map-side-panel__tab--active' : ''}`
              }
            >
              Location{' '}
              <span className="map-side-panel__tab-count">({locationTotal})</span>
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
          {detail?.type === 'location' && (
            <MapPanelLocationDetail location={detail.location} onBack={closeDetail} />
          )}
          {detail?.type === 'task' && (
            <MapPanelTaskDetail
              task={detail.task}
              onBack={closeDetail}
              locationMap={locationMap}
              plantMap={plantMap}
              taskTitleMap={taskTitleMap}
            />
          )}
          {detail?.type === 'plant' && (
            <MapPanelPlantDetail
              plant={detail.plant}
              onBack={closeDetail}
              locationMap={locationMap}
            />
          )}
          {!detail && tabFromPath === 'location' && <LocationTabContent />}
          {!detail && tabFromPath === 'tasks' && (
            <div className="map-side-panel__page-host">
              <TasksPage variant="embedded" />
            </div>
          )}
          {!detail && tabFromPath === 'plants' && (
            <div className="map-side-panel__page-host">
              <PlantsPage variant="embedded" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
