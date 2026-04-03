import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import addLine from '@iconify-icons/mingcute/add-line';
import rightLine from '@iconify-icons/mingcute/right-line';
import { useProjects } from '@/app/providers/ProjectsContext';
import './DashboardPage.css';

const purposeLabel = {
  indoor: '실내 정원',
  outdoor: '실외 정원',
  landscape: '기타 조경 공간',
  personal: '개인 공간',
};

const spaceLabel = { s: 'S', m: 'M', l: 'L' };

export default function DashboardPage() {
  const { projects, loading, error } = useProjects();
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
          <span className="dashboard-page__stat-value">{loading ? '…' : count}</span>
          <span className="dashboard-page__stat-label">프로젝트</span>
        </div>
      </section>

      {error ? (
        <p className="dashboard-page__error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="dashboard-page__section">
        <div className="dashboard-page__section-head">
          <h2 className="dashboard-page__section-title">내 프로젝트</h2>
          <Link to="/project/new" className="dashboard-page__link">
            <Icon icon={addLine} className="dashboard-page__link-icon" aria-hidden />
            새 프로젝트
          </Link>
        </div>

        {loading && projects.length === 0 ? (
          <p className="dashboard-page__hint">프로젝트 목록을 불러오는 중입니다…</p>
        ) : null}

        {!loading && projects.length === 0 ? (
          <div className="dashboard-page__empty">
            <p className="dashboard-page__empty-text">아직 프로젝트가 없어요.</p>
            <Link to="/project/new" className="dashboard-page__btn dashboard-page__btn--primary">
              프로젝트 만들기
            </Link>
          </div>
        ) : null}

        {projects.length > 0 ? (
          <ul className="dashboard-page__list">
            {projects.map((project) => (
              <li key={project.id}>
                <Link to={`/project/${project.id}`} className="dashboard-page__card">
                  <div className="dashboard-page__card-accent" aria-hidden />
                  <div className="dashboard-page__card-body">
                    <h3 className="dashboard-page__card-title">{project.name || '(이름 없음)'}</h3>
                    <div className="dashboard-page__card-meta">
                      <span className="dashboard-page__card-badge">
                        {project.space_size != null ? spaceLabel[project.space_size] ?? project.space_size : '—'}
                      </span>
                      <span className="dashboard-page__card-badge dashboard-page__card-badge--purpose">
                        {project.purpose != null ? purposeLabel[project.purpose] ?? project.purpose : '—'}
                      </span>
                    </div>
                  </div>
                  <Icon icon={rightLine} className="dashboard-page__card-arrow" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
