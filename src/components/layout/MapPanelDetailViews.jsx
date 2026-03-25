import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import TaskCard from '../TaskCard';
import PlantDetailLayout from '../PlantDetailLayout/PlantDetailLayout';
import { useLocations } from '../../context/LocationsContext';
import { useMapPanelDetail } from '../../context/MapPanelDetailContext';
import './MapPanelDetailViews.css';

function toCardStatus(status) {
  if (status === 'completed') return '완료';
  if (status === 'progress') return '진행 중';
  return '시작 전';
}

/** @param {{ location: object, onBack: () => void }} props */
export function MapPanelLocationDetail({ location, onBack }) {
  const { tasks, plants } = useLocations();
  const { openPlantDetail, openTaskDetail } = useMapPanelDetail();

  const { sectionTasks, sectionPlants } = useMemo(() => {
    const sid = location?.id;
    const pending = tasks.filter((t) => t.section_id === sid && t.status !== 'completed');
    const pls = plants.filter((p) => p.section_id === sid);
    return { sectionTasks: pending, sectionPlants: pls };
  }, [tasks, plants, location?.id]);

  const description = useMemo(() => {
    const colorHint = location.color_label ? `색상: ${location.color_label}.` : '';
    return `${location.name} 구역입니다. ${colorHint} 할 일 ${sectionTasks.length}건, 식물 ${sectionPlants.length}종이 이 구역에 연결되어 있습니다.`.trim();
  }, [location.name, location.color_label, sectionTasks.length, sectionPlants.length]);

  const previewPlants = sectionPlants.slice(0, 9);

  return (
    <div className="map-panel-detail">
      <header className="map-panel-detail__toolbar">
        <button type="button" className="map-panel-detail__icon-btn" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="map-panel-detail__toolbar-title">정보</span>
        <span className="map-panel-detail__toolbar-spacer" aria-hidden />
      </header>

      <div className="map-panel-detail__scroll">
        <h1 className="map-panel-detail__page-title">{location.name}</h1>
        {location.color_label ? (
          <p className="map-panel-detail__meta">{location.color_label}</p>
        ) : null}
        <p className="map-panel-detail__desc">{description}</p>

        <section className="map-panel-detail__section">
          <h2 className="map-panel-detail__section-title">금주 할 일</h2>
          {sectionTasks.length === 0 ? (
            <p className="map-panel-detail__empty">없습니다</p>
          ) : (
            <ul className="map-panel-detail__task-list">
              {sectionTasks.map((t) => (
                <li key={t.id} className="map-panel-detail__task-li">
                  <button
                    type="button"
                    className="map-panel-detail__task-li-btn"
                    onClick={() => openTaskDetail(t, { push: true })}
                  >
                    {t.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="map-panel-detail__section">
          <div className="map-panel-detail__section-head">
            <h2 className="map-panel-detail__section-title">식물 {sectionPlants.length}</h2>
          </div>
          {previewPlants.length === 0 ? (
            <p className="map-panel-detail__empty">등록된 식물이 없습니다</p>
          ) : (
            <ul className="map-panel-detail__plant-grid" aria-label="식물 미리보기">
              {previewPlants.map((p) => (
                <li key={p.id} className="map-panel-detail__plant-tile">
                  <button
                    type="button"
                    className="map-panel-detail__plant-tile-inner map-panel-detail__plant-tile-btn"
                    onClick={() => openPlantDetail(p, { push: true })}
                  >
                    {p.status === 'needs_care' ? (
                      <span className="map-panel-detail__plant-dot" aria-label="관리 필요" />
                    ) : null}
                    <span className="map-panel-detail__plant-tile-name">{p.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/** @param {{ task: object, onBack: () => void, locationMap: Record<string, object>, plantMap: Record<string, object>, taskTitleMap: Record<string, string> }} props */
export function MapPanelTaskDetail({ task, onBack, locationMap, plantMap, taskTitleMap: _taskTitleMap }) {
  const { tasks: allTasks } = useLocations();
  const { openLocationDetail, openPlantDetail, openTaskDetail } = useMapPanelDetail();
  const location = task.section_id ? locationMap[task.section_id] : null;
  const targetPlantNames = (task.target_plant_ids || [])
    .map((pid) => plantMap[pid]?.name)
    .filter(Boolean);
  const prereqTitles = (task.prereq_task_ids || [])
    .map((id) => _taskTitleMap[id] || '(제목 없음)')
    .filter(Boolean);
  const followupTitles = (task.followup_task_ids || [])
    .map((id) => _taskTitleMap[id] || '(제목 없음)')
    .filter(Boolean);

  const plantNavLinks = useMemo(() => {
    return (task.target_plant_ids || [])
      .map((pid) => {
        const p = plantMap[pid];
        if (!p) return null;
        return { label: p.name, onNavigate: () => openPlantDetail(p, { push: true }) };
      })
      .filter(Boolean);
  }, [task.target_plant_ids, plantMap, openPlantDetail]);

  const prerequisiteNavLinks = useMemo(() => {
    return (task.prereq_task_ids || [])
      .map((id) => {
        const t = allTasks.find((x) => x.id === id);
        if (!t) return null;
        return { label: t.title || '(제목 없음)', onNavigate: () => openTaskDetail(t, { push: true }) };
      })
      .filter(Boolean);
  }, [task.prereq_task_ids, allTasks, openTaskDetail]);

  const followupNavLinks = useMemo(() => {
    return (task.followup_task_ids || [])
      .map((id) => {
        const t = allTasks.find((x) => x.id === id);
        if (!t) return null;
        return { label: t.title || '(제목 없음)', onNavigate: () => openTaskDetail(t, { push: true }) };
      })
      .filter(Boolean);
  }, [task.followup_task_ids, allTasks, openTaskDetail]);

  const locationLink = location
    ? { label: location.name, onNavigate: () => openLocationDetail(location, { push: true }) }
    : undefined;

  const cardTask = {
    Title: task.title,
    Task_Type: task.task_type ?? 'Observation',
    Status: toCardStatus(task.status),
    Difficulty: task.difficulty ?? 'Easy',
    Scheduled_Date: task.scheduled_date || task.due_date,
    Estimated_Duration: task.estimated_duration || '–',
    Target_Plant: targetPlantNames,
    Prerequisites: prerequisiteNavLinks.length ? [] : prereqTitles,
    Followups: followupNavLinks.length ? [] : followupTitles,
    Notes:
      task.notes?.trim() ||
      (locationLink ? '' : location ? `구역: ${location.name}` : ''),
  };

  return (
    <div className="map-panel-detail">
      <header className="map-panel-detail__toolbar">
        <button type="button" className="map-panel-detail__icon-btn" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="map-panel-detail__toolbar-title">할 일</span>
        <span className="map-panel-detail__toolbar-spacer" aria-hidden />
      </header>
      <div className="map-panel-detail__scroll map-panel-detail__scroll--single-card">
        <div className="map-panel-detail__card-wrap">
          <TaskCard
            task={cardTask}
            unconstrained
            locationLink={locationLink}
            plantLinks={plantNavLinks.length ? plantNavLinks : undefined}
            taskLinkGroups={{
              prerequisites: prerequisiteNavLinks.length ? prerequisiteNavLinks : undefined,
              followups: followupNavLinks.length ? followupNavLinks : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** @param {{ plant: object, onBack: () => void, locationMap: Record<string, object> }} props */
export function MapPanelPlantDetail({ plant, onBack, locationMap }) {
  const { openLocationDetail } = useMapPanelDetail();
  const location = plant.section_id ? locationMap[plant.section_id] : null;

  return (
    <div className="map-panel-detail">
      <header className="map-panel-detail__toolbar">
        <button type="button" className="map-panel-detail__icon-btn" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="map-panel-detail__toolbar-title">식물</span>
        <span className="map-panel-detail__toolbar-spacer" aria-hidden />
      </header>
      <div className="map-panel-detail__scroll map-panel-detail__scroll--plant-detail">
        <PlantDetailLayout
          plant={plant}
          locationName={location?.name ?? null}
          onLocationNavigate={
            location ? () => openLocationDetail(location, { push: true }) : undefined
          }
        />
      </div>
    </div>
  );
}
