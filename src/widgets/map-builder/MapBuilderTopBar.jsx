import { Icon } from '@iconify/react';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import forwardLine from '@iconify-icons/mingcute/forward-line';
import historyAnticlockwiseLine from '@iconify-icons/mingcute/history-anticlockwise-line';
import './MapBuilderTopBar.css';

export default function MapBuilderTopBar({
  projectTitle,
  onBack,
  onSaveAndContinue,
  saving = false,
  saveDisabled = false,
  primaryActionLabel = '저장하고 다음 단계',
}) {
  return (
    <header className="map-builder-top-bar">
      <div className="map-builder-top-bar__left">
        <button type="button" className="map-builder-top-bar__back" onClick={onBack} aria-label="이전 단계">
          <Icon icon={arrowLeftLine} width={22} height={22} aria-hidden />
        </button>

        <div className="map-builder-top-bar__title-block">
          <h1 className="map-builder-top-bar__title">{projectTitle}</h1>
          <p className="map-builder-top-bar__subtitle">메인 맵 · 마지막 저장 2분 전</p>
        </div>
      </div>

      <div className="map-builder-top-bar__right">
        <button type="button" className="map-builder-top-bar__ghost" title="실행 취소" aria-label="실행 취소">
          <Icon icon={historyAnticlockwiseLine} width={18} height={18} aria-hidden />
        </button>
        <button type="button" className="map-builder-top-bar__ghost" title="다시 실행" aria-label="다시 실행">
          <Icon icon={forwardLine} width={18} height={18} aria-hidden />
        </button>
        <div className="map-builder-top-bar__status" role="status">
          <span className="map-builder-top-bar__status-dot" aria-hidden />
          저장됨
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
