import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProjects } from '@/app/providers/ProjectsContext';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import MapBuilderWorkspace from '@/widgets/map-builder/MapBuilderWorkspace';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import '@/pages/ProjectNew/ProjectNewPage.css';
import './ProjectMapBuilderPage.css';

/**
 * 기존 프로젝트: 맵 빌더만 다시 열기 (/project/:id/map-builder)
 */
export default function ProjectMapBuilderPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { setMapBuilderOpen } = useProjectNewMapBuilderUi();
  const { projects, loading, error } = useProjects();

  useEffect(() => {
    setMapBuilderOpen(true);
    return () => setMapBuilderOpen(false);
  }, [setMapBuilderOpen]);

  const project = projects.find((p) => String(p.id) === String(projectId));

  if (loading && !project) {
    return (
      <div className="landing-page landing-page--loading">
        <p>불러오는 중…</p>
      </div>
    );
  }

  if (!loading && error && !project) {
    return (
      <div className="landing-page landing-page--centered">
        <ErrorState variant="error" message={error} showHomeLink />
      </div>
    );
  }

  if (!loading && !project) {
    return (
      <div className="landing-page landing-page--centered">
        <ErrorState
          variant="404"
          title="프로젝트를 찾을 수 없습니다"
          message="목록에 없거나 삭제된 프로젝트일 수 있어요."
          showHomeLink
        />
        <Link to="/" className="project-map-builder-page__back-link">
          대시보드로
        </Link>
      </div>
    );
  }

  function goGarden() {
    navigate(`/project/${projectId}`, { replace: false });
  }

  return (
    <div className="project-new-page project-new-page--map-builder">
      <MapBuilderWorkspace
        projectTitle={project?.name?.trim() || '프로젝트'}
        onBack={goGarden}
        onSaveAndContinue={goGarden}
        saving={false}
        saveDisabled={false}
        primaryActionLabel="저장하기"
      />
    </div>
  );
}
