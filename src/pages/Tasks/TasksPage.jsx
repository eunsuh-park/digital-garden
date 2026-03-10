import { TASKS, SECTIONS } from '../../data/mockData';
import FullPage from '../../components/FullPage/FullPage';

/**
 * PG-02, PG-08: 할 일 전체 페이지 - 금주 할 일 조회와 관리
 * FN-09: 기본 조회 (완료 제외, 예정일 임박순, 섹션 그룹)
 */
export default function TasksPage() {
  const pendingTasks = TASKS.filter((t) => t.status !== 'completed');
  const tasksBySection = {};
  SECTIONS.forEach((s) => {
    tasksBySection[s.id] = pendingTasks
      .filter((t) => t.section_id === s.id)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  });

  return (
    <FullPage
      title="이번 주 할 일"
      subtitle="완료 제외, 예정일 순"
      emptyMessage={pendingTasks.length === 0 ? '이번 주 할 일이 없습니다.' : undefined}
    >
      <div className="full-page__list">
        {SECTIONS.map((section) => {
          const tasks = tasksBySection[section.id] || [];
          if (tasks.length === 0) return null;

          return (
            <section key={section.id} className="full-page__group">
              <h2 className="full-page__group-title">
                <span
                  className="full-page__group-color"
                  style={{ background: section.color_token }}
                />
                {section.name}
              </h2>
              <ul className="full-page__item-list">
                {tasks.map((task) => (
                  <li key={task.id} className="full-page__item">
                    <span
                      className={`full-page__status full-page__status--${task.status}`}
                    >
                      {task.status === 'progress' ? '진행중' : '예정'}
                    </span>
                    <span className="full-page__item-title">{task.title}</span>
                    <span className="full-page__item-meta">{task.due_date}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </FullPage>
  );
}
