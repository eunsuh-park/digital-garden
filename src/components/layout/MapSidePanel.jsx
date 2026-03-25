import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import arrowUpLine from '@iconify-icons/mingcute/arrow-up-line';
import arrowDownLine from '@iconify-icons/mingcute/arrow-down-line';
import { useLocations } from '../../context/LocationsContext';
import { groupLocationsByColor, labelForColorGroup } from '../../lib/locationsGroup';
import './MapSidePanel.css';

/**
 * Location / Tasks / Plants 패널
 * 데스크톱: 본문 우측 세로 패널 + 좌측 접기 핸들
 * 모바일·태블릿: 본문 아래 하단 시트 + 상단 접기 핸들
 */

function LocationTabContent() {
  const { locations, loading, error } = useLocations();
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
                    <span className="map-side-panel__subitem-name">{loc.name}</span>
                    {loc.zone_type ? (
                      <span className="map-side-panel__subitem-meta">{loc.zone_type}</span>
                    ) : null}
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

function PlaceholderTab({ title }) {
  return (
    <div className="map-side-panel__placeholder">
      <p className="map-side-panel__placeholder-text">{title}</p>
      <p className="map-side-panel__placeholder-hint">추후 이 탭에 목록을 연결합니다.</p>
    </div>
  );
}

export default function MapSidePanel({ collapsed, onToggleCollapsed }) {
  const { pathname } = useLocation();
  const { locations, loading } = useLocations();

  const tabFromPath =
    pathname.startsWith('/tasks') ? 'tasks' : pathname.startsWith('/plants') ? 'plants' : 'location';

  const locationTotal = loading ? '…' : String(locations.length);

  return (
    <aside
      className={`map-side-panel ${collapsed ? 'map-side-panel--collapsed' : ''}`}
      aria-label="장소·할 일·식물 패널"
    >
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

      <div className="map-side-panel__surface" aria-hidden={collapsed ? true : undefined}>
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
            Location ({locationTotal})
          </NavLink>
          <NavLink
            to="/tasks"
            role="tab"
            aria-selected={tabFromPath === 'tasks'}
            className={({ isActive }) =>
              `map-side-panel__tab ${isActive ? 'map-side-panel__tab--active' : ''}`
            }
          >
            Tasks
          </NavLink>
          <NavLink
            to="/plants"
            role="tab"
            aria-selected={tabFromPath === 'plants'}
            className={({ isActive }) =>
              `map-side-panel__tab ${isActive ? 'map-side-panel__tab--active' : ''}`
            }
          >
            Plants
          </NavLink>
        </div>

        <div className="map-side-panel__body" role="tabpanel">
          {tabFromPath === 'location' && <LocationTabContent />}
          {tabFromPath === 'tasks' && <PlaceholderTab title="할 일 목록" />}
          {tabFromPath === 'plants' && <PlaceholderTab title="식물 목록" />}
        </div>
      </div>
    </aside>
  );
}
