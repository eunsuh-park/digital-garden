import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import mapLine from '@iconify-icons/mingcute/map-line';
import task2Line from '@iconify-icons/mingcute/task-2-line';
import leaf3Fill from '@iconify-icons/mingcute/leaf-3-fill';
import arrowRightLine from '@iconify-icons/mingcute/arrow-right-line';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import './SectionNavRail.css';

/**
 * 우측 고정 섹션 네비(지도/할 일/식물) — 데스크톱에서만 표시, 접기 가능
 */
export default function SectionNavRail({ collapsed, onToggleCollapsed }) {
  return (
    <aside
      className={`section-nav-rail ${collapsed ? 'section-nav-rail--collapsed' : ''}`}
      aria-label="지도·할 일·식물"
    >
      <button
        type="button"
        className="section-nav-rail__toggle"
        onClick={onToggleCollapsed}
        aria-expanded={!collapsed}
        aria-label={collapsed ? '섹션 메뉴 펼치기' : '섹션 메뉴 접기'}
      >
        <Icon icon={collapsed ? arrowLeftLine : arrowRightLine} width={20} height={20} />
      </button>

      {!collapsed && (
        <nav className="section-nav-rail__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `section-nav-rail__item ${isActive ? 'section-nav-rail__item--active' : ''}`
            }
          >
            <Icon icon={mapLine} width={22} height={22} aria-hidden />
            <span className="section-nav-rail__label">지도</span>
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `section-nav-rail__item ${isActive ? 'section-nav-rail__item--active' : ''}`
            }
          >
            <Icon icon={task2Line} width={22} height={22} aria-hidden />
            <span className="section-nav-rail__label">할 일</span>
          </NavLink>
          <NavLink
            to="/plants"
            className={({ isActive }) =>
              `section-nav-rail__item ${isActive ? 'section-nav-rail__item--active' : ''}`
            }
          >
            <Icon icon={leaf3Fill} width={22} height={22} aria-hidden />
            <span className="section-nav-rail__label">식물</span>
          </NavLink>
        </nav>
      )}
    </aside>
  );
}
