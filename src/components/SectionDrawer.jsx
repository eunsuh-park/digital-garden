import './SectionDrawer.css';

/**
 * 섹션 드로어 - 우측에서 열리는 섹션 상세 패널
 * CP-10, CP-11: 섹션 정보 + 금주 할 일 + 최근 작업 + 식물 목록
 */
export default function SectionDrawer({ section, tasks, isOpen, onClose }) {
  if (!section) return null;

  return (
    <>
      <div
        className={`section-drawer__backdrop ${isOpen ? 'section-drawer__backdrop--open' : ''}`}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={-1}
        aria-hidden="true"
      />
      <aside
        className={`section-drawer ${isOpen ? 'section-drawer--open' : ''}`}
        aria-label={`${section.name} 상세`}
      >
        <div className="section-drawer__header">
          <span
            className="section-drawer__color"
            style={{ background: section.color_token }}
          />
          <h2 className="section-drawer__title">{section.name}</h2>
          <button
            type="button"
            className="section-drawer__close"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="section-drawer__body">
          <section className="section-drawer__block">
            <h3>금주 할 일</h3>
            {tasks.length === 0 ? (
              <p className="section-drawer__empty">이번 주 할 일이 없습니다.</p>
            ) : (
              <ul className="section-drawer__task-list">
                {tasks.map((t) => (
                  <li key={t.id} className="section-drawer__task-item">
                    <span className={`section-drawer__task-status section-drawer__task-status--${t.status}`}>
                      {t.status === 'progress' ? '진행중' : '예정'}
                    </span>
                    {t.title}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="section-drawer__block">
            <h3>식물</h3>
            <p className="section-drawer__meta">{section.plantCount}종 재배 중</p>
          </section>
        </div>
      </aside>
    </>
  );
}
