import MapBuilderTopBar from './MapBuilderTopBar';
import MapBuilderCanvas from './MapBuilderCanvas';
import MapBuilderToolDock from './MapBuilderToolDock';
import './MapBuilderWorkspace.css';

/** 새 프로젝트 맵 빌더 본문(레일·우측 패널 제외). */
export default function MapBuilderWorkspace({
  projectTitle,
  onBack,
  onSaveAndContinue,
  saving,
  saveDisabled,
}) {
  return (
    <div className="map-builder-workspace">
      <MapBuilderTopBar
        projectTitle={projectTitle}
        onBack={onBack}
        onSaveAndContinue={onSaveAndContinue}
        saving={saving}
        saveDisabled={saveDisabled}
      />
      <MapBuilderCanvas />
      <MapBuilderToolDock />
    </div>
  );
}
