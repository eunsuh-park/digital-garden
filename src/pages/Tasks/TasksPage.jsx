import { useEffect, useMemo, useState } from 'react';
import { fetchLocations, fetchPlants, fetchTasks } from '../../api/notionApi';
import { parseLocationsResponse } from '../Locations/notionSchema';
import { parseTasksResponse } from './notionSchema';
import { parsePlantsResponse } from '../Plants/notionSchema';
import FullPage from '../../components/FullPage/FullPage';
import FullPageFilter from '../../components/FullPage/FullPageFilter';
import FullPageSorter from '../../components/FullPage/FullPageSorter';
import ErrorState from '../../components/ErrorState/ErrorState';
import TaskCard from '../../components/TaskCard';
import { useLocations } from '../../context/LocationsContext';
import { useMapPanelDetail } from '../../context/MapPanelDetailContext';
import './TasksPage.css';

const TASKS_FILTERS = [
  { key: 'status', label: '상태', options: [{ value: 'progress', label: '진행 중' }, { value: 'pending', label: '예정' }] },
  {
    key: 'task_type',
    label: '작업 유형',
    options: [
      { value: 'Pruning', label: '전정' },
      { value: 'Fertilizing', label: '비료' },
      { value: 'Propagation', label: '번식' },
      { value: 'Watering', label: '물주기' },
      { value: 'Transplanting', label: '이식' },
      { value: 'Observation', label: '관찰' },
      { value: 'Cleaning', label: '청소' },
      { value: 'Decorating', label: '꾸미기' },
      { value: 'Construction', label: '시공' },
    ],
  },
  { key: 'difficulty', label: '난이도', options: [{ value: 'Easy', label: 'Easy' }, { value: 'Medium', label: 'Medium' }, { value: 'Hard', label: 'Hard' }] },
];

const TASKS_SORT_OPTIONS = [
  { value: 'due_date', label: '예정일' },
  { value: 'task_type', label: '작업 유형' },
];

/**
 * PG-02, PG-08: 할 일 전체 페이지 - 금주 할 일 조회와 관리
 * FN-09: 기본 조회 (완료 제외, 예정일 임박순, 섹션 그룹)
 * variant="embedded": 하단 시트에 동일 UI로 삽입
 */
export default function TasksPage({ variant = 'default' }) {
  const { openTaskDetail, openTaskCreate } = useMapPanelDetail();
  const ctx = useLocations();
  const isEmbedded = variant === 'embedded';
  const [locations, setLocations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const defaultSort = { field: 'due_date', dir: 'asc' };
  const [sortValue, setSortValue] = useState(defaultSort);

  useEffect(() => {
    if (isEmbedded) return undefined;
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
    return () => {
      cancelled = true;
    };
  }, [isEmbedded]);

  const tasksData = isEmbedded ? ctx.tasks : tasks;
  const locationsData = isEmbedded ? ctx.locations : locations;
  const plantsData = isEmbedded ? ctx.plants : plants;
  const loadingData = isEmbedded ? ctx.loading : loading;
  const errorData = isEmbedded ? ctx.error : error;

  const pendingTasks = useMemo(() => {
    let list = tasksData.filter((t) => t.status !== 'completed');
    if (filterValues.status) list = list.filter((t) => t.status === filterValues.status);
    if (filterValues.task_type) list = list.filter((t) => (t.task_type ?? '') === filterValues.task_type);
    if (filterValues.difficulty) list = list.filter((t) => (t.difficulty ?? '') === filterValues.difficulty);
    const field = sortValue.field || 'due_date';
    const dir = sortValue.dir === 'desc' ? -1 : 1;
    list = [...list].sort((a, b) => {
      if (field === 'due_date') {
        const da = a.scheduled_date || a.due_date ? new Date(a.scheduled_date || a.due_date) : null;
        const db = b.scheduled_date || b.due_date ? new Date(b.scheduled_date || b.due_date) : null;
        if (!da) return 1;
        if (!db) return -1;
        return (da - db) * dir;
      }
      if (field === 'task_type') {
        const va = (a.task_type || '').localeCompare(b.task_type || '', 'ko');
        return va * dir;
      }
      return 0;
    });
    return list;
  }, [tasksData, filterValues, sortValue]);
  const locationMap = useMemo(
    () => Object.fromEntries(locationsData.map((l) => [l.id, l])),
    [locationsData]
  );
  const plantMap = useMemo(() => Object.fromEntries(plantsData.map((p) => [p.id, p])), [plantsData]);
  const taskTitleMap = useMemo(() => Object.fromEntries(tasksData.map((t) => [t.id, t.title])), [tasksData]);
  const hasContent = pendingTasks.length > 0;

  function toCardStatus(status) {
    if (status === 'completed') return '완료';
    if (status === 'progress') return '진행 중';
    return '시작 전';
  }

  if (loadingData) {
    return (
      <FullPage variant={variant} title="이번 주 할 일" subtitle="로딩 중...">
        <p className="tasks-page__loading">데이터를 불러오는 중입니다.</p>
      </FullPage>
    );
  }

  if (errorData) {
    return (
      <FullPage variant={variant} title="이번 주 할 일">
        <ErrorState variant="error" message={errorData} showHomeLink />
      </FullPage>
    );
  }

  return (
    <FullPage variant={variant} title="이번 주 할 일" subtitle="완료 제외, 예정일 순">
      <div className={variant === 'embedded' ? 'tasks-page tasks-page--embedded-with-footer' : 'tasks-page'}>
        <div className="tasks-page__scroll">
          {variant !== 'embedded' && (
            <p className="notion-db-badge" aria-label="연동된 Notion DB">
              Notion DB: Locations(구역) · 할 일 · 식물
            </p>
          )}
          <div
            className={
              variant === 'embedded' ? 'tasks-page__controls tasks-page__controls--embedded' : 'tasks-page__controls'
            }
          >
            <FullPageFilter
              filters={TASKS_FILTERS}
              values={filterValues}
              onChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value || undefined }))}
              onReset={() => {
                setFilterValues({});
                setSortValue(defaultSort);
              }}
            />
            <FullPageSorter
              options={TASKS_SORT_OPTIONS}
              value={sortValue}
              active={sortValue.field !== defaultSort.field || sortValue.dir !== defaultSort.dir}
              onChange={(field, dir) => setSortValue({ field, dir })}
            />
          </div>
          {!hasContent ? (
            <p className="tasks-page__empty-inline">이번 주 할 일이 없습니다.</p>
          ) : (
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

                return (
                  <TaskCard
                    key={t.id}
                    task={cardTask}
                    onOpenDetail={variant === 'embedded' ? () => openTaskDetail(t) : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
        {variant === 'embedded' && (
          <div className="tasks-page__footer">
            <button type="button" className="tasks-page__add-task-btn" onClick={() => openTaskCreate()}>
              <span className="tasks-page__add-task-icon" aria-hidden>
                +
              </span>
              할 일 추가
            </button>
          </div>
        )}
      </div>
    </FullPage>
  );
}
