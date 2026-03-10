import { useEffect, useState } from 'react';
import { fetchLocations, fetchTasks } from '../../api/notionApi';
import { parseLocationsResponse } from '../Locations/notionSchema';
import { parseTasksResponse } from './notionSchema';
import FullPage from '../../components/FullPage/FullPage';
import ErrorState from '../../components/ErrorState/ErrorState';
import './TasksPage.css';

/**
 * PG-02, PG-08: 할 일 전체 페이지 - 금주 할 일 조회와 관리
 * FN-09: 기본 조회 (완료 제외, 예정일 임박순, 섹션 그룹)
 */
export default function TasksPage() {
  const [locations, setLocations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [locationsRes, tasksRes] = await Promise.all([
          fetchLocations(),
          fetchTasks(),
        ]);
        if (cancelled) return;

        const tasksList = parseTasksResponse(tasksRes);
        const locationsList = parseLocationsResponse(locationsRes);
        setTasks(tasksList);
        setLocations(locationsList);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const pendingTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
  const locationMap = Object.fromEntries(locations.map((l) => [l.id, l]));
  const hasContent = pendingTasks.length > 0;

  if (loading) {
    return (
      <FullPage title="이번 주 할 일" subtitle="로딩 중...">
        <p className="tasks-page__loading">데이터를 불러오는 중입니다.</p>
      </FullPage>
    );
  }

  if (error) {
    return (
      <FullPage title="이번 주 할 일">
        <ErrorState variant="error" message={error} showHomeLink />
      </FullPage>
    );
  }

  return (
    <FullPage
      title="이번 주 할 일"
      subtitle="완료 제외, 예정일 순"
      emptyMessage={!hasContent ? '이번 주 할 일이 없습니다.' : undefined}
    >
      <p className="notion-db-badge" aria-label="연동된 Notion DB">
        Notion DB: Locations(구역) · 할 일
      </p>
      <div className="full-page__list full-page__list--compact full-page__list--cards">
        {pendingTasks.map((task) => {
          const location = task.section_id ? locationMap[task.section_id] : null;
          return (
            <article key={task.id} className="full-page__card">
              <span
                className="full-page__group-color full-page__group-color--large"
                style={{ background: location?.color_token || 'var(--color-border)' }}
                aria-hidden
              />
              <div className="full-page__card-body">
                <div className="full-page__card-row">
                  <span
                    className={`full-page__status full-page__status--${task.status}`}
                  >
                    {task.status === 'progress' ? '진행중' : '예정'}
                  </span>
                  <span className="full-page__card-name">{task.title}</span>
                </div>
                <p className="full-page__card-meta">
                  {task.due_date || '날짜 없음'}
                  {location ? ` · ${location.name}` : ''}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </FullPage>
  );
}
