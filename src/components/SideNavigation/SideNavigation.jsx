import { Link, useLocation } from 'react-router-dom';
import './SideNavigation.css';

// TODO: loadProjects()로 교체
const MOCK_PROJECTS = [
  { id: '1', name: '베란다 미니 정원' },
  { id: '2', name: '뒷뜰 조경' },
];

export default function SideNavigation() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="side-nav" aria-label="프로젝트 메뉴">
      <Link to="/map" className="side-nav__logo" aria-label="홈">
        디지털 가든
      </Link>
      <nav className="side-nav__projects">
        <span className="side-nav__label">프로젝트</span>
        <ul className="side-nav__list">
          {MOCK_PROJECTS.map((project, index) => (
            <li key={project.id}>
              <Link
                to="/map"
                className={`side-nav__link ${path === '/map' && index === 0 ? 'side-nav__link--active' : ''}`}
              >
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/project" className="side-nav__new">
          + 새 프로젝트
        </Link>
      </nav>
    </aside>
  );
}
