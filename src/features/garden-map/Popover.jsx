import './Popover.css';

/**
 * 팝오버 - hover 시 구역(Zone) 정보, 금주 할 일, 식물 목록 요약 (DB 연동)
 */
export default function Popover({ zone, tasks = [], plants = [], position, onOpenDrawer }) {
  if (!zone) return null;

  const formatDue = (due) => {
    if (!due) return null;
    try {
      const d = new Date(due);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      return `${m}/${day}`;
    } catch {
      return null;
    }
  };

  const taskPreview = tasks.slice(0, 5);
  const plantPreview = plants.slice(0, 5);
  const hasMoreTasks = tasks.length > 5;
  const hasMorePlants = plants.length > 5;

  return (
    <div
      className="popover"
      style={{ left: position.x, top: position.y }}
      role="tooltip"
      aria-label={`${zone.name} 구역 요약`}
    >
      <div className="popover__header">
        <span
          className="popover__color"
          style={{ background: zone.color_token }}
          aria-hidden
        />
        <div className="popover__header-text">
          <strong className="popover__title">{zone.name}</strong>
          {zone.color_label && (
            <span className="popover__color-label">{zone.color_label}</span>
          )}
        </div>
      </div>

      <div className="popover__stats">
        <span className="popover__stat">
          <span className="popover__stat-icon">📋</span>
          할 일 {(zone.taskCount != null ? zone.taskCount : tasks.length)}건
        </span>
        <span className="popover__stat">
          <span className="popover__stat-icon">🌱</span>
          식물 {(zone.plantCount != null ? zone.plantCount : plants.length)}종
        </span>
      </div>

      {taskPreview.length > 0 && (
        <div className="popover__block">
          <h4 className="popover__block-title">금주 할 일</h4>
          <ul className="popover__list popover__list--tasks">
            {taskPreview.map((t) => (
              <li key={t.id} className="popover__task-item">
                <span className={`popover__task-status popover__task-status--${t.status}`}>
                  {t.status === 'progress' ? '진행중' : '예정'}
                </span>
                <span className="popover__task-title">{t.title}</span>
                {formatDue(t.due_date) && (
                  <span className="popover__task-due">{formatDue(t.due_date)}</span>
                )}
              </li>
            ))}
            {hasMoreTasks && (
              <li className="popover__more">외 {tasks.length - 5}건</li>
            )}
          </ul>
        </div>
      )}

      {plantPreview.length > 0 && (
        <div className="popover__block">
          <h4 className="popover__block-title">식물</h4>
          <ul className="popover__list popover__list--plants">
            {plantPreview.map((p) => (
              <li key={p.id} className="popover__plant-item">
                <span className="popover__plant-name">{p.name}</span>
                {p.species && p.species !== '-' && (
                  <span className="popover__plant-species">{p.species}</span>
                )}
              </li>
            ))}
            {hasMorePlants && (
              <li className="popover__more">외 {plants.length - 5}종</li>
            )}
          </ul>
        </div>
      )}

      {tasks.length === 0 && plants.length === 0 && (
        <p className="popover__empty">등록된 할 일·식물이 없습니다</p>
      )}

      <button
        type="button"
        className="popover__btn"
        onClick={onOpenDrawer}
      >
        상세 보기
      </button>
    </div>
  );
}
