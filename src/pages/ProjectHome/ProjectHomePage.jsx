import { Link, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import mapLine from '@iconify-icons/mingcute/map-line';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import { useProjects } from '@/app/providers/ProjectsContext';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import './ProjectHomePage.css';

const purposeLabel = {
  indoor: '실내 정원',
  outdoor: '실외 정원',
  landscape: '기타 조경 공간',
  personal: '개인 공간',
};

const spaceLabel = { s: 'S', m: 'M', l: 'L' };

export default function ProjectHomePage() {
  const { projectId } = useParams();
  const { projects, loading, error } = useProjects();

  const project = projects.find((p) => String(p.id) === String(projectId));

  if (loading && !project) {
    return (
      <div className="project-home">
        <p className="project-home__loading">불러오는 중…</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="project-home">
        <ErrorState variant="error" message={error} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-home">
        <ErrorState
          variant="404"
          title="프로젝트를 찾을 수 없습니다"
          message="목록에 없거나 삭제된 프로젝트일 수 있어요."
          showHomeLink={false}
        />
        <Link to="/dashboard" className="project-home__back">
          대시보드로
        </Link>
      </div>
    );
  }

  const purpose = project.purpose != null ? purposeLabel[project.purpose] ?? project.purpose : '—';
  const space = project.space_size != null ? spaceLabel[project.space_size] ?? project.space_size : '—';

  return (
    <div className="project-home">
      <header className="project-home__header">
        <Link to="/dashboard" className="project-home__crumb" aria-label="대시보드로">
          <Icon icon={arrowLeftLine} width={20} height={20} aria-hidden />
        </Link>
        <div>
          <span className="project-home__label">프로젝트</span>
          <h1 className="project-home__title">{project.name || '(이름 없음)'}</h1>
        </div>
      </header>

      <section className="project-home__meta" aria-label="요약">
        <span className="project-home__badge">{space}</span>
        <span className="project-home__badge project-home__badge--muted">{purpose}</span>
      </section>

      <section className="project-home__actions">
        <Link to="/" className="project-home__cta">
          <Icon icon={mapLine} width={22} height={22} aria-hidden />
          지도에서 보기
        </Link>
      </section>
    </div>
  );
}
