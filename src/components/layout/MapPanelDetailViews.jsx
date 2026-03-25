import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import TaskCard from '../TaskCard';
import PlantDetailLayout from '../PlantDetailLayout/PlantDetailLayout';
import { useLocations } from '../../context/LocationsContext';
import { useMapPanelDetail } from '../../context/MapPanelDetailContext';
import { updateLocation } from '../../api/notionApi';
import './MapPanelDetailViews.css';

function toCardStatus(status) {
  if (status === 'completed') return '완료';
  if (status === 'progress') return '진행 중';
  return '시작 전';
}

/** @param {{ location: object, onBack: () => void }} props */
export function MapPanelLocationDetail({ location, onBack }) {
  const { locations, tasks, plants, reload } = useLocations();
  const { openPlantDetail, openTaskDetail } = useMapPanelDetail();

  const currentLocation = useMemo(() => {
    return locations.find((l) => l.id === location?.id) || location;
  }, [locations, location]);

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(currentLocation?.name || '');
  const [draftDescription, setDraftDescription] = useState(currentLocation?.description || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const { sectionTasks, sectionPlants } = useMemo(() => {
    const sid = currentLocation?.id;
    const pending = tasks.filter((t) => t.section_id === sid && t.status !== 'completed');
    const pls = plants.filter((p) => p.section_id === sid);
    return { sectionTasks: pending, sectionPlants: pls };
  }, [tasks, plants, currentLocation?.id]);

  const description = useMemo(() => {
    const colorHint = currentLocation?.color_label ? `색상: ${currentLocation.color_label}.` : '';
    return `${currentLocation?.name} 구역입니다. ${colorHint} 할 일 ${sectionTasks.length}건, 식물 ${sectionPlants.length}종이 이 구역에 연결되어 있습니다.`.trim();
  }, [currentLocation?.name, currentLocation?.color_label, sectionTasks.length, sectionPlants.length]);

  const previewPlants = sectionPlants.slice(0, 9);

  useEffect(() => {
    if (isEditing) return;
    setDraftName(currentLocation?.name || '');
    setDraftDescription(currentLocation?.description || '');
    setSaveError(null);
  }, [currentLocation?.id, isEditing, currentLocation?.name, currentLocation?.description]);

  const viewDescription = useMemo(() => {
    const d = (currentLocation?.description || '').trim();
    return d ? d : description;
  }, [currentLocation?.description, description]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const name = (draftName || '').trim();
      const descriptionValue = (draftDescription || '').trim();
      await updateLocation(currentLocation.id, { name, description: descriptionValue });
      await reload();
      setIsEditing(false);
    } catch (e) {
      setSaveError(e.message || '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="map-panel-detail">
      <header className="map-panel-detail__toolbar">
        <button type="button" className="map-panel-detail__icon-btn" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="map-panel-detail__toolbar-title">정보</span>
        {isEditing ? (
          <span className="map-panel-detail__toolbar-spacer" aria-hidden />
        ) : (
          <button
            type="button"
            className="map-panel-detail__icon-btn"
            onClick={() => setIsEditing(true)}
            aria-label="편집"
            title="편집"
          >
            ✎
          </button>
        )}
      </header>

      <div className="map-panel-detail__scroll">
        {!isEditing ? (
          <>
            <h1 className="map-panel-detail__page-title">{currentLocation.name}</h1>
            {currentLocation.color_label ? (
              <p className="map-panel-detail__meta">{currentLocation.color_label}</p>
            ) : null}
            <p className="map-panel-detail__desc">{viewDescription}</p>

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
          </>
        ) : (
          <div className="location-edit">
            <div className="location-edit__field">
              <label className="location-edit__label" htmlFor="location-edit-name">
                Name
              </label>
              <input
                id="location-edit-name"
                className="location-edit__input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>

            <div className="location-edit__field">
              <label className="location-edit__label" htmlFor="location-edit-description">
                Description
              </label>
              <textarea
                id="location-edit-description"
                className="location-edit__textarea"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
              />
            </div>

            {saveError ? <p className="location-edit__error">{saveError}</p> : null}

            <div className="location-edit__actions">
              <button
                type="button"
                className="location-edit__save-btn"
                onClick={handleSave}
                disabled={saving || !draftName.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
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
