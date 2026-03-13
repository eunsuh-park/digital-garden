import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import mapLine from '@iconify-icons/mingcute/map-line';
import task2Line from '@iconify-icons/mingcute/task-2-line';
import leaf3Fill from '@iconify-icons/mingcute/leaf-3-fill';
import './Header.css';

/**
 * ?? ?? - ??, ?(??/? ?/??), ?? ?? ??
 * PG-09, CP-01, CP-02
 */
export default function Header() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="page-header">
      <Link to="/" className="page-header__logo" aria-label="디지털 가든">
        ?? ?? ??
      </Link>
      <nav className="page-header__tabs" role="tablist">
        <Link
          to="/"
          role="tab"
          aria-selected={path === '/' || path === '/map'}
          className={`page-header__tab ${path === '/' || path === '/map' ? 'page-header__tab--active' : ''}`}
        >
          <Icon icon={mapLine} width={18} height={18} />
          지도
        </Link>
        <Link
          to="/tasks"
          role="tab"
          aria-selected={path === '/tasks'}
          className={`page-header__tab ${path === '/tasks' ? 'page-header__tab--active' : ''}`}
        >
          <Icon icon={task2Line} width={18} height={18} />
          할 일
        </Link>
        <Link
          to="/plants"
          role="tab"
          aria-selected={path === '/plants'}
          className={`page-header__tab ${path === '/plants' ? 'page-header__tab--active' : ''}`}
        >
          <Icon icon={leaf3Fill} width={18} height={18} />
          식물
        </Link>
      </nav>
    </header>
  );
}
