import { Link, useLocation } from 'react-router-dom';
import './Header.css';

/**
 * 공통 헤더 - 로고, 탭(지도/할 일), 향후 공유 버튼
 * PG-09, CP-01, CP-02
 */
export default function Header() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="page-header">
      <Link to="/" className="page-header__logo" aria-label="홈으로 이동">
        🌿 양주 정원
      </Link>
      <nav className="page-header__tabs" role="tablist">
        <Link
          to="/"
          role="tab"
          aria-selected={path === '/' || path === '/map'}
          className={`page-header__tab ${path === '/' || path === '/map' ? 'page-header__tab--active' : ''}`}
        >
          지도
        </Link>
        <Link
          to="/tasks"
          role="tab"
          aria-selected={path === '/tasks'}
          className={`page-header__tab ${path === '/tasks' ? 'page-header__tab--active' : ''}`}
        >
          할 일
        </Link>
        <Link
          to="/plants"
          role="tab"
          aria-selected={path === '/plants'}
          className={`page-header__tab ${path === '/plants' ? 'page-header__tab--active' : ''}`}
        >
          식물
        </Link>
      </nav>
    </header>
  );
}
