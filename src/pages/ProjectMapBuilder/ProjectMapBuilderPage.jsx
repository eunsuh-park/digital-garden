import { useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProjects } from '@/app/providers/ProjectsContext';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import { useToast } from '@/app/providers/ToastContext';
import MapBuilderWorkspace from './MapBuilderWorkspace';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import {
  loadProjectMapBuilderDraft,
  readMapBuilderStageSize,
  saveProjectMapBuilderDraft,
} from '@/pages/ProjectMapBuilder/lib/projectMapBuilderDraft';
import { setMapBuilderMode } from '@/pages/ProjectMapBuilder/lib/mapBuilderMode';
import '@/pages/ProjectNew/ProjectNewPage.css';
import './ProjectMapBuilderPage.css';

/**
 * 기존 프로젝트: 맵 빌더만 다시 열기 (/project/:id/map-builder)
 */
export default function ProjectMapBuilderPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    openWithDraft,
    setMapBuilderOpen,
    mapPresentLayerIds,
    mapLayerTypes,
    mapUserShapes,
    setMapSpaceSize,
    mapZoneNameIndex,
    mapSaveState,
    markMapSaved,
    undoMapAction,
    redoMapAction,
    canUndo,
    canRedo,
  } = useProjectNewMapBuilderUi();
  const { showToast } = useToast();
  const { projects, loading, error } = useProjects();
  const project = projects.find((p) => String(p.id) === String(projectId));
  const zoneCount = [
    ...mapPresentLayerIds.filter((id) => id !== 'base' && mapLayerTypes[id] === 'zone'),
    ...mapUserShapes.filter((s) => mapLayerTypes[s.id] === 'zone').map((s) => s.id),
  ].length;

  useEffect(() => {
    const draft = loadProjectMapBuilderDraft(projectId);
    if (draft) {
      openWithDraft(draft);
    } else {
      setMapBuilderOpen(true);
    }
    return () => {
      setMapBuilderOpen(false);
      setMapBuilderMode(false);
    };
  }, [projectId, openWithDraft, setMapBuilderOpen]);

  useEffect(() => {
    if (!projectId || mapSaveState !== 'dirty') return;
    saveProjectMapBuilderDraft(projectId, {
      mapPresentLayerIds: [...mapPresentLayerIds],
      mapLayerTypes: { ...mapLayerTypes },
      mapUserShapes: JSON.parse(JSON.stringify(mapUserShapes)),
      mapSpaceSize: project?.space_size === 'narrow' ? 'medium' : project?.space_size || 'medium',
      nextZoneNameIndex: mapZoneNameIndex,
      stageSize: readMapBuilderStageSize(),
    });
  }, [mapLayerTypes, mapPresentLayerIds, mapSaveState, mapUserShapes, mapZoneNameIndex, project?.space_size, projectId]);

  useEffect(() => {
    if (!project) return;
    setMapSpaceSize(project.space_size === 'narrow' ? 'medium' : project.space_size || 'medium');
  }, [project, setMapSpaceSize]);

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

  const handleSaveAndContinue = useCallback(() => {
    if (zoneCount < 1) {
      showToast('최소 1개의 "구역" 유형 레이어가 있어야 저장할 수 있어요.');
      return;
    }
    const stageSize = readMapBuilderStageSize();
    saveProjectMapBuilderDraft(projectId, {
      mapPresentLayerIds: [...mapPresentLayerIds],
      mapLayerTypes: { ...mapLayerTypes },
      mapUserShapes: JSON.parse(JSON.stringify(mapUserShapes)),
      mapSpaceSize: project?.space_size === 'narrow' ? 'medium' : project?.space_size || 'medium',
      nextZoneNameIndex: mapZoneNameIndex,
      stageSize,
    });
    markMapSaved();
    navigate(`/project/${projectId}/step3`, { replace: false });
  }, [
    mapPresentLayerIds,
    mapLayerTypes,
    mapUserShapes,
    showToast,
    projectId,
    mapZoneNameIndex,
    markMapSaved,
    navigate,
    project?.space_size,
  ]);

  return (
    <div className="project-new-page project-new-page--map-builder">
      <MapBuilderWorkspace
        projectTitle={project?.name?.trim() || '프로젝트'}
        onBack={goGarden}
        onSaveAndContinue={handleSaveAndContinue}
        onUndo={undoMapAction}
        onRedo={redoMapAction}
        canUndo={canUndo}
        canRedo={canRedo}
        saveStatus={mapSaveState}
        saving={false}
        saveDisabled={zoneCount < 1}
        primaryActionLabel="저장하고 다음 단계"
      />
    </div>
  );
}
