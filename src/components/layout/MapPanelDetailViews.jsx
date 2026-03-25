import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import TaskCard from '../TaskCard';
import PlantCard from '../PlantCard';
import { useLocations } from '../../context/LocationsContext';
import './MapPanelDetailViews.css';

function toCardStatus(status) {
  if (status === 'completed') return '완료';
  if (status === 'progress') return '진행 중';
  return '시작 전';
}

function toCardSpecies(plant) {
  const raw = plant.category || plant.species || '';
  if (/(나무|목|교목|관목)/.test(raw)) return '나무';
  if (/(꽃|화|개화)/.test(raw)) return '꽃';
  return '풀';
}

function toCardPlantStatus(status) {
  if (status === 'needs_care') return '관리 필요';
  if (status === 'planned') return '식재 예정';
  if (status === 'planted') return '확인됨';
  return '미확인';
}

/** @param {{ location: object, onBack: () => void }} props */
export function MapPanelLocationDetail({ location, onBack }) {
  const { tasks, plants } = useLocations();

  const { sectionTasks, sectionPlants } = useMemo(() => {
    const sid = location?.id;
    const pending = tasks.filter((t) => t.section_id === sid && t.status !== 'completed');
    const pls = plants.filter((p) => p.section_id === sid);
    return { sectionTasks: pending, sectionPlants: pls };
  }, [tasks, plants, location?.id]);

  const description = useMemo(() => {
    const zt = location.zone_type ? `구역 유형: ${location.zone_type}.` : '';
    return `${location.name} 구역입니다. ${zt} 할 일 ${sectionTasks.length}건, 식물 ${sectionPlants.length}종이 이 구역에 연결되어 있습니다.`.trim();
  }, [location.name, location.zone_type, sectionTasks.length, sectionPlants.length]);

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
        {location.zone_type ? (
          <p className="map-panel-detail__meta">{location.zone_type}</p>
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
                  {t.title}
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
                  <span className="map-panel-detail__plant-tile-inner">
                    {p.status === 'needs_care' ? (
                      <span className="map-panel-detail__plant-dot" aria-label="관리 필요" />
                    ) : null}
                    <span className="map-panel-detail__plant-tile-name">{p.name}</span>
                  </span>
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
export function MapPanelTaskDetail({ task, onBack, locationMap, plantMap, taskTitleMap }) {
  const location = task.section_id ? locationMap[task.section_id] : null;
  const targetPlantNames = (task.target_plant_ids || [])
    .map((pid) => plantMap[pid]?.name)
    .filter(Boolean);
  const prereqTitles = (task.prereq_task_ids || [])
    .map((id) => taskTitleMap[id] || '(제목 없음)')
    .filter(Boolean);
  const followupTitles = (task.followup_task_ids || [])
    .map((id) => taskTitleMap[id] || '(제목 없음)')
    .filter(Boolean);
  const cardTask = {
    Title: task.title,
    Task_Type: task.task_type ?? 'Observation',
    Status: toCardStatus(task.status),
    Difficulty: task.difficulty ?? 'Easy',
    Scheduled_Date: task.scheduled_date || task.due_date,
    Estimated_Duration: task.estimated_duration || '–',
    Target_Plant: targetPlantNames,
    Prerequisites: prereqTitles,
    Followups: followupTitles,
    Notes: task.notes || (location ? `구역: ${location.name}` : ''),
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
          <TaskCard task={cardTask} unconstrained />
        </div>
      </div>
    </div>
  );
}

/** @param {{ plant: object, onBack: () => void, locationMap: Record<string, object> }} props */
export function MapPanelPlantDetail({ plant, onBack, locationMap }) {
  const location = plant.section_id ? locationMap[plant.section_id] : null;
  const cardPlant = {
    Name: plant.name,
    Species: toCardSpecies(plant),
    SpeciesRaw: plant.species && plant.species !== '-' ? plant.species : undefined,
    Category: plant.category && plant.category !== '-' ? plant.category : undefined,
    Status: toCardPlantStatus(plant.status),
    Location: location ? [location.name] : [],
    Color: undefined,
    'Bloom Season': plant.bloom_season && plant.bloom_season !== '-' ? plant.bloom_season : undefined,
    'Pruning Season': undefined,
    'Fertilizing Season': undefined,
    Quantity: plant.quantity ?? undefined,
    Notes:
      (plant.notes && plant.notes.trim()) ||
      [plant.category && plant.category !== '-' ? `카테고리: ${plant.category}` : null, plant.species && plant.species !== '-' ? `종: ${plant.species}` : null]
        .filter(Boolean)
        .join(' · '),
  };

  return (
    <div className="map-panel-detail">
      <header className="map-panel-detail__toolbar">
        <button type="button" className="map-panel-detail__icon-btn" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="map-panel-detail__toolbar-title">식물</span>
        <span className="map-panel-detail__toolbar-spacer" aria-hidden />
      </header>
      <div className="map-panel-detail__scroll map-panel-detail__scroll--single-card">
        <div className="map-panel-detail__card-wrap map-panel-detail__card-wrap--plant">
          <PlantCard plant={cardPlant} />
        </div>
      </div>
    </div>
  );
}
