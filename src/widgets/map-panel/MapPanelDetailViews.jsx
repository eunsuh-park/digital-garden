import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import arrowLeftLine from '@iconify-icons/mingcute/arrow-left-line';
import { TaskDetailLayout, PlantDetailLayout } from './PanelDocLayouts';
import { useZones } from '@/app/providers/ZonesContext';
import { useMapPanelDetail } from '@/app/providers/MapPanelDetailContext';
import {
  createPlant,
  createTask,
  createZone,
  updateZone,
  updatePlant,
  updateTask,
  deletePlant,
  deleteTask,
  deleteZone,
} from '@/shared/api/gardenApi';
import { useToast } from '@/app/providers/ToastContext';
import { TASK_TYPE_KEYS, TASK_TYPE_LABEL_KO } from '@/entities/task/lib/notion-schema';
import searchLine from '@iconify-icons/mingcute/search-line';
import trashLine from '@iconify-icons/mingcute/delete-2-line';
import edit2Line from '@iconify-icons/mingcute/edit-2-line';
import closeLine from '@iconify-icons/mingcute/close-line';
import './panel-view.css';

/** 다중 구역 ID + 대표 zone_id를 중복 없이 순서 유지 */
function uniqueZoneIds(multi, primary) {
  const ids = [...(Array.isArray(multi) ? multi : []), primary].filter(Boolean);
  const seen = new Set();
  return ids.filter((id) => {
    const k = String(id);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function ConfirmDeleteDialog({
  open,
  title,
  message,
  confirmLabel = '삭제',
  cancelLabel = '취소',
  onClose,
  onConfirm,
  deleting = false,
}) {
  if (!open) return null;

  return (
    <div
      className="confirm-dialog__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div className="confirm-dialog__panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="confirm-dialog__title">{title}</div>
        <p className="confirm-dialog__message">{message}</p>

        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            onClick={onClose}
            disabled={deleting}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-dialog__btn confirm-dialog__btn--confirm"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? '삭제 중…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** @param {{ zone: object, onBack: () => void }} props */
export function MapPanelZoneDetail({ zone, onBack }) {
  const { zones, tasks, plants, reload, projectId } = useZones();
  const { openPlantDetail, openTaskDetail } = useMapPanelDetail();
  const { showToast } = useToast();

  const currentZone = useMemo(() => {
    return zones.find((zRow) => zRow.id === zone?.id) || zone;
  }, [zones, zone]);

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(currentZone?.name || '');
  const [draftDescription, setDraftDescription] = useState(currentZone?.description || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { sectionTasks, sectionPlants } = useMemo(() => {
    const sid = currentZone?.id;
    const pending = tasks.filter((t) => t.zone_id === sid && t.status !== 'completed');
    const pls = plants.filter((p) => p.zone_id === sid);
    return { sectionTasks: pending, sectionPlants: pls };
  }, [tasks, plants, currentZone?.id]);

  const description = useMemo(() => {
    const colorHint = currentZone?.color_label ? `색상: ${currentZone.color_label}.` : '';
    return `${currentZone?.name} 구역입니다. ${colorHint} 할 일 ${sectionTasks.length}건, 식물 ${sectionPlants.length}종이 이 구역에 연결되어 있습니다.`.trim();
  }, [currentZone?.name, currentZone?.color_label, sectionTasks.length, sectionPlants.length]);

  const previewPlants = sectionPlants.slice(0, 9);

  useEffect(() => {
    if (isEditing) return;
    setDraftName(currentZone?.name || '');
    setDraftDescription(currentZone?.description || '');
    setSaveError(null);
  }, [currentZone?.id, isEditing, currentZone?.name, currentZone?.description]);

  const viewDescription = useMemo(() => {
    const d = (currentZone?.description || '').trim();
    return d ? d : description;
  }, [currentZone?.description, description]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const name = (draftName || '').trim();
      const descriptionValue = (draftDescription || '').trim();
      await updateZone(projectId, currentZone.id, { name, description: descriptionValue });
      await reload();
      setIsEditing(false);
    } catch (e) {
      setSaveError(e.message || '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel-view">
      <header className="panel-view__bar">
        <button type="button" className="panel-view__icon" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="panel-view__bar-title">정보</span>
        {isEditing ? (
          <span className="panel-view__bar-spacer" aria-hidden />
        ) : (
          <button
            type="button"
            className="panel-view__icon"
            onClick={() => setIsEditing(true)}
            aria-label="편집"
            title="편집"
          >
            <Icon icon={edit2Line} width={20} height={20} />
          </button>
        )}
      </header>

      <div className="panel-view__scroll">
        {!isEditing ? (
          <>
            <h1 className="panel-view__h1">{currentZone.name}</h1>
            {currentZone.color_label ? (
              <p className="panel-view__meta">{currentZone.color_label}</p>
            ) : null}
            <p className="panel-view__lead">{viewDescription}</p>

            <section className="panel-view__section">
              <h2 className="panel-view__h2">금주 할 일</h2>
              {sectionTasks.length === 0 ? (
                <p className="panel-view__empty">없습니다</p>
              ) : (
                <ul className="panel-view__list">
                  {sectionTasks.map((t) => (
                    <li key={t.id} className="panel-view__item">
                      <button
                        type="button"
                        className="panel-view__list-btn"
                        onClick={() => openTaskDetail(t, { push: true })}
                      >
                        {t.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel-view__section">
              <div className="panel-view__section-head">
                <h2 className="panel-view__h2">식물 {sectionPlants.length}</h2>
              </div>
              {previewPlants.length === 0 ? (
                <p className="panel-view__empty">등록된 식물이 없습니다</p>
              ) : (
                <ul className="panel-view__grid" aria-label="식물 미리보기">
                  {previewPlants.map((p) => (
                    <li key={p.id} className="panel-view__tile">
                      <button
                        type="button"
                        className="panel-view__plate panel-view__plate-btn"
                        onClick={() => openPlantDetail(p, { push: true })}
                      >
                        {p.status === 'needs_care' ? (
                          <span className="panel-view__dot" aria-label="관리 필요" />
                        ) : null}
                        <span className="panel-view__name">{p.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="panel-view__footer">
              <button
                type="button"
                className="panel-view__danger"
                onClick={() => setDeleteOpen(true)}
                aria-label="구역 삭제"
                title="삭제"
                disabled={deleting}
              >
                <Icon icon={trashLine} width={22} height={22} aria-hidden />
              </button>
            </div>
          </>
        ) : (
          <div className="panel-form">
            <div className="panel-form__field">
              <label className="panel-form__label" htmlFor="zone-edit-name">
                Name
              </label>
              <input
                id="zone-edit-name"
                className="panel-form__input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
              />
            </div>

            <div className="panel-form__field">
              <label className="panel-form__label" htmlFor="zone-edit-description">
                Description
              </label>
              <textarea
                id="zone-edit-description"
                className="panel-form__textarea"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
              />
            </div>

            {saveError ? <p className="panel-form__error">{saveError}</p> : null}

            <div className="panel-form__actions">
              <button
                type="button"
                className="panel-form__submit"
                onClick={handleSave}
                disabled={saving || !draftName.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="삭제 확인"
        message={`구역 "${currentZone?.name}"을(를) 삭제할까요?`}
        confirmLabel="삭제"
        cancelLabel="취소"
        deleting={deleting}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        onConfirm={async () => {
          if (deleting) return;
          setDeleting(true);
          try {
            await deleteZone(projectId, currentZone.id);
            await reload();
            showToast('구역이 삭제되었습니다.');
            setDeleteOpen(false);
            onBack();
          } catch (e) {
            // 유지
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}

const LOCATION_CREATE_COLORS = ['초록', '연두', '노랑', '파랑', '보라', '주황', '빨강', '회색'];

/** @param {{ onBack: () => void }} props */
export function MapPanelZoneCreate({ onBack }) {
  const { reload, projectId } = useZones();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('초록');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await createZone(projectId, {
        name: trimmed,
        description: description.trim(),
        color,
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
    <div className="panel-view">
      <header className="panel-view__bar">
        <button type="button" className="panel-view__icon" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="panel-view__bar-title">구역 추가</span>
        <span className="panel-view__bar-spacer" aria-hidden />
      </header>
      <div className="panel-view__scroll">
        <div className="panel-form">
          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="zone-create-name">
              이름
            </label>
            <input
              id="zone-create-name"
              className="panel-form__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="zone-create-description">
              설명
            </label>
            <textarea
              id="zone-create-description"
              className="panel-form__textarea panel-form__textarea--sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="panel-form__field">
            <span className="panel-form__label">색상 그룹</span>
            <div className="panel-form__chips" role="group" aria-label="구역 색상">
              {LOCATION_CREATE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`panel-form__chip ${color === c ? 'panel-form__chip--on' : ''}`}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {saveError ? <p className="panel-form__error">{saveError}</p> : null}
          <div className="panel-form__actions">
            <button
              type="button"
              className="panel-form__submit"
              onClick={handleSave}
              disabled={saving || !name.trim()}
            >
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>
        </div>
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
const PLANT_SPECIES_OPTIONS = ['나무', '풀', '꽃'];

/** 할 일 생성(상세와 동일 툴바·폼 레이아웃) */
export function MapPanelTaskCreate({ onBack }) {
  const { zones, plants, reload, projectId } = useZones();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [taskType, setTaskType] = useState('Observation');
  const [difficultyIdx, setDifficultyIdx] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [zoneQuery, setZoneQuery] = useState('');
  const [zoneMenuOpen, setZoneMenuOpen] = useState(false);
  const [selectedZoneIds, setSelectedZoneIds] = useState([]);
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

  const selectedZones = useMemo(() => {
    return selectedZoneIds
      .map((id) => zones.find((l) => l.id === id))
      .filter(Boolean);
  }, [zones, selectedZoneIds]);

  const plantSuggestions = useMemo(() => {
    const q = plantQuery.trim().toLowerCase();
    const taken = new Set(selectedPlantIds);
    return plants
      .filter((p) => !taken.has(p.id))
      .filter((p) => !q || String(p.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [plants, plantQuery, selectedPlantIds]);

  const zoneSuggestions = useMemo(() => {
    const q = zoneQuery.trim().toLowerCase();
    const taken = new Set(selectedZoneIds);
    return zones
      .filter((l) => !taken.has(l.id))
      .filter((l) => !q || String(l.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [zones, zoneQuery, selectedZoneIds]);

  const addZone = (id) => {
    setSelectedZoneIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setZoneQuery('');
    setZoneMenuOpen(false);
  };

  const removeZone = (id) => {
    setSelectedZoneIds((prev) => prev.filter((x) => x !== id));
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
      await createTask(projectId, {
        title: t,
        notes: notes.trim(),
        task_type: taskType,
        difficulty,
        estimated_duration: estimatedDuration.trim(),
        scheduled_date: scheduledDate || '',
        target_zone_ids: selectedZoneIds,
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
    <div className="panel-view">
      <header className="panel-view__bar">
        <button type="button" className="panel-view__icon" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="panel-view__bar-title">정보</span>
        <span className="panel-view__bar-spacer" aria-hidden />
      </header>

      <div className="panel-view__scroll">
        <div className="panel-form">
          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="task-create-title">
              Name
            </label>
            <input
              id="task-create-title"
              className="panel-form__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoComplete="off"
              placeholder=""
            />
          </div>

          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="task-create-notes">
              Description
            </label>
            <textarea
              id="task-create-notes"
              className="panel-form__textarea panel-form__textarea--sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="task-create-estimated-duration">
              Estimated Duration
            </label>
            <input
              id="task-create-estimated-duration"
              className="panel-form__input"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              autoComplete="off"
              placeholder="예: 15분 / 1시간 30분"
            />
          </div>

          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="task-create-scheduled-date">
              Schedule Date
            </label>
            <input
              id="task-create-scheduled-date"
              type="date"
              className="panel-form__input"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <div className="panel-form__field">
            <span className="panel-form__label">Task Type</span>
            <div className="panel-form__chips" role="group" aria-label="작업 유형">
              {TASK_TYPE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`panel-form__chip ${taskType === key ? 'panel-form__chip--on' : ''}`}
                  onClick={() => setTaskType(key)}
                >
                  {TASK_TYPE_LABEL_KO[key] || key}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-form__field panel-form__field--rel">
            <span className="panel-form__label">Target Zone</span>
            {selectedZones.length > 0 && (
              <ul className="panel-form__tags" aria-label="선택한 구역">
                {selectedZones.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      className="panel-form__tag"
                      onClick={() => removeZone(l.id)}
                      aria-label={`${l.name} 제거`}
                    >
                      {l.name}
                      <Icon icon={closeLine} width={12} height={12} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="panel-form__search">
              <input
                type="search"
                className="panel-form__search-input panel-form__input"
                value={zoneQuery}
                onChange={(e) => {
                  setZoneQuery(e.target.value);
                  setZoneMenuOpen(true);
                }}
                onFocus={() => setZoneMenuOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => setZoneMenuOpen(false), 150);
                }}
                placeholder="구역 이름 검색"
                autoComplete="off"
              />
              <Icon
                icon={searchLine}
                width={20}
                height={20}
                className="panel-form__search-icon"
                aria-hidden
              />
            </div>
            {zoneMenuOpen && zoneSuggestions.length > 0 ? (
              <ul className="panel-form__menu" role="listbox">
                {zoneSuggestions.map((l) => (
                  <li key={l.id} role="option">
                    <button type="button" className="panel-form__menu-btn" onMouseDown={() => addZone(l.id)}>
                      {l.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="panel-form__field panel-form__field--rel">
            <span className="panel-form__label">Related Plants</span>
            {selectedPlants.length > 0 && (
              <ul className="panel-form__tags" aria-label="선택한 식물">
                {selectedPlants.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="panel-form__tag"
                      onClick={() => removePlant(p.id)}
                      aria-label={`${p.name} 제거`}
                    >
                      {p.name}
                      <Icon icon={closeLine} width={12} height={12} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="panel-form__search">
              <input
                type="search"
                className="panel-form__search-input panel-form__input"
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
                className="panel-form__search-icon"
                aria-hidden
              />
            </div>
            {plantMenuOpen && plantSuggestions.length > 0 ? (
              <ul className="panel-form__menu" role="listbox">
                {plantSuggestions.map((p) => (
                  <li key={p.id} role="option">
                    <button type="button" className="panel-form__menu-btn" onMouseDown={() => addPlant(p.id)}>
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="panel-form__field">
            <div className="panel-form__diff">
              <span className="panel-form__label">Difficulty</span>
              <span className="panel-form__diff-val">{difficulty}</span>
            </div>
            <input
              type="range"
              className="panel-form__range"
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
            <div className="panel-form__ticks" aria-hidden>
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
            </div>
          </div>

          {saveError ? <p className="panel-form__error">{saveError}</p> : null}

          <div className="panel-form__actions">
            <button
              type="button"
              className="panel-form__submit"
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
  const { zones, reload, projectId } = useZones();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('나무');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('planted');
  const [bloomSeason, setBloomSeason] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [zoneQuery, setZoneQuery] = useState('');
  const [zoneMenuOpen, setZoneMenuOpen] = useState(false);
  const [selectedZoneIds, setSelectedZoneIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const selectedZones = useMemo(
    () => selectedZoneIds.map((id) => zones.find((l) => l.id === id)).filter(Boolean),
    [selectedZoneIds, zones]
  );

  const zoneSuggestions = useMemo(() => {
    const q = zoneQuery.trim().toLowerCase();
    const taken = new Set(selectedZoneIds);
    return zones
      .filter((l) => !taken.has(l.id))
      .filter((l) => !q || String(l.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [zones, zoneQuery, selectedZoneIds]);

  const addZone = (id) => {
    setSelectedZoneIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setZoneQuery('');
    setZoneMenuOpen(false);
  };

  const removeZone = (id) => {
    setSelectedZoneIds((prev) => prev.filter((x) => x !== id));
  };

  const handleSave = async () => {
    const v = name.trim();
    if (!v || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await createPlant(projectId, {
        name: v,
        species: species.trim(),
        category: category.trim(),
        status,
        bloom_season: bloomSeason.trim(),
        quantity: quantity.trim(),
        notes: notes.trim(),
        zone_ids: selectedZoneIds,
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
    <div className="panel-view">
      <header className="panel-view__bar">
        <button type="button" className="panel-view__icon" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="panel-view__bar-title">정보</span>
        <span className="panel-view__bar-spacer" aria-hidden />
      </header>

      <div className="panel-view__scroll">
        <div className="panel-form">
          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="plant-create-name">
              Name
            </label>
            <input
              id="plant-create-name"
              className="panel-form__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="panel-form__field">
            <span className="panel-form__label">Species</span>
            <div className="panel-form__chips" role="group" aria-label="식물 종">
              {PLANT_SPECIES_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`panel-form__chip ${species === s ? 'panel-form__chip--on' : ''}`}
                  onClick={() => setSpecies(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="plant-create-category">
              Category
            </label>
            <input
              id="plant-create-category"
              className="panel-form__input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="panel-form__field">
            <span className="panel-form__label">Status</span>
            <div className="panel-form__chips" role="group" aria-label="식물 상태">
              {PLANT_STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`panel-form__chip ${status === s.value ? 'panel-form__chip--on' : ''}`}
                  onClick={() => setStatus(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-form__field panel-form__field--rel">
            <span className="panel-form__label">Zone</span>
            {selectedZones.length > 0 && (
              <ul className="panel-form__tags" aria-label="선택한 구역">
                {selectedZones.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      className="panel-form__tag"
                      onClick={() => removeZone(l.id)}
                      aria-label={`${l.name} 제거`}
                    >
                      {l.name}
                      <Icon icon={closeLine} width={12} height={12} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="panel-form__search">
              <input
                type="search"
                className="panel-form__search-input panel-form__input"
                value={zoneQuery}
                onChange={(e) => {
                  setZoneQuery(e.target.value);
                  setZoneMenuOpen(true);
                }}
                onFocus={() => setZoneMenuOpen(true)}
                onBlur={() => window.setTimeout(() => setZoneMenuOpen(false), 150)}
                placeholder="구역 이름 검색"
                autoComplete="off"
              />
              <Icon icon={searchLine} width={20} height={20} className="panel-form__search-icon" aria-hidden />
            </div>
            {zoneMenuOpen && zoneSuggestions.length > 0 ? (
              <ul className="panel-form__menu" role="listbox">
                {zoneSuggestions.map((l) => (
                  <li key={l.id} role="option">
                    <button type="button" className="panel-form__menu-btn" onMouseDown={() => addZone(l.id)}>
                      {l.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="plant-create-bloom">
              Bloom Season
            </label>
            <input
              id="plant-create-bloom"
              className="panel-form__input"
              value={bloomSeason}
              onChange={(e) => setBloomSeason(e.target.value)}
              autoComplete="off"
              placeholder="예: 5월~6월"
            />
          </div>

          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="plant-create-quantity">
              Quantity
            </label>
            <input
              id="plant-create-quantity"
              type="number"
              min="0"
              className="panel-form__input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="panel-form__field">
            <label className="panel-form__label" htmlFor="plant-create-notes">
              Notes
            </label>
            <textarea
              id="plant-create-notes"
              className="panel-form__textarea panel-form__textarea--sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {saveError ? <p className="panel-form__error">{saveError}</p> : null}

          <div className="panel-form__actions">
            <button
              type="button"
              className="panel-form__submit"
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

/** @param {{ task: object, onBack: () => void, zoneMap: Record<string, object>, plantMap: Record<string, object>, taskTitleMap: Record<string, string> }} props */
export function MapPanelTaskDetail({ task, onBack, zoneMap, plantMap, taskTitleMap: _taskTitleMap }) {
  const { tasks: allTasks, zones, plants, reload, projectId } = useZones();
  const { openZoneDetail, openPlantDetail, openTaskDetail } = useMapPanelDetail();
  const { showToast } = useToast();

  const linkedZone = task.zone_id ? zoneMap[task.zone_id] : null;

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

  const [selectedZoneIds, setSelectedZoneIds] = useState(() => uniqueZoneIds(task.target_zone_ids, task.zone_id));
  const [zoneQuery, setZoneQuery] = useState('');
  const [zoneMenuOpen, setZoneMenuOpen] = useState(false);

  const [selectedPlantIds, setSelectedPlantIds] = useState(() => (task.target_plant_ids || []));
  const [plantQuery, setPlantQuery] = useState('');
  const [plantMenuOpen, setPlantMenuOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(task.title || '');
      setDraftNotes(task.notes || '');
      setDraftTaskType(task.task_type ?? 'Observation');
      const idx = Math.max(0, DIFFICULTY_ORDER.indexOf(task.difficulty ?? 'Easy'));
      setDraftDifficultyIdx(idx);
      setDraftEstimatedDuration(task.estimated_duration || '');
      setDraftScheduledDate(task.scheduled_date || task.due_date || '');
      setSelectedZoneIds(uniqueZoneIds(task.target_zone_ids, task.zone_id));
      setSelectedPlantIds(task.target_plant_ids || []);
      setSaveError(null);
    }
  }, [
    task.id,
    isEditing,
    task.title,
    task.notes,
    task.task_type,
    task.difficulty,
    task.estimated_duration,
    task.scheduled_date,
    task.due_date,
    task.zone_id,
    task.target_zone_ids,
    task.target_plant_ids,
  ]);

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

  const onZoneNavigate =
    linkedZone ? () => openZoneDetail(linkedZone, { push: true }) : null;

  const notionStatusName =
    (task.notion_status && String(task.notion_status).trim()) ||
    (task.status === 'completed' ? '완료' : task.status === 'progress' ? '진행 중' : '시작 전');

  const selectedPlantsForEdit = useMemo(() => {
    return selectedPlantIds.map((id) => plants.find((p) => p.id === id)).filter(Boolean);
  }, [plants, selectedPlantIds]);

  const zoneSuggestions = useMemo(() => {
    const q = zoneQuery.trim().toLowerCase();
    const taken = new Set(selectedZoneIds);
    return zones
      .filter((l) => !taken.has(l.id))
      .filter((l) => !q || String(l.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [zones, zoneQuery, selectedZoneIds]);

  const plantSuggestionsForEdit = useMemo(() => {
    const q = plantQuery.trim().toLowerCase();
    const taken = new Set(selectedPlantIds);
    return plants
      .filter((p) => !taken.has(p.id))
      .filter((p) => !q || String(p.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [plants, plantQuery, selectedPlantIds]);

  const addZone = (id) => {
    setSelectedZoneIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setZoneQuery('');
    setZoneMenuOpen(false);
  };

  const removeZone = (id) => setSelectedZoneIds((prev) => prev.filter((x) => x !== id));

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
      await updateTask(projectId, task.id, {
        title: t,
        notes: draftNotes,
        task_type: draftTaskType,
        difficulty,
        estimated_duration: draftEstimatedDuration.trim(),
        scheduled_date: draftScheduledDate || '',
        target_zone_ids: selectedZoneIds,
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
    <div className="panel-view">
      <header className="panel-view__bar">
        <button type="button" className="panel-view__icon" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="panel-view__bar-title">할 일</span>
        {isEditing ? (
          <span className="panel-view__bar-spacer" aria-hidden />
        ) : (
          <button
            type="button"
            className="panel-view__icon"
            onClick={() => setIsEditing(true)}
            aria-label="편집"
            title="편집"
          >
            <Icon icon={edit2Line} width={20} height={20} />
          </button>
        )}
      </header>

      <div className="panel-view__scroll panel-view__scroll--footer">
        {!isEditing ? (
          <>
            <TaskDetailLayout
              task={task}
              zoneName={linkedZone?.name ?? null}
              onZoneNavigate={onZoneNavigate}
              plantLinks={plantNavLinks}
              taskLinkGroups={{
                prerequisites: prerequisiteNavLinks,
                followups: followupNavLinks,
              }}
            />
            <div className="panel-view__footer">
              <button
                type="button"
                className="panel-view__danger"
                onClick={() => setDeleteOpen(true)}
                aria-label="할 일 삭제"
                title="삭제"
                disabled={deleting}
              >
                <Icon icon={trashLine} width={22} height={22} aria-hidden />
              </button>
            </div>
          </>
        ) : (
          <div className="panel-form">
            <div className="panel-form__field">
              <label className="panel-form__label" htmlFor="task-edit-title">
                Name
              </label>
              <input
                id="task-edit-title"
                className="panel-form__input"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="panel-form__field">
              <label className="panel-form__label" htmlFor="task-edit-notes">
                Description
              </label>
              <textarea
                id="task-edit-notes"
                className="panel-form__textarea panel-form__textarea--sm"
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="panel-form__field">
              <label className="panel-form__label" htmlFor="task-edit-estimated-duration">
                Estimated Duration
              </label>
              <input
                id="task-edit-estimated-duration"
                className="panel-form__input"
                value={draftEstimatedDuration}
                onChange={(e) => setDraftEstimatedDuration(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="panel-form__field">
              <label className="panel-form__label" htmlFor="task-edit-scheduled-date">
                Schedule Date
              </label>
              <input
                id="task-edit-scheduled-date"
                type="date"
                className="panel-form__input"
                value={draftScheduledDate}
                onChange={(e) => setDraftScheduledDate(e.target.value)}
              />
            </div>

            <div className="panel-form__field">
              <span className="panel-form__label">Task Type</span>
              <div className="panel-form__chips" role="group" aria-label="작업 유형">
                {TASK_TYPE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`panel-form__chip ${draftTaskType === key ? 'panel-form__chip--on' : ''}`}
                    onClick={() => setDraftTaskType(key)}
                  >
                    {TASK_TYPE_LABEL_KO[key] || key}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-form__field panel-form__field--rel">
              <span className="panel-form__label">Target Zone</span>
              {selectedZoneIds.length > 0 && (
                <ul className="panel-form__tags" aria-label="선택한 구역">
                  {selectedZoneIds.map((id) => {
                    const l = zones.find((x) => x.id === id);
                    if (!l) return null;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          className="panel-form__tag"
                          onClick={() => removeZone(id)}
                          aria-label={`${l.name} 제거`}
                        >
                          {l.name}
                          <Icon icon={closeLine} width={12} height={12} aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="panel-form__search">
                <input
                  type="search"
                  className="panel-form__search-input panel-form__input"
                  value={zoneQuery}
                  onChange={(e) => {
                    setZoneQuery(e.target.value);
                    setZoneMenuOpen(true);
                  }}
                  onFocus={() => setZoneMenuOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setZoneMenuOpen(false), 150);
                  }}
                  placeholder="구역 이름 검색"
                  autoComplete="off"
                />
                <Icon icon={searchLine} width={20} height={20} className="panel-form__search-icon" aria-hidden />
              </div>

              {zoneMenuOpen && zoneSuggestions.length > 0 ? (
                <ul className="panel-form__menu" role="listbox">
                  {zoneSuggestions.map((l) => (
                    <li key={l.id} role="option">
                      <button type="button" className="panel-form__menu-btn" onMouseDown={() => addZone(l.id)}>
                        {l.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="panel-form__field">
              <div className="panel-form__diff">
                <span className="panel-form__label">Difficulty</span>
                <span className="panel-form__diff-val">{DIFFICULTY_ORDER[draftDifficultyIdx] ?? 'Easy'}</span>
              </div>
              <input
                type="range"
                className="panel-form__range"
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
              <div className="panel-form__ticks" aria-hidden>
                <span>Easy</span>
                <span>Medium</span>
                <span>Hard</span>
              </div>
            </div>

            <div className="panel-form__field panel-form__field--rel">
              <span className="panel-form__label">Related Plants</span>
              {selectedPlantsForEdit.length > 0 && (
                <ul className="panel-form__tags" aria-label="선택한 식물">
                  {selectedPlantsForEdit.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="panel-form__tag"
                        onClick={() => removePlant(p.id)}
                        aria-label={`${p.name} 제거`}
                      >
                        {p.name}
                        <Icon icon={closeLine} width={12} height={12} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="panel-form__search">
                <input
                  type="search"
                  className="panel-form__search-input panel-form__input"
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
                <Icon icon={searchLine} width={20} height={20} className="panel-form__search-icon" aria-hidden />
              </div>

              {plantMenuOpen && plantSuggestionsForEdit.length > 0 ? (
                <ul className="panel-form__menu" role="listbox">
                  {plantSuggestionsForEdit.map((p) => (
                    <li key={p.id} role="option">
                      <button type="button" className="panel-form__menu-btn" onMouseDown={() => addPlant(p.id)}>
                        {p.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {saveError ? <p className="panel-form__error">{saveError}</p> : null}

            <div className="panel-form__actions">
              <button
                type="button"
                className="panel-form__submit"
                onClick={handleSaveEdit}
                disabled={saving || !draftTitle.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="삭제 확인"
        message="이 할 일을 삭제할까요?"
        confirmLabel="삭제"
        cancelLabel="취소"
        deleting={deleting}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        onConfirm={async () => {
          if (deleting) return;
          setDeleting(true);
          try {
            await deleteTask(projectId, task.id);
            await reload();
            showToast('할 일이 삭제되었습니다.');
            setDeleteOpen(false);
            onBack();
          } catch (e) {
            // 실패 시 다이얼로그만 닫지 않고 유지(추가 에러 표시는 최소화)
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}

/** @param {{ plant: object, onBack: () => void, zoneMap: Record<string, object> }} props */
export function MapPanelPlantDetail({ plant, onBack, zoneMap }) {
  const { zones, reload, projectId } = useZones();
  const { showToast } = useToast();
  const { openZoneDetail } = useMapPanelDetail();
  const linkedZone = plant.zone_id ? zoneMap[plant.zone_id] : null;

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(plant.name || '');
  const [draftSpecies, setDraftSpecies] = useState(plant.species && plant.species !== '-' ? plant.species : '나무');
  const [draftStatus, setDraftStatus] = useState(plant.status || 'planted');
  const [draftBloomSeason, setDraftBloomSeason] = useState(
    plant.bloom_season && plant.bloom_season !== '-' ? plant.bloom_season : ''
  );
  const [draftQuantity, setDraftQuantity] = useState(
    plant.quantity == null ? '' : String(plant.quantity)
  );
  const [draftNotes, setDraftNotes] = useState(plant.notes || '');
  const [selectedZoneIds, setSelectedZoneIds] = useState(() =>
    uniqueZoneIds(plant.zone_ids, plant.zone_id)
  );
  const [zoneQuery, setZoneQuery] = useState('');
  const [zoneMenuOpen, setZoneMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isEditing) return;
    setDraftName(plant.name || '');
    setDraftSpecies(plant.species && plant.species !== '-' ? plant.species : '나무');
    setDraftStatus(plant.status || 'planted');
    setDraftBloomSeason(plant.bloom_season && plant.bloom_season !== '-' ? plant.bloom_season : '');
    setDraftQuantity(plant.quantity == null ? '' : String(plant.quantity));
    setDraftNotes(plant.notes || '');
    setSelectedZoneIds(uniqueZoneIds(plant.zone_ids, plant.zone_id));
    setSaveError(null);
  }, [
    plant.id,
    isEditing,
    plant.name,
    plant.species,
    plant.status,
    plant.bloom_season,
    plant.quantity,
    plant.notes,
    plant.zone_id,
    plant.zone_ids,
  ]);

  const selectedZones = useMemo(
    () => selectedZoneIds.map((id) => zones.find((l) => l.id === id)).filter(Boolean),
    [selectedZoneIds, zones]
  );

  const zoneSuggestions = useMemo(() => {
    const q = zoneQuery.trim().toLowerCase();
    const taken = new Set(selectedZoneIds);
    return zones
      .filter((l) => !taken.has(l.id))
      .filter((l) => !q || String(l.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [zones, zoneQuery, selectedZoneIds]);

  const addZone = (id) => {
    setSelectedZoneIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setZoneQuery('');
    setZoneMenuOpen(false);
  };

  const removeZone = (id) => {
    setSelectedZoneIds((prev) => prev.filter((x) => x !== id));
  };

  const handleSave = async () => {
    const v = draftName.trim();
    if (!v || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updatePlant(projectId, plant.id, {
        name: v,
        species: draftSpecies,
        status: draftStatus,
        bloom_season: draftBloomSeason.trim(),
        quantity: draftQuantity,
        notes: draftNotes.trim(),
        zone_ids: selectedZoneIds,
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
    <div className="panel-view">
      <header className="panel-view__bar">
        <button type="button" className="panel-view__icon" onClick={onBack} aria-label="뒤로">
          <Icon icon={arrowLeftLine} width={22} height={22} />
        </button>
        <span className="panel-view__bar-title">식물</span>
        {isEditing ? (
          <span className="panel-view__bar-spacer" aria-hidden />
        ) : (
          <button
            type="button"
            className="panel-view__icon"
            onClick={() => setIsEditing(true)}
            aria-label="편집"
            title="편집"
          >
            <Icon icon={edit2Line} width={20} height={20} />
          </button>
        )}
      </header>
      <div className="panel-view__scroll panel-view__scroll--footer">
        {!isEditing ? (
          <>
            <PlantDetailLayout
              plant={plant}
              zoneName={linkedZone?.name ?? null}
              onZoneNavigate={
                linkedZone ? () => openZoneDetail(linkedZone, { push: true }) : undefined
              }
            />
            <div className="panel-view__footer">
              <button
                type="button"
                className="panel-view__danger"
                onClick={() => setDeleteOpen(true)}
                aria-label="식물 삭제"
                title="삭제"
                disabled={deleting}
              >
                <Icon icon={trashLine} width={22} height={22} aria-hidden />
              </button>
            </div>
          </>
        ) : (
          <div className="panel-form panel-form--tight">
            <div className="panel-form__field">
              <label className="panel-form__label" htmlFor="plant-edit-name">
                Name
              </label>
              <input
                id="plant-edit-name"
                className="panel-form__input"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="panel-form__field">
              <span className="panel-form__label">Species</span>
              <div className="panel-form__chips" role="group" aria-label="식물 종">
                {PLANT_SPECIES_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`panel-form__chip ${draftSpecies === s ? 'panel-form__chip--on' : ''}`}
                    onClick={() => setDraftSpecies(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-form__field">
              <span className="panel-form__label">Status</span>
              <div className="panel-form__chips" role="group" aria-label="식물 상태">
                {PLANT_STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`panel-form__chip ${draftStatus === s.value ? 'panel-form__chip--on' : ''}`}
                    onClick={() => setDraftStatus(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-form__field panel-form__field--rel">
              <span className="panel-form__label">Zone</span>
              {selectedZones.length > 0 && (
                <ul className="panel-form__tags" aria-label="선택한 구역">
                  {selectedZones.map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        className="panel-form__tag"
                        onClick={() => removeZone(l.id)}
                        aria-label={`${l.name} 제거`}
                      >
                        {l.name}
                        <Icon icon={closeLine} width={12} height={12} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="panel-form__search">
                <input
                  type="search"
                  className="panel-form__search-input panel-form__input"
                  value={zoneQuery}
                  onChange={(e) => {
                    setZoneQuery(e.target.value);
                    setZoneMenuOpen(true);
                  }}
                  onFocus={() => setZoneMenuOpen(true)}
                  onBlur={() => window.setTimeout(() => setZoneMenuOpen(false), 150)}
                  placeholder="구역 이름 검색"
                  autoComplete="off"
                />
                <Icon icon={searchLine} width={20} height={20} className="panel-form__search-icon" aria-hidden />
              </div>
              {zoneMenuOpen && zoneSuggestions.length > 0 ? (
                <ul className="panel-form__menu" role="listbox">
                  {zoneSuggestions.map((l) => (
                    <li key={l.id} role="option">
                      <button type="button" className="panel-form__menu-btn" onMouseDown={() => addZone(l.id)}>
                        {l.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="panel-form__field">
              <label className="panel-form__label" htmlFor="plant-edit-bloom">
                Bloom Season
              </label>
              <input
                id="plant-edit-bloom"
                className="panel-form__input"
                value={draftBloomSeason}
                onChange={(e) => setDraftBloomSeason(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="panel-form__field">
              <label className="panel-form__label" htmlFor="plant-edit-quantity">
                Quantity
              </label>
              <input
                id="plant-edit-quantity"
                type="number"
                min="0"
                className="panel-form__input"
                value={draftQuantity}
                onChange={(e) => setDraftQuantity(e.target.value)}
              />
            </div>

            <div className="panel-form__field">
              <label className="panel-form__label" htmlFor="plant-edit-notes">
                Notes
              </label>
              <textarea
                id="plant-edit-notes"
                className="panel-form__textarea panel-form__textarea--sm"
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={4}
              />
            </div>

            {saveError ? <p className="panel-form__error">{saveError}</p> : null}

            <div className="panel-form__actions">
              <button
                type="button"
                className="panel-form__submit"
                onClick={handleSave}
                disabled={saving || !draftName.trim()}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={deleteOpen}
        title="삭제 확인"
        message="이 식물을 삭제할까요?"
        confirmLabel="삭제"
        cancelLabel="취소"
        deleting={deleting}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
        onConfirm={async () => {
          if (deleting) return;
          setDeleting(true);
          try {
            await deletePlant(projectId, plant.id);
            await reload();
            showToast('식물이 삭제되었습니다.');
            setDeleteOpen(false);
            onBack();
          } catch (e) {
            // 실패 시 유지
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
