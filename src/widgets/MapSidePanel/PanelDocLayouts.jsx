import { Icon } from '@iconify/react';
import imageAddLine from '@iconify-icons/mingcute/pic-line';
import leaf3Fill from '@iconify-icons/mingcute/leaf-3-fill';
import mapLine from '@iconify-icons/mingcute/map-line';
import { TASK_TYPE_LABEL_KO } from '@/entities/task/lib/notion-schema';

function taskStatusLabel(status) {
  if (status === 'completed') return '완료';
  if (status === 'progress') return '진행 중';
  return '시작 전';
}

function taskStatusStyle(status) {
  if (status === 'completed') return { bg: 'var(--color-success-bg)', fg: 'var(--color-success-text)' };
  if (status === 'progress') {
    return {
      bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
      fg: 'var(--color-primary)',
    };
  }
  return { bg: 'var(--color-hover-soft)', fg: 'var(--color-text-muted)' };
}

function difficultyStyle(difficulty) {
  if (difficulty === 'Hard') return { bg: 'var(--color-danger-bg)', fg: 'var(--color-danger-text-strong)' };
  if (difficulty === 'Medium') {
    return {
      bg: 'var(--color-warning-bg)',
      fg: 'var(--color-warning-text)',
    };
  }
  return {
    bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
    fg: 'var(--color-primary)',
  };
}

function plantStatusLabel(status) {
  if (status === 'needs_care') return '관리 필요';
  if (status === 'planned') return '식재 예정';
  if (status === 'planted') return '확인됨';
  return '미확인';
}

/**
 * 우측 패널 할 일 상세 — 스타일: panel-doc (panel-view.css)
 */
export function TaskDetailLayout({
  task,
  zoneName = null,
  onZoneNavigate,
  plantLinks = [],
  taskLinkGroups,
}) {
  const status = task.status ?? 'pending';
  const statusText = taskStatusLabel(status);
  const sStyle = taskStatusStyle(status);

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
    <article className="panel-doc">
      <div className="panel-doc__body">
        <h1 className="panel-doc__h1">{task.title}</h1>

        <div className="panel-doc__badges">
          <span className="panel-doc__badge" style={{ background: sStyle.bg, color: sStyle.fg }}>
            {statusText}
          </span>
          <span className="panel-doc__badge" style={{ background: dStyle.bg, color: dStyle.fg }}>
            {difficulty}
          </span>
          <span className="panel-doc__badge panel-doc__badge--accent">{taskTypeLabel}</span>
        </div>

        {zoneName || scheduledDate || estimatedDuration ? (
          <dl className="panel-doc__dl panel-doc__dl--ruled">
            {zoneName ? (
              <>
                <dt>대상 구역</dt>
                <dd>
                  {onZoneNavigate ? (
                    <button type="button" className="panel-doc__link" onClick={onZoneNavigate}>
                      <Icon icon={mapLine} width={14} height={14} aria-hidden /> {zoneName}
                    </button>
                  ) : (
                    <>
                      <Icon icon={mapLine} width={14} height={14} aria-hidden /> {zoneName}
                    </>
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
          <section className="panel-doc__block" aria-label="관련 식물">
            <h2 className="panel-doc__h2">관련 식물</h2>
            <div className="panel-doc__chips">
              {plantLinks.map((item) => (
                <button key={item.label} type="button" className="panel-doc__chip" onClick={item.onNavigate}>
                  <Icon icon={leaf3Fill} width={14} height={14} aria-hidden /> {item.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {prerequisites.length > 0 ? (
          <section className="panel-doc__block" aria-label="선행 작업">
            <h2 className="panel-doc__h2">선행 작업</h2>
            <div className="panel-doc__chips">
              {prerequisites.map((item) => (
                <button key={item.label} type="button" className="panel-doc__chip" onClick={item.onNavigate}>
                  {item.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {followups.length > 0 ? (
          <section className="panel-doc__block" aria-label="후속 작업">
            <h2 className="panel-doc__h2">후속 작업</h2>
            <div className="panel-doc__chips">
              {followups.map((item) => (
                <button key={item.label} type="button" className="panel-doc__chip" onClick={item.onNavigate}>
                  {item.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {notes ? (
          <section className="panel-doc__block" aria-label="메모">
            <h2 className="panel-doc__h2">메모</h2>
            <p className="panel-doc__text">{notes}</p>
          </section>
        ) : null}
      </div>
    </article>
  );
}

/**
 * 우측 패널 식물 상세 — 스타일: panel-doc (panel-view.css)
 */
export function PlantDetailLayout({ plant, zoneName, imageUrl = null, onZoneNavigate }) {
  const status = plantStatusLabel(plant.status);
  const bloom =
    plant.bloom_season && plant.bloom_season !== '-' ? plant.bloom_season : null;
  const qty = plant.quantity != null && plant.quantity !== '' ? String(plant.quantity) : null;
  const notes = plant.notes?.trim() || '';
  const category = plant.category && plant.category !== '-' ? plant.category : null;
  const species = plant.species && plant.species !== '-' ? plant.species : null;
  const speciesBadge = species || '종 미입력';

  return (
    <article className="panel-doc">
      <div className="panel-doc__cover panel-doc__cover--plant">
        <div className="panel-doc__cover-inner">
          {imageUrl ? (
            <img className="panel-doc__img" src={imageUrl} alt="" />
          ) : (
            <div className="panel-doc__empty" aria-hidden>
              <span className="panel-doc__icon">
                <Icon icon={leaf3Fill} width={28} height={28} />
              </span>
              <span className="panel-doc__empty-cap">이미지 없음</span>
            </div>
          )}
          <button
            type="button"
            className="panel-doc__upload"
            aria-label="사진 업로드"
            disabled
            title="사진 업로드"
          >
            <Icon icon={imageAddLine} width={22} height={22} aria-hidden />
          </button>
        </div>
      </div>

      <div className="panel-doc__body">
        <h1 className="panel-doc__h1">{plant.name}</h1>

        <div className="panel-doc__badges">
          <span className="panel-doc__badge panel-doc__badge--ok">{status}</span>
          <span className="panel-doc__badge panel-doc__badge--accent">{speciesBadge}</span>
        </div>

        {category ? (
          <dl className="panel-doc__dl">
            <dt>카테고리</dt>
            <dd>{category}</dd>
          </dl>
        ) : null}

        <dl className="panel-doc__dl panel-doc__dl--ruled">
          {species ? (
            <>
              <dt>종</dt>
              <dd>{species}</dd>
            </>
          ) : null}
          {zoneName ? (
            <>
              <dt>위치</dt>
              <dd>
                {onZoneNavigate ? (
                  <button type="button" className="panel-doc__link" onClick={onZoneNavigate}>
                    <Icon icon={mapLine} width={14} height={14} aria-hidden /> {zoneName}
                  </button>
                ) : (
                  <>
                    <Icon icon={mapLine} width={14} height={14} aria-hidden /> {zoneName}
                  </>
                )}
              </dd>
            </>
          ) : null}
          {bloom ? (
            <>
              <dt>개화시기</dt>
              <dd>{bloom}</dd>
            </>
          ) : null}
          {qty ? (
            <>
              <dt>개체 수</dt>
              <dd>{qty}</dd>
            </>
          ) : null}
        </dl>

        {notes ? (
          <section className="panel-doc__block" aria-label="메모">
            <h2 className="panel-doc__h2">메모</h2>
            <p className="panel-doc__text">{notes}</p>
          </section>
        ) : null}
      </div>
    </article>
  );
}
