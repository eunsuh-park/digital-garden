import './Drawer.css';

/**
 * 드로어 - 우측에서 열리는 섹션 상세 패널
 * CP-10, CP-11: 섹션 정보 + 금주 할 일 + 최근 작업 + 식물 요약
 */
export default function Drawer({ section, tasks, isOpen, onClose }) {
  if (!section) return null;

  const totalTasks = tasks.length;
  const progressCount = tasks.filter((t) => t.status === 'progress').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <>
      <div
        className={`drawer__backdrop ${isOpen ? 'drawer__backdrop--open' : ''}`}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={-1}
        aria-hidden="true"
      />
      <aside
        className={`drawer ${isOpen ? 'drawer--open' : ''}`}
        aria-label={`${section.name} 상세`}
      >
        <div className="drawer__header">
          <span
            className="drawer__color"
            style={{ background: section.color_token }}
          />
          <div className="drawer__title-wrap">
            <h2 className="drawer__title">{section.name}</h2>
            {section.color_label && (
              <span className="drawer__chip drawer__chip--muted">
                {section.color_label}
              </span>
            )}
          </div>
          <button
            type="button"
            className="drawer__close"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="drawer__body">
          <section className="drawer__summary" aria-label="구역 요약">
            <div className="drawer__summary-main">
              <p className="drawer__summary-label">요약</p>
              <div className="drawer__summary-stats">
                <div className="drawer__summary-stat">
                  <span className="drawer__summary-stat-label">할 일</span>
                  <span className="drawer__summary-stat-value">{totalTasks}건</span>
                </div>
                <div className="drawer__summary-stat">
                  <span className="drawer__summary-stat-label">진행중</span>
                  <span className="drawer__summary-stat-value">{progressCount}건</span>
                </div>
                <div className="drawer__summary-stat">
                  <span className="drawer__summary-stat-label">예정</span>
                  <span className="drawer__summary-stat-value">{pendingCount}건</span>
                </div>
              </div>
            </div>
            <div className="drawer__summary-side">
              <p className="drawer__summary-side-label">식물</p>
              <p className="drawer__summary-side-value">
                {section.plantCount}종 재배 중
              </p>
            </div>
          </section>

          <section className="drawer__block" aria-label="금주 할 일 목록">
            <h3>금주 할 일</h3>
            {tasks.length === 0 ? (
              <p className="drawer__empty">이번 주 할 일이 없습니다.</p>
            ) : (
              <ul className="drawer__task-list">
                {tasks.map((t) => (
                  <li key={t.id} className="drawer__task-item">
                    <div className="drawer__task-main">
                      <span className={`drawer__task-status drawer__task-status--${t.status}`}>
                        {t.status === 'progress' ? '진행중' : '예정'}
                      </span>
                      <span className="drawer__task-title">{t.title}</span>
                    </div>
                    {t.due_date && (
                      <span className="drawer__task-meta">
                        마감 {new Date(t.due_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="drawer__block" aria-label="식물 요약">
            <h3>식물</h3>
            <p className="drawer__meta">
              이 구역에는 총 <strong>{section.plantCount}</strong>종의 식물이 연결되어 있습니다.
            </p>
          </section>
        </div>
      </aside>
    </>
  );
}
