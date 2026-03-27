import './TaskDetailLayout.css';
import { TASK_TYPE_LABEL_KO } from '../../pages/Tasks/notionSchema';

function statusLabel(status) {
  if (status === 'completed') return '완료';
  if (status === 'progress') return '진행 중';
  return '시작 전';
}

function statusStyle(status) {
  if (status === 'completed') return { bg: 'rgba(39,174,96,0.12)', fg: '#27AE60' };
  if (status === 'progress') return { bg: 'rgba(41,128,185,0.12)', fg: '#2980B9' };
  return { bg: 'rgba(153,153,153,0.18)', fg: '#777' };
}

function difficultyStyle(difficulty) {
  if (difficulty === 'Hard') return { bg: 'rgba(192,57,43,0.12)', fg: '#C0392B' };
  if (difficulty === 'Medium') return { bg: 'rgba(196,126,26,0.14)', fg: '#C47E1A' };
  return { bg: 'rgba(62,123,39,0.12)', fg: '#3E7B27' };
}

/**
 * Task 패널 상세(카드 형태 아님)
 * @param {{
 *  task: object,
 *  locationName?: string | null,
 *  onLocationNavigate?: (() => void) | null,
 *  plantLinks?: Array<{ label: string, onNavigate: () => void }>,
 *  taskLinkGroups?: { prerequisites?: Array<{ label: string, onNavigate: () => void }>, followups?: Array<{ label: string, onNavigate: () => void }> },
 * }} props
 */
export default function TaskDetailLayout({
  task,
  locationName = null,
  onLocationNavigate,
  plantLinks = [],
  taskLinkGroups,
}) {
  const status = task.status ?? 'pending';
  const statusText = statusLabel(status);
  const sStyle = statusStyle(status);

  const difficulty = task.difficulty ?? 'Easy';
  const dStyle = difficultyStyle(difficulty);

  const taskType = task.task_type ?? 'Observation';
  const taskTypeLabel = TASK_TYPE_LABEL_KO[taskType] || taskType;

  const scheduledDate = task.scheduled_date || task.due_date || '';
  const estimatedDuration = task.estimated_duration || '';
  const notes = task.notes?.trim() || '';

  const prerequisites = taskLinkGroups?.prerequisites || [];
  const followups = taskLinkGroups?.followups || [];

  return (
    <article className="task-detail">
      <div className="task-detail__hero" aria-hidden>
        <div className="task-detail__hero-inner">
          <span className="task-detail__hero-icon">✓</span>
          <span className="task-detail__hero-caption">할 일</span>
        </div>
      </div>

      <div className="task-detail__body">
        <h1 className="task-detail__title">{task.title}</h1>

        <div className="task-detail__badges">
          <span
            className="task-detail__badge"
            style={{ background: sStyle.bg, color: sStyle.fg }}
          >
            {statusText}
          </span>
          <span
            className="task-detail__badge"
            style={{ background: dStyle.bg, color: dStyle.fg }}
          >
            {difficulty}
          </span>
          <span className="task-detail__badge task-detail__badge--kind">
            {taskTypeLabel}
          </span>
        </div>

        {(locationName || scheduledDate || estimatedDuration) ? (
          <dl className="task-detail__dl task-detail__dl--compact">
            {locationName ? (
              <>
                <dt>대상 구역</dt>
                <dd>
                  {onLocationNavigate ? (
                    <button type="button" className="task-detail__link" onClick={onLocationNavigate}>
                      📍 {locationName}
                    </button>
                  ) : (
                    <>📍 {locationName}</>
                  )}
                </dd>
              </>
            ) : null}
            {scheduledDate ? (
              <>
                <dt>예정일</dt>
                <dd>{scheduledDate}</dd>
              </>
            ) : null}
            {estimatedDuration ? (
              <>
                <dt>소요시간</dt>
                <dd>{estimatedDuration}</dd>
              </>
            ) : null}
          </dl>
        ) : null}

        {plantLinks.length > 0 ? (
          <section className="task-detail__section" aria-label="관련 식물">
            <h2 className="task-detail__section-title">관련 식물</h2>
            <div className="task-detail__chip-row">
              {plantLinks.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="task-card__plant-chip-btn"
                  onClick={item.onNavigate}
                >
                  🌿 {item.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {prerequisites.length > 0 ? (
          <section className="task-detail__section" aria-label="선행 작업">
            <h2 className="task-detail__section-title">선행 작업</h2>
            <div className="task-detail__chip-row">
              {prerequisites.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="task-card__chip-btn"
                  onClick={item.onNavigate}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {followups.length > 0 ? (
          <section className="task-detail__section" aria-label="후속 작업">
            <h2 className="task-detail__section-title">후속 작업</h2>
            <div className="task-detail__chip-row">
              {followups.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="task-card__chip-btn"
                  onClick={item.onNavigate}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {notes ? (
          <section className="task-detail__section" aria-label="메모">
            <h2 className="task-detail__section-title">메모</h2>
            <p className="task-detail__notes-body">{notes}</p>
          </section>
        ) : null}
      </div>
    </article>
  );
}

