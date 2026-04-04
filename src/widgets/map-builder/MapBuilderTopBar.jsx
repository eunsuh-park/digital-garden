import { Icon } from '@iconify/react';
import back2Line from '@iconify-icons/mingcute/back-2-line';
import forwardLine from '@iconify-icons/mingcute/forward-line';
import historyAnticlockwiseLine from '@iconify-icons/mingcute/history-anticlockwise-line';
import './MapBuilderTopBar.css';

export default function MapBuilderTopBar({
  projectTitle,
  onBack,
  onSaveAndContinue,
  saving = false,
  saveDisabled = false,
}) {
  return (
    <header className="map-builder-top-bar">
      <div className="map-builder-top-bar__left">
        <button type="button" className="map-builder-top-bar__back" onClick={onBack} aria-label="이전 단계">
          <Icon icon={back2Line} width={18} height={18} aria-hidden />
          <span className="map-builder-top-bar__back-label">이전</span>
        </button>

        <div className="map-builder-top-bar__title-block">
          <h1 className="map-builder-top-bar__title">{projectTitle}</h1>
          <p className="map-builder-top-bar__subtitle">메인 맵 · 마지막 저장 2분 전</p>
        </div>

        <div className="map-builder-top-bar__mode-tabs" role="tablist" aria-label="편집 모드">
          <button type="button" role="tab" className="map-builder-top-bar__mode-tab map-builder-top-bar__mode-tab--active" aria-selected="true">
            구조 편집
          </button>
          <button type="button" role="tab" className="map-builder-top-bar__mode-tab" aria-selected="false">
            요소 배치
          </button>
          <button type="button" role="tab" className="map-builder-top-bar__mode-tab" aria-selected="false">
            정보 연결
          </button>
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
          {saving ? '저장 중…' : '저장하고 다음 단계'}
        </button>
      </div>
    </header>
  );
}
