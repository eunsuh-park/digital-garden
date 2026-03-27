import './FullPage.css';

/**
 * 전체 페이지 공통 템플릿
 * Tasks, Locations, Plants 페이지에서 공통 사용
 * headerRight: 우측 상단에 표시할 UI (FullPageFilter, FullPageSorter 등)
 * variant="embedded": 하단 시트(MapSidePanel) 등 좁은 영역용 레이아웃
 */
export default function FullPage({ title, subtitle, children, emptyMessage, headerRight, variant = 'default' }) {
  const rootClass = variant === 'embedded' ? 'full-page full-page--embedded' : 'full-page';

  return (
    <div className={rootClass}>
      {variant !== 'embedded' && (
        <header className="full-page__header">
          <div className="full-page__header-left">
            <h1 className="full-page__title">{title}</h1>
            {subtitle && <p className="full-page__sub">{subtitle}</p>}
          </div>
          {headerRight && (
            <div className="full-page__header-right">
              {headerRight}
            </div>
          )}
        </header>
      )}
      <div className="full-page__body">
        {emptyMessage ? (
          <p className="full-page__empty">{emptyMessage}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
