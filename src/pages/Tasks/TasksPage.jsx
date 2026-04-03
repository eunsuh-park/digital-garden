import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import arrowUpLine from '@iconify-icons/mingcute/arrow-up-line';
import arrowDownLine from '@iconify-icons/mingcute/arrow-down-line';
import addLine from '@iconify-icons/mingcute/add-line';
import { fetchTasks, updateTask } from '@/shared/api/notionApi';
import { parseTasksResponse, TASK_TYPE_LABEL_KO } from '@/entities/task/lib/notion-schema';
import FullPage from '@/shared/ui/full-page/FullPage';
import FullPageFilter from '@/shared/ui/full-page/FullPageFilter';
import FullPageSorter from '@/shared/ui/full-page/FullPageSorter';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import TaskCard from '@/shared/ui/task-card/TaskCard';
import { useZones } from '@/app/providers/ZonesContext';
import { useMapPanelDetail } from '@/app/providers/MapPanelDetailContext';
import { useTasksPanelUi, TASKS_PANEL_DEFAULT_SORT } from '@/app/providers/TasksPanelUiContext';
import { isTaskOverdue } from '@/shared/lib/taskDates';
import './TasksPage.css';

const TASKS_FILTERS = [
  { key: 'status', label: '상태', options: [{ value: 'progress', label: '진행 중' }, { value: 'pending', label: '시작 전' }] },
];

const TASKS_SORT_OPTIONS = [
  { value: 'due_date', label: '예정일' },
  { value: 'task_type', label: '작업 유형' },
];

function taskTypeGroupKey(task) {
  const k = task.task_type && String(task.task_type).trim();
  if (!k) return 'Observation';
  return k;
}

function taskTypeGroupLabel(typeKey) {
  return TASK_TYPE_LABEL_KO[typeKey] || typeKey;
}

/**
 * Task_Type별 아코디언 — 그룹은 task 개수 많은 순, 0건 타입은 미표시
 */
