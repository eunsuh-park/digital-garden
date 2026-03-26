import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import TaskDetailLayout from '../TaskDetailLayout/TaskDetailLayout';
import PlantDetailLayout from '../PlantDetailLayout/PlantDetailLayout';
import { useLocations } from '../../context/LocationsContext';
import { useMapPanelDetail } from '../../context/MapPanelDetailContext';
import { createPlant, createTask, updateLocation, updateTask } from '../../api/notionApi';
import { TASK_TYPE_KEYS, TASK_TYPE_LABEL_KO } from '../../pages/Tasks/notionSchema';
import searchLine from '@iconify-icons/mingcute/search-line';
import './MapPanelDetailViews.css';

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

const DIFFICULTY_ORDER = ['Easy', 'Medium', 'Hard'];
const PLANT_STATUS_OPTIONS = [
  { value: 'planted', label: '확인됨' },
  { value: 'planned', label: '식재 예정' },
  { value: 'needs_care', label: '관리 필요' },
];

/** 할 일 생성(상세와 동일 툴바·폼 레이아웃) */
export function MapPanelTaskCreate({ onBack }) {
  const { locations, plants, reload } = useLocations();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [taskType, setTaskType] = useState('Observation');
  const [difficultyIdx, setDifficultyIdx] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [selectedLocationIds, setSelectedLocationIds] = useState([]);
  const [plantQuery, setPlantQuery] = useState('');
  const [plantMenuOpen, setPlantMenuOpen] = useState(false);
  const [selectedPlantIds, setSelectedPlantIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const difficulty = DIFFICULTY_ORDER[difficultyIdx] ?? 'Easy';

  const selectedPlants = useMemo(() => {
    return selectedPlantIds
      .map((id) => plants.find((p) => p.id === id))
      .filter(Boolean);
  }, [plants, selectedPlantIds]);

  const selectedLocations = useMemo(() => {
    return selectedLocationIds
      .map((id) => locations.find((l) => l.id === id))
      .filter(Boolean);
  }, [locations, selectedLocationIds]);

  const plantSuggestions = useMemo(() => {
    const q = plantQuery.trim().toLowerCase();
    const taken = new Set(selectedPlantIds);
    return plants
      .filter((p) => !taken.has(p.id))
      .filter((p) => !q || String(p.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [plants, plantQuery, selectedPlantIds]);

  const locationSuggestions = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    const taken = new Set(selectedLocationIds);
    return locations
      .filter((l) => !taken.has(l.id))
      .filter((l) => !q || String(l.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [locations, locationQuery, selectedLocationIds]);

  const addLocation = (id) => {
    setSelectedLocationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setLocationQuery('');
    setLocationMenuOpen(false);
  };

  const removeLocation = (id) => {
    setSelectedLocationIds((prev) => prev.filter((x) => x !== id));
  };

  const addPlant = (id) => {
    setSelectedPlantIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setPlantQuery('');
    setPlantMenuOpen(false);
  };

  const removePlant = (id) => {
    setSelectedPlantIds((prev) => prev.filter((x) => x !== id));
  };

  const handleSave = async () => {
    const t = title.trim();
    if (!t || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await createTask({
        title: t,
        notes: notes.trim(),
        task_type: taskType,
        difficulty,
        estimated_duration: estimatedDuration.trim(),
        scheduled_date: scheduledDate || '',
        target_location_ids: selectedLocationIds,
        target_plant_ids: selectedPlantIds,
      });
      await reload();
      onBack();
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
        <span className="map-panel-detail__toolbar-spacer" aria-hidden />
      </header>

      <div className="map-panel-detail__scroll">
        <div className="task-create">
          <div className="location-edit__field">
            <label className="location-edit__label" htmlFor="task-create-title">
              Name
            </label>
            <input
              id="task-create-title"
              className="location-edit__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoComplete="off"
              placeholder=""
            />
          </div>

          <div className="location-edit__field">
            <label className="location-edit__label" htmlFor="task-create-notes">
              Description
            </label>
            <textarea
              id="task-create-notes"
              className="location-edit__textarea location-edit__textarea--compact"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="location-edit__field">
            <label className="location-edit__label" htmlFor="task-create-estimated-duration">
              Estimated Duration
            </label>
            <input
              id="task-create-estimated-duration"
              className="location-edit__input"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              autoComplete="off"
              placeholder="예: 15분 / 1시간 30분"
            />
          </div>

          <div className="location-edit__field">
            <label className="location-edit__label" htmlFor="task-create-scheduled-date">
              Schedule Date
            </label>
            <input
              id="task-create-scheduled-date"
              type="date"
              className="location-edit__input"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <div className="location-edit__field">
            <span className="location-edit__label">Task Type</span>
            <div className="task-create__chips" role="group" aria-label="작업 유형">
              {TASK_TYPE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`task-create__chip ${taskType === key ? 'task-create__chip--active' : ''}`}
                  onClick={() => setTaskType(key)}
                >
                  {TASK_TYPE_LABEL_KO[key] || key}
                </button>
              ))}
            </div>
          </div>

          <div className="location-edit__field task-create__plant-field">
            <span className="location-edit__label">Target Location</span>
            {selectedLocations.length > 0 && (
              <ul className="task-create__picked" aria-label="선택한 구역">
                {selectedLocations.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      className="task-create__picked-chip"
                      onClick={() => removeLocation(l.id)}
                      aria-label={`${l.name} 제거`}
                    >
                      {l.name}
                      <span aria-hidden> ×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="task-create__search-wrap">
              <input
                type="search"
                className="task-create__search-input location-edit__input"
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  setLocationMenuOpen(true);
                }}
                onFocus={() => setLocationMenuOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => setLocationMenuOpen(false), 150);
                }}
                placeholder="구역 이름 검색"
                autoComplete="off"
              />
              <Icon
                icon={searchLine}
                width={20}
                height={20}
                className="task-create__search-icon"
                aria-hidden
              />
            </div>
            {locationMenuOpen && locationSuggestions.length > 0 ? (
              <ul className="task-create__suggest" role="listbox">
                {locationSuggestions.map((l) => (
                  <li key={l.id} role="option">
                    <button type="button" className="task-create__suggest-btn" onMouseDown={() => addLocation(l.id)}>
                      {l.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="location-edit__field task-create__plant-field">
            <span className="location-edit__label">Related Plants</span>
            {selectedPlants.length > 0 && (
              <ul className="task-create__picked" aria-label="선택한 식물">
                {selectedPlants.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="task-create__picked-chip"
                      onClick={() => removePlant(p.id)}
                      aria-label={`${p.name} 제거`}
                    >
                      {p.name}
                      <span aria-hidden> ×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="task-create__search-wrap">
              <input
                type="search"
                className="task-create__search-input location-edit__input"
                value={plantQuery}
                onChange={(e) => {
                  setPlantQuery(e.target.value);
                  setPlantMenuOpen(true);
                }}
                onFocus={() => setPlantMenuOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => setPlantMenuOpen(false), 150);
                }}
                placeholder="식물 이름 검색"
                autoComplete="off"
              />
              <Icon
                icon={searchLine}
                width={20}
                height={20}
                className="task-create__search-icon"
                aria-hidden
              />
            </div>
            {plantMenuOpen && plantSuggestions.length > 0 ? (
              <ul className="task-create__suggest" role="listbox">
                {plantSuggestions.map((p) => (
                  <li key={p.id} role="option">
                    <button type="button" className="task-create__suggest-btn" onMouseDown={() => addPlant(p.id)}>
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="location-edit__field">
            <div className="task-create__diff-head">
              <span className="location-edit__label">Difficulty</span>
              <span className="task-create__diff-value">{difficulty}</span>
            </div>
            <input
              type="range"
              className="task-create__slider"
              min={0}
              max={2}
              step={1}
              value={difficultyIdx}
              onChange={(e) => setDifficultyIdx(Number(e.target.value))}
              aria-valuemin={0}
              aria-valuemax={2}
              aria-valuenow={difficultyIdx}
              aria-label={`난이도 ${difficulty}`}
            />
            <div className="task-create__diff-ticks" aria-hidden>
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
            </div>
          </div>

          {saveError ? <p className="location-edit__error">{saveError}</p> : null}

          <div className="location-edit__actions">
            <button
              type="button"
              className="location-edit__save-btn"
              onClick={handleSave}
              disabled={saving || !title.trim()}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 식물 생성(상세와 동일 툴바·폼 레이아웃) */
export function MapPanelPlantCreate({ onBack }) {
  const { locations, reload } = useLocations();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('planted');
  const [bloomSeason, setBloomSeason] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [selectedLocationIds, setSelectedLocationIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const selectedLocations = useMemo(
    () => selectedLocationIds.map((id) => locations.find((l) => l.id === id)).filter(Boolean),
    [selectedLocationIds, locations]
  );

  const locationSuggestions = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    const taken = new Set(selectedLocationIds);
    return locations
      .filter((l) => !taken.has(l.id))
      .filter((l) => !q || String(l.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [locations, locationQuery, selectedLocationIds]);

  const addLocation = (id) => {
    setSelectedLocationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setLocationQuery('');
    setLocationMenuOpen(false);
  };

  const removeLocation = (id) => {
    setSelectedLocationIds((prev) => prev.filter((x) => x !== id));
  };

  const handleSave = async () => {
    const v = name.trim();
    if (!v || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await createPlant({
        name: v,
        species: species.trim(),
        category: category.trim(),
        status,
        bloom_season: bloomSeason.trim(),
        quantity: quantity.trim(),
        notes: notes.trim(),
        location_ids: selectedLocationIds,
      });
      await reload();
      onBack();
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
        <span className="map-panel-detail__toolbar-spacer" aria-hidden />
      </header>

      <div className="map-panel-detail__scroll">
        <div className="task-create">
          <div className="location-edit__field">
            <label className="location-edit__label" htmlFor="plant-create-name">
              Name
            </label>
            <input
              id="plant-create-name"
              className="location-edit__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="location-edit__field">
            <label className="location-edit__label" htmlFor="plant-create-species">
              Species
            </label>
            <input
              id="plant-create-species"
              className="location-edit__input"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              autoComplete="off"
              placeholder="예: 나무, 꽃, 풀"
            />
          </div>

          <div className="location-edit__field">
            <label className="location-edit__label" htmlFor="plant-create-category">
              Category
            </label>
            <input
              id="plant-create-category"
              className="location-edit__input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="location-edit__field">
            <span className="location-edit__label">Status</span>
            <div className="task-create__chips" role="group" aria-label="식물 상태">
              {PLANT_STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`task-create__chip ${status === s.value ? 'task-create__chip--active' : ''}`}
                  onClick={() => setStatus(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="location-edit__field task-create__plant-field">
            <span className="location-edit__label">Location</span>
            {selectedLocations.length > 0 && (
              <ul className="task-create__picked" aria-label="선택한 위치">
                {selectedLocations.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      className="task-create__picked-chip"
                      onClick={() => removeLocation(l.id)}
                      aria-label={`${l.name} 제거`}
                    >
                      {l.name}
                      <span aria-hidden> ×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="task-create__search-wrap">
              <input
                type="search"
                className="task-create__search-input location-edit__input"
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  setLocationMenuOpen(true);
                }}
                onFocus={() => setLocationMenuOpen(true)}
                onBlur={() => window.setTimeout(() => setLocationMenuOpen(false), 150)}
                placeholder="구역 이름 검색"
                autoComplete="off"
              />
              <Icon icon={searchLine} width={20} height={20} className="task-create__search-icon" aria-hidden />
            </div>
            {locationMenuOpen && locationSuggestions.length > 0 ? (
              <ul className="task-create__suggest" role="listbox">
                {locationSuggestions.map((l) => (
                  <li key={l.id} role="option">
                    <button type="button" className="task-create__suggest-btn" onMouseDown={() => addLocation(l.id)}>
                      {l.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="location-edit__field">
            <label className="location-edit__label" htmlFor="plant-create-bloom">
              Bloom Season
            </label>
            <input
              id="plant-create-bloom"
              className="location-edit__input"
              value={bloomSeason}
              onChange={(e) => setBloomSeason(e.target.value)}
              autoComplete="off"
              placeholder="예: 5월~6월"
            />
          </div>

          <div className="location-edit__field">
            <label className="location-edit__label" htmlFor="plant-create-quantity">
              Quantity
            </label>
            <input
              id="plant-create-quantity"
              type="number"
              min="0"
              className="location-edit__input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="location-edit__field">
            <label className="location-edit__label" htmlFor="plant-create-notes">
              Notes
            </label>
            <textarea
              id="plant-create-notes"
              className="location-edit__textarea location-edit__textarea--compact"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {saveError ? <p className="location-edit__error">{saveError}</p> : null}

          <div className="location-edit__actions">
            <button
              type="button"
              className="location-edit__save-btn"
              onClick={handleSave}
              disabled={saving || !name.trim()}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @param {{ task: object, onBack: () => void, locationMap: Record<string, object>, plantMap: Record<string, object>, taskTitleMap: Record<string, string> }} props */
export function MapPanelTaskDetail({ task, onBack, locationMap, plantMap, taskTitleMap: _taskTitleMap }) {
  const { tasks: allTasks, locations, plants, reload } = useLocations();
  const { openLocationDetail, openPlantDetail, openTaskDetail } = useMapPanelDetail();

  const location = task.section_id ? locationMap[task.section_id] : null;

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title || '');
  const [draftNotes, setDraftNotes] = useState(task.notes || '');
  const [draftTaskType, setDraftTaskType] = useState(task.task_type ?? 'Observation');

  const initialDifficultyIdx = Math.max(0, DIFFICULTY_ORDER.indexOf(task.difficulty ?? 'Easy'));
  const [draftDifficultyIdx, setDraftDifficultyIdx] = useState(initialDifficultyIdx);

  const [draftEstimatedDuration, setDraftEstimatedDuration] = useState(task.estimated_duration || '');
  const [draftScheduledDate, setDraftScheduledDate] = useState(
    task.scheduled_date || task.due_date || ''
  );

  const [selectedLocationIds, setSelectedLocationIds] = useState(() => (task.section_id ? [task.section_id] : []));
  const [locationQuery, setLocationQuery] = useState('');
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);

  const [selectedPlantIds, setSelectedPlantIds] = useState(() => (task.target_plant_ids || []));
  const [plantQuery, setPlantQuery] = useState('');
  const [plantMenuOpen, setPlantMenuOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(task.title || '');
      setDraftNotes(task.notes || '');
      setDraftTaskType(task.task_type ?? 'Observation');
      const idx = Math.max(0, DIFFICULTY_ORDER.indexOf(task.difficulty ?? 'Easy'));
      setDraftDifficultyIdx(idx);
      setDraftEstimatedDuration(task.estimated_duration || '');
      setDraftScheduledDate(task.scheduled_date || task.due_date || '');
      setSelectedLocationIds(task.section_id ? [task.section_id] : []);
      setSelectedPlantIds(task.target_plant_ids || []);
      setSaveError(null);
    }
  }, [task.id, isEditing, task.title, task.notes, task.task_type, task.difficulty, task.estimated_duration, task.scheduled_date, task.due_date, task.section_id, task.target_plant_ids]);

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
        return {
          label: t.title || _taskTitleMap[id] || '(제목 없음)',
          onNavigate: () => openTaskDetail(t, { push: true }),
        };
      })
      .filter(Boolean);
  }, [task.prereq_task_ids, allTasks, openTaskDetail, _taskTitleMap]);

  const followupNavLinks = useMemo(() => {
    return (task.followup_task_ids || [])
      .map((id) => {
        const t = allTasks.find((x) => x.id === id);
        if (!t) return null;
        return {
          label: t.title || _taskTitleMap[id] || '(제목 없음)',
          onNavigate: () => openTaskDetail(t, { push: true }),
        };
      })
      .filter(Boolean);
  }, [task.followup_task_ids, allTasks, openTaskDetail, _taskTitleMap]);

  const onLocationNavigate =
    location ? () => openLocationDetail(location, { push: true }) : null;

  const notionStatusName = (() => {
    if (task.status === 'completed') return '완료';
    if (task.status === 'progress') return '진행중';
    return '시작 전';
  })();

  const selectedPlantsForEdit = useMemo(() => {
    return selectedPlantIds.map((id) => plants.find((p) => p.id === id)).filter(Boolean);
  }, [plants, selectedPlantIds]);

  const locationSuggestions = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    const taken = new Set(selectedLocationIds);
    return locations
      .filter((l) => !taken.has(l.id))
      .filter((l) => !q || String(l.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [locations, locationQuery, selectedLocationIds]);

  const plantSuggestionsForEdit = useMemo(() => {
    const q = plantQuery.trim().toLowerCase();
    const taken = new Set(selectedPlantIds);
    return plants
      .filter((p) => !taken.has(p.id))
      .filter((p) => !q || String(p.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [plants, plantQuery, selectedPlantIds]);

  const addLocation = (id) => {
    setSelectedLocationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setLocationQuery('');
    setLocationMenuOpen(false);
  };

  const removeLocation = (id) => setSelectedLocationIds((prev) => prev.filter((x) => x !== id));

  const addPlant = (id) => {
    setSelectedPlantIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setPlantQuery('');
    setPlantMenuOpen(false);
  };

  const removePlant = (id) => setSelectedPlantIds((prev) => prev.filter((x) => x !== id));

  const handleSaveEdit = async () => {
    if (saving) return;
    const t = draftTitle.trim();
    if (!t) return;

    setSaving(true);
    setSaveError(null);
    try {
      const difficulty = DIFFICULTY_ORDER[draftDifficultyIdx] ?? 'Easy';
      await updateTask(task.id, {
        title: t,
        notes: draftNotes,
        task_type: draftTaskType,
        difficulty,
        estimated_duration: draftEstimatedDuration.trim(),
        scheduled_date: draftScheduledDate || '',
        target_location_ids: selectedLocationIds,
        target_plant_ids: selectedPlantIds,
        status_name: notionStatusName,
      });
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
        <span className="map-panel-detail__toolbar-title">할 일</span>
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

      <div className="map-panel-detail__scroll map-panel-detail__scroll--task-detail">
        {!isEditing ? (
          <TaskDetailLayout
            task={task}
            locationName={location?.name ?? null}
            onLocationNavigate={onLocationNavigate}
            plantLinks={plantNavLinks}
            taskLinkGroups={{
              prerequisites: prerequisiteNavLinks,
              followups: followupNavLinks,
            }}
          />
        ) : (
          <div className="task-create">
            <div className="location-edit__field">
              <label className="location-edit__label" htmlFor="task-edit-title">
                Name
              </label>
              <input
                id="task-edit-title"
                className="location-edit__input"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="location-edit__field">
              <label className="location-edit__label" htmlFor="task-edit-notes">
                Description
              </label>
              <textarea
                id="task-edit-notes"
                className="location-edit__textarea location-edit__textarea--compact"
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="location-edit__field">
              <label className="location-edit__label" htmlFor="task-edit-estimated-duration">
                Estimated Duration
              </label>
              <input
                id="task-edit-estimated-duration"
                className="location-edit__input"
                value={draftEstimatedDuration}
                onChange={(e) => setDraftEstimatedDuration(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="location-edit__field">
              <label className="location-edit__label" htmlFor="task-edit-scheduled-date">
                Schedule Date
              </label>
              <input
                id="task-edit-scheduled-date"
                type="date"
                className="location-edit__input"
                value={draftScheduledDate}
                onChange={(e) => setDraftScheduledDate(e.target.value)}
              />
            </div>

            <div className="location-edit__field">
              <span className="location-edit__label">Task Type</span>
              <div className="task-create__chips" role="group" aria-label="작업 유형">
                {TASK_TYPE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`task-create__chip ${draftTaskType === key ? 'task-create__chip--active' : ''}`}
                    onClick={() => setDraftTaskType(key)}
                  >
                    {TASK_TYPE_LABEL_KO[key] || key}
                  </button>
                ))}
              </div>
            </div>

            <div className="location-edit__field task-create__plant-field">
              <span className="location-edit__label">Target Location</span>
              {selectedLocationIds.length > 0 && (
                <ul className="task-create__picked" aria-label="선택한 구역">
                  {selectedLocationIds.map((id) => {
                    const l = locations.find((x) => x.id === id);
                    if (!l) return null;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          className="task-create__picked-chip"
                          onClick={() => removeLocation(id)}
                          aria-label={`${l.name} 제거`}
                        >
                          {l.name}
                          <span aria-hidden> ×</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="task-create__search-wrap">
                <input
                  type="search"
                  className="task-create__search-input location-edit__input"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setLocationMenuOpen(true);
                  }}
                  onFocus={() => setLocationMenuOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setLocationMenuOpen(false), 150);
                  }}
                  placeholder="구역 이름 검색"
                  autoComplete="off"
                />
                <Icon icon={searchLine} width={20} height={20} className="task-create__search-icon" aria-hidden />
              </div>

              {locationMenuOpen && locationSuggestions.length > 0 ? (
                <ul className="task-create__suggest" role="listbox">
                  {locationSuggestions.map((l) => (
                    <li key={l.id} role="option">
                      <button type="button" className="task-create__suggest-btn" onMouseDown={() => addLocation(l.id)}>
                        {l.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="location-edit__field">
              <div className="task-create__diff-head">
                <span className="location-edit__label">Difficulty</span>
                <span className="task-create__diff-value">{DIFFICULTY_ORDER[draftDifficultyIdx] ?? 'Easy'}</span>
              </div>
              <input
                type="range"
                className="task-create__slider"
                min={0}
                max={2}
                step={1}
                value={draftDifficultyIdx}
                onChange={(e) => setDraftDifficultyIdx(Number(e.target.value))}
                aria-valuemin={0}
                aria-valuemax={2}
                aria-valuenow={draftDifficultyIdx}
                aria-label={`난이도 ${DIFFICULTY_ORDER[draftDifficultyIdx] ?? 'Easy'}`}
              />
              <div className="task-create__diff-ticks" aria-hidden>
                <span>Easy</span>
                <span>Medium</span>
                <span>Hard</span>
              </div>
            </div>

            <div className="location-edit__field task-create__plant-field">
              <span className="location-edit__label">Related Plants</span>
              {selectedPlantsForEdit.length > 0 && (
                <ul className="task-create__picked" aria-label="선택한 식물">
                  {selectedPlantsForEdit.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="task-create__picked-chip"
                        onClick={() => removePlant(p.id)}
                        aria-label={`${p.name} 제거`}
                      >
                        {p.name}
                        <span aria-hidden> ×</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="task-create__search-wrap">
                <input
                  type="search"
                  className="task-create__search-input location-edit__input"
                  value={plantQuery}
                  onChange={(e) => {
                    setPlantQuery(e.target.value);
                    setPlantMenuOpen(true);
                  }}
                  onFocus={() => setPlantMenuOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setPlantMenuOpen(false), 150);
                  }}
                  placeholder="식물 이름 검색"
                  autoComplete="off"
                />
                <Icon icon={searchLine} width={20} height={20} className="task-create__search-icon" aria-hidden />
              </div>

              {plantMenuOpen && plantSuggestionsForEdit.length > 0 ? (
                <ul className="task-create__suggest" role="listbox">
                  {plantSuggestionsForEdit.map((p) => (
                    <li key={p.id} role="option">
                      <button type="button" className="task-create__suggest-btn" onMouseDown={() => addPlant(p.id)}>
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {saveError ? <p className="location-edit__error">{saveError}</p> : null}

            <div className="location-edit__actions">
              <button
                type="button"
                className="location-edit__save-btn"
                onClick={handleSaveEdit}
                disabled={saving || !draftTitle.trim()}
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
