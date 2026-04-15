import { Icon } from '@iconify/react';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import forwardLine from '@iconify-icons/mingcute/forward-line';
import historyAnticlockwiseLine from '@iconify-icons/mingcute/history-anticlockwise-line';
import './MapBuilderTopBar.css';

export default function MapBuilderTopBar({
  projectTitle,
  onBack,
  onSaveAndContinue,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  saving = false,
  saveDisabled = false,
  saveStatus = 'saved',
  primaryActionLabel = '저장하고 다음 단계',
}) {
  const statusLabel =
    saveStatus === 'saving'
      ? '저장 중'
      : saveStatus === 'dirty'
        ? '미저장 변경'
        : saveStatus === 'error'
          ? '저장 실패'
          : '저장됨';

  return (
    <header className="map-builder-top-bar">
      <div className="map-builder-top-bar__left">
        <button type="button" className="map-builder-top-bar__back" onClick={onBack} aria-label="이전 단계">
          <Icon icon={arrowLeftLine} width={22} height={22} aria-hidden />
        </button>

        <div className="map-builder-top-bar__title-block">
          <h1 className="map-builder-top-bar__title">{projectTitle}</h1>
          <p className="map-builder-top-bar__subtitle">메인 맵</p>
        </div>
      </div>

      <div className="map-builder-top-bar__right">
        <button
          type="button"
          className="map-builder-top-bar__ghost"
          title="실행 취소"
          aria-label="실행 취소"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Icon icon={historyAnticlockwiseLine} width={18} height={18} aria-hidden />
        </button>
        <button
          type="button"
          className="map-builder-top-bar__ghost"
          title="다시 실행"
          aria-label="다시 실행"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Icon icon={forwardLine} width={18} height={18} aria-hidden />
        </button>
        <div className="map-builder-top-bar__status" role="status">
          <span className="map-builder-top-bar__status-dot" aria-hidden />
          {statusLabel}
        </div>
        <button
          type="button"
          className="map-builder-top-bar__primary"
          onClick={onSaveAndContinue}
          disabled={saveDisabled || saving}
        >
          {saving ? '저장 중…' : primaryActionLabel}
        </button>
      </div>
    </header>
  );
}
