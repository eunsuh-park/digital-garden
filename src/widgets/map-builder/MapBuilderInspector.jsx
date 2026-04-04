import { useState } from 'react';
import { Icon } from '@iconify/react';
import eye2Line from '@iconify-icons/mingcute/eye-2-line';
import lockLine from '@iconify-icons/mingcute/lock-line';
import searchLine from '@iconify-icons/mingcute/search-line';
import unlockLine from '@iconify-icons/mingcute/unlock-line';
import './MapBuilderInspector.css';

const TABS = [
  { id: 'library', label: '라이브러리' },
  { id: 'layers', label: '레이어' },
  { id: 'props', label: '속성' },
];

/**
 * 맵 빌더 전용 우측 패널 본문 — MapSidePanel 안에서만 사용 (탭 줄은 MapSidePanel이 그린다).
 */
export default function MapBuilderInspector() {
  const [active, setActive] = useState('props');

  return (
    <div className="map-builder-inspector">
      <div className="map-side-panel__tabs" role="tablist" aria-label="맵 빌더 패널">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            className={`map-side-panel__tab ${active === t.id ? 'map-side-panel__tab--active' : ''}`}
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="map-builder-inspector__search" role="search">
        <Icon icon={searchLine} width={18} height={18} className="map-builder-inspector__search-icon" aria-hidden />
        <span className="map-builder-inspector__search-placeholder">요소 검색</span>
      </div>

      <div className="map-builder-inspector__scroll" role="tabpanel">
        {active === 'library' && (
          <p className="map-builder-inspector__hint">라이브러리 목록 UI는 준비 중입니다.</p>
        )}
        {active === 'layers' && (
          <p className="map-builder-inspector__hint">레이어 전용 목록 UI는 준비 중입니다.</p>
        )}
        {active === 'props' && (
          <>
            <div className="map-builder-inspector__section-title">레이어</div>
            <div className="map-builder-inspector__layer-list">
              <div className="map-builder-inspector__layer-item map-builder-inspector__layer-item--active">
                <span className="map-builder-inspector__layer-ico" aria-hidden>
                  <Icon icon={eye2Line} width={18} height={18} />
                </span>
                <div>
                  <strong className="map-builder-inspector__layer-name">집</strong>
                  <span className="map-builder-inspector__layer-meta">건물 & 부속물</span>
                </div>
                <span className="map-builder-inspector__layer-ico" aria-hidden>
                  <Icon icon={unlockLine} width={18} height={18} />
                </span>
                <span className="map-builder-inspector__dot" />
              </div>

              <div className="map-builder-inspector__property-card">
                <div className="map-builder-inspector__twocol">
                  <div className="map-builder-inspector__field">
                    <label className="map-builder-inspector__label">이름</label>
                    <div className="map-builder-inspector__value">집</div>
                  </div>
                  <div className="map-builder-inspector__field">
                    <label className="map-builder-inspector__label">설명</label>
                    <div className="map-builder-inspector__value">집입니다.</div>
                  </div>
                </div>
                <div className="map-builder-inspector__twocol">
                  <div className="map-builder-inspector__field">
                    <label className="map-builder-inspector__label">크기</label>
                    <div className="map-builder-inspector__value">100%</div>
                  </div>
                  <div className="map-builder-inspector__field">
                    <label className="map-builder-inspector__label">회전</label>
                    <div className="map-builder-inspector__value">0°</div>
                  </div>
                </div>
                <button type="button" className="map-builder-inspector__danger">
                  요소 삭제
                </button>
                <button type="button" className="map-builder-inspector__save">
                  저장
                </button>
              </div>

              <div className="map-builder-inspector__layer-item">
                <span className="map-builder-inspector__layer-ico" aria-hidden>
                  <Icon icon={eye2Line} width={18} height={18} />
                </span>
                <div>
                  <strong className="map-builder-inspector__layer-name">기본 영역</strong>
                  <span className="map-builder-inspector__layer-meta">텃밭, 뜰 등</span>
                </div>
                <span className="map-builder-inspector__layer-ico" aria-hidden>
                  <Icon icon={unlockLine} width={18} height={18} />
                </span>
                <span className="map-builder-inspector__dot" />
              </div>

              <div className="map-builder-inspector__layer-item">
                <span className="map-builder-inspector__layer-ico" aria-hidden>
                  <Icon icon={eye2Line} width={18} height={18} />
                </span>
                <div>
                  <strong className="map-builder-inspector__layer-name">창고</strong>
                  <span className="map-builder-inspector__layer-meta">기타 자투리 공간</span>
                </div>
                <span className="map-builder-inspector__layer-ico" aria-hidden>
                  <Icon icon={lockLine} width={18} height={18} />
                </span>
                <span className="map-builder-inspector__dot map-builder-inspector__dot--muted" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
