/**
 * ProjectMapBuilder page entry file.
 * Reopens the map builder workspace for an existing project route.
 */

import { useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProjects } from '@/app/providers/ProjectsContext';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import { useToast } from '@/app/providers/ToastContext';
import MapBuilderWorkspace from '@/features/map-builder/components/MapBuilderWorkspace';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import {
  loadProjectMapBuilderDraft,
  readMapBuilderStageSize,
  saveProjectMapBuilderDraft,
} from '@/features/map-builder/lib/projectMapBuilderDraft';
import { setMapBuilderMode } from '@/features/map-builder/lib/mapBuilderMode';
import '@/pages/ProjectSetup/styles/ProjectSetupPage.css';
import './styles/ProjectMapBuilderPage.css';

/**
 * ?? ????: ? ??? ?? ?? (/project/:id/map-builder)
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
        <p>???? ??</p>
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
          title="????? ?? ? ????"
          message="??? ??? ??? ????? ? ???."
          showHomeLink
        />
        <Link to="/" className="project-map-builder-page__back-link">
          ?????
        </Link>
      </div>
    );
  }

  function goGarden() {
    navigate(`/project/${projectId}`, { replace: false });
  }

  const handleSaveAndContinue = useCallback(() => {
    if (zoneCount < 1) {
      showToast('?? 1?? "??" ?? ???? ??? ??? ? ???.');
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
        projectTitle={project?.name?.trim() || '????'}
        onBack={goGarden}
        onSaveAndContinue={handleSaveAndContinue}
        onUndo={undoMapAction}
        onRedo={redoMapAction}
        canUndo={canUndo}
        canRedo={canRedo}
        saveStatus={mapSaveState}
        saving={false}
        saveDisabled={zoneCount < 1}
        primaryActionLabel="???? ?? ??"
      />
    </div>
  );
}