function TasksTypeAccordion({ tasks, renderCard }) {
  const [expanded, setExpanded] = useState(() => new Set());

  const { sortedKeys, groupMap } = useMemo(() => {
    const m = new Map();
    for (const t of tasks) {
      const k = taskTypeGroupKey(t);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(t);
    }
    const keys = [...m.keys()].sort((a, b) => {
      const ca = m.get(a)?.length ?? 0;
      const cb = m.get(b)?.length ?? 0;
      if (cb !== ca) return cb - ca;
      return taskTypeGroupLabel(a).localeCompare(taskTypeGroupLabel(b), 'ko');
    });
    return { sortedKeys: keys, groupMap: m };
  }, [tasks]);

  useEffect(() => {
    setExpanded(new Set(sortedKeys));
  }, [sortedKeys]);

  const toggle = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (tasks.length === 0) {
    return <p className="tasks-embedded__empty">이번 주 할 일이 없습니다.</p>;
  }

  return (
    <div className="tasks-embedded">
      {sortedKeys.map((key) => {
        const items = groupMap.get(key) || [];
        if (items.length === 0) return null;
        const label = taskTypeGroupLabel(key);
        const isOpen = expanded.has(key);

        return (
          <section key={key} className="tasks-embedded__group">
            <button
              type="button"
              className="tasks-embedded__group-header"
              onClick={() => toggle(key)}
              aria-expanded={isOpen}
            >
              <span className="tasks-embedded__group-title">{label}</span>
              <span className="tasks-embedded__group-count">{items.length}</span>
              <Icon
                icon={isOpen ? arrowUpLine : arrowDownLine}
                width={18}
                height={18}
                className="tasks-embedded__group-chevron"
                aria-hidden
              />
            </button>
            {isOpen && (
              <div className="tasks-embedded__grid" aria-label={`${label} 할 일`}>
                {items.map((t) => renderCard(t))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

/**
 * PG-02, PG-08: 할 일 전체 페이지
 * variant="embedded": 하단 시트
 */
export default function TasksPage({ variant = 'default' }) {
  const { openTaskDetail, openTaskCreate } = useMapPanelDetail();
  const panelUi = useTasksPanelUi();
  const ctx = useZones();
  const isEmbedded = variant === 'embedded';

  const [localFilter, setLocalFilter] = useState({});
  const [localSort, setLocalSort] = useState(TASKS_PANEL_DEFAULT_SORT);
  const [localOverdueOnly, setLocalOverdueOnly] = useState(false);

  const filterValues = isEmbedded && panelUi ? panelUi.filterValues : localFilter;
  const setFilterValues = isEmbedded && panelUi ? panelUi.setFilterValues : setLocalFilter;
  const sortValue = isEmbedded && panelUi ? panelUi.sortValue : localSort;
  const setSortValue = isEmbedded && panelUi ? panelUi.setSortValue : setLocalSort;
  const overdueOnly = isEmbedded && panelUi ? panelUi.overdueOnly : localOverdueOnly;
  const setOverdueOnly = isEmbedded && panelUi ? panelUi.setOverdueOnly : setLocalOverdueOnly;
  const resetPanelFilters = isEmbedded && panelUi ? panelUi.resetFilters : null;

  const defaultSort = isEmbedded && panelUi ? panelUi.defaultSort : TASKS_PANEL_DEFAULT_SORT;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [hiddenIds, setHiddenIds] = useState(() => new Set());

  const loadStandalone = useCallback(async (options = {}) => {
    const silent = options.silent === true;
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const tasksRes = await fetchTasks();
      const tasksList = parseTasksResponse(tasksRes);
      setTasks(tasksList);
    } catch (e) {
      setError(e.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isEmbedded) return undefined;
    loadStandalone();
    return undefined;
  }, [isEmbedded, loadStandalone]);

  const tasksData = isEmbedded ? ctx.tasks : tasks;
  const loadingData = isEmbedded ? ctx.loading : loading;
  const errorData = isEmbedded ? ctx.error : error;

  const pendingTasks = useMemo(() => {
    let list = tasksData.filter((t) => t.status !== 'completed');
    list = list.filter((t) => !hiddenIds.has(t.id));
    if (filterValues.status) list = list.filter((t) => t.status === filterValues.status);
    if (overdueOnly) list = list.filter((t) => isTaskOverdue(t));

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
  }, [tasksData, filterValues, sortValue, overdueOnly, hiddenIds]);

  const overdueCount = useMemo(() => {
    let list = tasksData.filter((t) => t.status !== 'completed');
    list = list.filter((t) => !hiddenIds.has(t.id));
    if (filterValues.status) list = list.filter((t) => t.status === filterValues.status);
    return list.filter((t) => isTaskOverdue(t)).length;
  }, [tasksData, filterValues.status, hiddenIds]);

  const showTypeGroups = useMemo(() => {
    if (overdueOnly) return false;
    if (filterValues.status) return false;
    if (sortValue.field !== 'due_date' || sortValue.dir !== 'asc') return false;
    return true;
  }, [overdueOnly, filterValues.status, sortValue.field, sortValue.dir]);

  const hasContent = pendingTasks.length > 0;

  function toCardStatus(status) {
    if (status === 'completed') return '완료';
    if (status === 'progress') return '진행 중';
    return '시작 전';
  }

  const handleCompleteTask = async (t) => {
    setCompletingId(t.id);
    setHiddenIds((prev) => new Set(prev).add(t.id));
    try {
      await updateTask(t.id, { status_name: '완료' });
      if (isEmbedded) await ctx.reload();
      else await loadStandalone({ silent: true });
      setHiddenIds((prev) => {
        const n = new Set(prev);
        n.delete(t.id);
        return n;
      });
    } catch (e) {
      setHiddenIds((prev) => {
        const n = new Set(prev);
        n.delete(t.id);
        return n;
      });
    } finally {
      setCompletingId(null);
    }
  };

  const renderTaskCard = (t) => {
    const cardTask = {
      Title: t.title,
      Task_Type: t.task_type ?? 'Observation',
      Status: t.notion_status?.trim() || toCardStatus(t.status),
      Scheduled_Date: t.scheduled_date || t.due_date,
    };
    const overdue = isTaskOverdue(t);

    return (
      <TaskCard
        key={t.id}
        task={cardTask}
        overdue={overdue}
        onOpenDetail={variant === 'embedded' ? () => openTaskDetail(t) : undefined}
        onToggleComplete={variant === 'embedded' ? () => handleCompleteTask(t) : undefined}
        completingToggle={completingId === t.id}
      />
    );
  };

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
      <div className={variant === 'embedded' ? 'tasks-page tasks-page--embedded-with-footer' : 'tasks-page tasks-page--standalone'}>
        <div className="tasks-page__scroll">
          {variant !== 'embedded' && (
            <p className="notion-db-badge" aria-label="연동된 Notion DB">
              Notion DB: Zones(구역) · 할 일 · 식물
            </p>
          )}

          <div className="tasks-page__sticky-top">
            {overdueCount > 0 ? (
              <button
                type="button"
                className={`tasks-page__overdue-chip ${overdueOnly ? 'tasks-page__overdue-chip--active' : ''}`}
                onClick={() => setOverdueOnly((v) => !v)}
                aria-pressed={overdueOnly}
              >
                예정일 지남 <strong>{overdueCount}</strong>건
                {overdueOnly ? <span className="tasks-page__overdue-chip-hint"> (탭하여 전체)</span> : null}
              </button>
            ) : null}

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
                  if (resetPanelFilters) resetPanelFilters();
                  else {
                    setLocalFilter({});
                    setLocalSort(TASKS_PANEL_DEFAULT_SORT);
                    setLocalOverdueOnly(false);
                  }
                }}
              />
              <FullPageSorter
                options={TASKS_SORT_OPTIONS}
                value={sortValue}
                active={sortValue.field !== defaultSort.field || sortValue.dir !== defaultSort.dir}
                onChange={(field, dir) => setSortValue({ field, dir })}
              />
            </div>
          </div>

          {!hasContent ? (
            <p className="tasks-page__empty-inline">이번 주 할 일이 없습니다.</p>
          ) : showTypeGroups ? (
            <TasksTypeAccordion tasks={pendingTasks} renderCard={renderTaskCard} />
          ) : (
            <div className="tasks-page__cards">{pendingTasks.map((t) => renderTaskCard(t))}</div>
          )}
        </div>
        {variant === 'embedded' && (
          <div className="tasks-page__footer">
            <button type="button" className="tasks-page__add-task-btn" onClick={() => openTaskCreate()}>
              <Icon icon={addLine} className="tasks-page__add-task-icon" aria-hidden />
              할 일 추가
            </button>
          </div>
        )}
      </div>
    </FullPage>
  );
}
