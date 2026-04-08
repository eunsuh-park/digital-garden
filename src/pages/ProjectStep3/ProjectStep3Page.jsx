import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '@/app/providers/ProjectsContext';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import './ProjectStep3Page.css';

const STEPS = ['기본 정보', '맵·구역', '식물 추가'];

export default function ProjectStep3Page() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading, error } = useProjects();

  const project = projects.find((p) => String(p.id) === String(projectId));

  if (loading && !project) {
    return (
      <div className="project-step3-page">
        <p>불러오는 중…</p>
      </div>
    );
  }

  if (!loading && error && !project) {
    return (
      <div className="project-step3-page">
        <ErrorState variant="error" message={error} showHomeLink />
      </div>
    );
  }

  if (!loading && !project) {
    return (
      <div className="project-step3-page">
        <ErrorState
          variant="404"
          title="프로젝트를 찾을 수 없습니다"
          message="목록에 없거나 삭제된 프로젝트일 수 있어요."
          showHomeLink
        />
      </div>
    );
  }

  return (
    <div className="project-step3-page">
      <div className="project-step3-page__card">
        <div className="project-step3-page__accent" aria-hidden />

        <header className="project-step3-page__header">
          <span className="project-step3-page__label">Digital Garden</span>
          <ol className="project-step3-page__steps" aria-label="진행 단계">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className={[
                  'project-step3-page__step',
                  i === 2 ? 'project-step3-page__step--current' : 'project-step3-page__step--done',
                ].join(' ')}
              >
                <span className="project-step3-page__step-index">{i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
          <h1 className="project-step3-page__title">식물 추가</h1>
          <p className="project-step3-page__subtitle">
            {project?.name?.trim() || '프로젝트'} · 구역별 식물을 추가하세요
          </p>
        </header>

        <div className="project-step3-page__body">
          <div className="project-step3-page__placeholder">
            <p className="project-step3-page__placeholder-title">구역별 식물 추가 준비 중</p>
            <p className="project-step3-page__placeholder-desc">
              Step 3 상세 구조는 곧 구현됩니다. 구역(zone) 단위로 식물을 추가하고, 나무는
              별도의 포인트 오브젝트로 관리할 수 있어요.
            </p>
          </div>
        </div>

        <div className="project-step3-page__actions">
          <button
            type="button"
            className="project-step3-page__back-btn"
            onClick={() => navigate(`/project/${projectId}/map-builder`, { replace: false })}
          >
            ← 맵 빌더로 돌아가기
          </button>
          <button
            type="button"
            className="project-step3-page__back-btn"
            onClick={() => navigate(`/project/${projectId}`, { replace: false })}
          >
            정원으로 이동 →
          </button>
        </div>
      </div>
    </div>
  );
}
