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

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const tasksBySection = {};
  locations.forEach((s) => {
    tasksBySection[s.id] = pendingTasks
      .filter((t) => t.section_id === s.id)
      .sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
  });

  const sectionOrder = locations;
  const hasContent = sectionOrder.some((s) => (tasksBySection[s.id] || []).length > 0);

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
      <div className="full-page__list">
        {sectionOrder.map((section) => {
          const sectionTasks = tasksBySection[section.id] || [];
          if (sectionTasks.length === 0) return null;

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
                {sectionTasks.map((task) => (
                  <li key={task.id} className="full-page__item">
                    <span
                      className={`full-page__status full-page__status--${task.status}`}
                    >
                      {task.status === 'progress' ? '진행중' : '예정'}
                    </span>
                    <span className="full-page__item-title">{task.title}</span>
                    <span className="full-page__item-meta">{task.due_date || '-'}</span>
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
