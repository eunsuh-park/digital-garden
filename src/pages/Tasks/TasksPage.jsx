import { useEffect, useMemo, useState } from 'react';
import { fetchLocations, fetchPlants, fetchTasks } from '../../api/notionApi';
import { parseLocationsResponse } from '../Locations/notionSchema';
import { parseTasksResponse } from './notionSchema';
import { parsePlantsResponse } from '../Plants/notionSchema';
import FullPage from '../../components/FullPage/FullPage';
import ErrorState from '../../components/ErrorState/ErrorState';
import TaskCard from '../../components/TaskCard';
import './TasksPage.css';

/**
 * PG-02, PG-08: 할 일 전체 페이지 - 금주 할 일 조회와 관리
 * FN-09: 기본 조회 (완료 제외, 예정일 임박순, 섹션 그룹)
 */
export default function TasksPage() {
  const [locations, setLocations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [locationsRes, tasksRes, plantsRes] = await Promise.all([
          fetchLocations(),
          fetchTasks(),
          fetchPlants(),
        ]);
        if (cancelled) return;

        const tasksList = parseTasksResponse(tasksRes);
        const locationsList = parseLocationsResponse(locationsRes);
        const plantsList = parsePlantsResponse(plantsRes);
        setTasks(tasksList);
        setLocations(locationsList);
        setPlants(plantsList);
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
  const locationMap = useMemo(() => Object.fromEntries(locations.map((l) => [l.id, l])), [locations]);
  const plantMap = useMemo(() => Object.fromEntries(plants.map((p) => [p.id, p])), [plants]);
  const taskTitleMap = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t.title])), [tasks]);
  const hasContent = pendingTasks.length > 0;

  function toCardStatus(status) {
    if (status === 'completed') return '완료';
    if (status === 'progress') return '진행 중';
    return '시작 전';
  }

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
        Notion DB: Locations(구역) · 할 일 · 식물
      </p>
      <div className="tasks-page__cards">
        {pendingTasks.map((t) => {
          const location = t.section_id ? locationMap[t.section_id] : null;
          const targetPlantNames = (t.target_plant_ids || [])
            .map((pid) => plantMap[pid]?.name)
            .filter(Boolean);
          const prereqTitles = (t.prereq_task_ids || [])
            .map((id) => taskTitleMap[id] || '(제목 없음)')
            .filter(Boolean);
          const followupTitles = (t.followup_task_ids || [])
            .map((id) => taskTitleMap[id] || '(제목 없음)')
            .filter(Boolean);
          const cardTask = {
            Title: t.title,
            Task_Type: t.task_type ?? 'Observation',
            Status: toCardStatus(t.status),
            Difficulty: t.difficulty ?? 'Easy',
            Scheduled_Date: t.scheduled_date || t.due_date,
            Estimated_Duration: t.estimated_duration || '–',
            Target_Plant: targetPlantNames,
            Prerequisites: prereqTitles,
            Followups: followupTitles,
            Notes: t.notes || (location ? `구역: ${location.name}` : ''),
          };

          return <TaskCard key={t.id} task={cardTask} />;
        })}
      </div>
    </FullPage>
  );
}
