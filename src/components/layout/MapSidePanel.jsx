import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import arrowUpLine from '@iconify-icons/mingcute/arrow-up-line';
import arrowDownLine from '@iconify-icons/mingcute/arrow-down-line';
import './MapSidePanel.css';

/**
 * 지도 우측 패널 — Location / Tasks / Plants 탭 + 좌측 접기 핸들(Drawer)
 * 데스크톱(≥1024px) 전용. 라우트와 탭을 동기화한다.
 */

const LOCATION_MOCK = [
  {
    id: 'garden',
    label: '텃밭',
    count: 2,
    dot: '#3d8c4a',
    children: [{ id: 'g1', label: '텃밭' }, { id: 'g2', label: '텃밭' }],
  },
  { id: 'herb', label: '허브 zone', count: 3, dot: '#5eb8c4' },
  { id: 'tree', label: '나무 zone', count: 3, dot: '#1f5c3a' },
  { id: 'etc', label: 'etc', count: 1, dot: '#e08a4c' },
  { id: 'none', label: 'No Label', count: 1, dot: '#9ca3af' },
];

function LocationTabContent() {
  const [expandedId, setExpandedId] = useState('garden');

  return (
    <ul className="map-side-panel__list" role="list">
      {LOCATION_MOCK.map((row) => {
        const hasChildren = row.children?.length;
        const expanded = expandedId === row.id;

        const RowTag = hasChildren ? 'button' : 'div';
        const rowProps = hasChildren
          ? {
              type: 'button',
              onClick: () => setExpandedId((prev) => (prev === row.id ? '' : row.id)),
              'aria-expanded': expanded,
            }
          : {};

        return (
          <li key={row.id} className="map-side-panel__list-item">
            <RowTag className="map-side-panel__row" {...rowProps}>
              <span className="map-side-panel__dot" style={{ background: row.dot }} aria-hidden />
              <span className="map-side-panel__row-label">{row.label}</span>
              <span className="map-side-panel__row-count">{row.count}</span>
              {hasChildren ? (
                <Icon
                  icon={expanded ? arrowUpLine : arrowDownLine}
                  width={16}
                  height={16}
                  className="map-side-panel__row-chevron"
                  aria-hidden
                />
              ) : (
                <span className="map-side-panel__row-chevron map-side-panel__row-chevron--spacer" />
              )}
            </RowTag>
            {hasChildren && expanded && (
              <ul className="map-side-panel__sublist">
                {row.children.map((c) => (
                  <li key={c.id} className="map-side-panel__subitem">
                    {c.label}
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

  const tabFromPath =
    pathname.startsWith('/tasks') ? 'tasks' : pathname.startsWith('/plants') ? 'plants' : 'location';

  const locationCount = 9;

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
        <span className="map-side-panel__handle-icon" aria-hidden>
          {collapsed ? '›' : '‹'}
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
            Location ({locationCount})
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
