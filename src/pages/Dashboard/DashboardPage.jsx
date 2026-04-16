import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import addLine from '@iconify-icons/mingcute/add-line';
import rightLine from '@iconify-icons/mingcute/right-line';
import { useProjects } from '@/app/providers/ProjectsContext';
import { formatProjectSpaceSizeLabel } from '@/pages/ProjectNew/lib/project';
import './DashboardPage.css';

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
      {error ? (
        <p className="dashboard-page__error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="dashboard-page__section">
        <div className="dashboard-page__section-head">
          <h2 className="dashboard-page__section-title">내 프로젝트</h2>
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
                        {formatProjectSpaceSizeLabel(project.space_size)}
                      </span>
                    </div>
                    {project.space_description?.trim() ? (
                      <p className="dashboard-page__card-desc">{project.space_description.trim()}</p>
                    ) : null}
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
