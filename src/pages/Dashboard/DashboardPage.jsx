import { useState } from 'react';
import { Link } from 'react-router-dom';
import './DashboardPage.css';

// TODO: loadProjects()로 교체
const MOCK_PROJECTS = [
  { id: '1', name: '베란다 미니 정원', space: 's', purpose: 'indoor', createdAt: '2025-03-10' },
  { id: '2', name: '뒷뜰 조경', space: 'l', purpose: 'outdoor', createdAt: '2025-03-12' },
];

const purposeLabel = {
  indoor: '실내 정원',
  outdoor: '실외 정원',
  landscape: '기타 조경 공간',
  personal: '개인 공간',
};

const spaceLabel = { s: 'S', m: 'M', l: 'L' };

export default function DashboardPage() {
  const [projects] = useState(MOCK_PROJECTS);
  const count = projects.length;

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <span className="dashboard-page__label">Digital Garden</span>
        <h1 className="dashboard-page__title">대시보드</h1>
        <p className="dashboard-page__desc">프로젝트를 선택하거나 새로 만드세요.</p>
      </header>

      <section className="dashboard-page__summary">
        <div className="dashboard-page__stat-card">
          <span className="dashboard-page__stat-value">{count}</span>
          <span className="dashboard-page__stat-label">프로젝트</span>
        </div>
      </section>

      <section className="dashboard-page__section">
        <div className="dashboard-page__section-head">
          <h2 className="dashboard-page__section-title">내 프로젝트</h2>
          <Link to="/project" className="dashboard-page__link">
            + 새 프로젝트
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="dashboard-page__empty">
            <p className="dashboard-page__empty-text">아직 프로젝트가 없어요.</p>
            <Link to="/project" className="dashboard-page__btn dashboard-page__btn--primary">
              프로젝트 만들기
            </Link>
          </div>
        ) : (
          <ul className="dashboard-page__list">
            {projects.map((project) => (
              <li key={project.id}>
                <Link to={`/project/${project.id}`} className="dashboard-page__card">
                  <div className="dashboard-page__card-accent" aria-hidden />
                  <div className="dashboard-page__card-body">
                    <h3 className="dashboard-page__card-title">{project.name}</h3>
                    <div className="dashboard-page__card-meta">
                      <span className="dashboard-page__card-badge">{spaceLabel[project.space]}</span>
                      <span className="dashboard-page__card-badge dashboard-page__card-badge--purpose">
                        {purposeLabel[project.purpose]}
                      </span>
                    </div>
                  </div>
                  <span className="dashboard-page__card-arrow" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
