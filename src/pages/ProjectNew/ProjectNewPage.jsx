import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextButton from '@/shared/ui/text-button/TextButton';
import TextField from '@/shared/ui/text-field/TextField';
import Select from '@/shared/ui/select/Select';
import { useToast } from '@/app/providers/ToastContext';
import { useProjects } from '@/app/providers/ProjectsContext';
import { createProject } from '@/shared/lib/createProject';
import {
  loadProjectWizardDraft,
  saveProjectWizardDraft,
  clearProjectWizardDraft,
} from '@/shared/lib/projectWizardDraft';
import { PROJECT_SPACE_SIZE_TAB_ITEMS } from '@/shared/lib/projectSpaceSize';
import MapBuilderWorkspace from '@/widgets/map-builder/MapBuilderWorkspace';
import { useProjectNewMapBuilderUi } from '@/app/providers/ProjectNewMapBuilderUiContext';
import './ProjectNewPage.css';

const STEPS = ['기본 정보', '맵·구역'];

const MAX_NAME_LEN = 20;
const MAX_SPACE_DESC_LEN = 200;

export default function ProjectNewPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { reload: reloadProjects } = useProjects();
  const { setMapBuilderOpen } = useProjectNewMapBuilderUi();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [space, setSpace] = useState('');
  const [spaceDescription, setSpaceDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = loadProjectWizardDraft();
    if (d) {
      setName(d.name);
      setSpace(d.space);
      setSpaceDescription(d.spaceDescription);
    }
  }, []);

  useEffect(() => {
    saveProjectWizardDraft({ name, space, spaceDescription });
  }, [name, space, spaceDescription]);

  useEffect(() => {
    setMapBuilderOpen(step === 1);
    return () => setMapBuilderOpen(false);
  }, [step, setMapBuilderOpen]);

  const setNameClamped = (v) => setName(String(v ?? '').slice(0, MAX_NAME_LEN));
  const setSpaceDescriptionClamped = (v) =>
    setSpaceDescription(String(v ?? '').slice(0, MAX_SPACE_DESC_LEN));

  const step1Valid = Boolean(name.trim() && space);

  function handleNext(e) {
    e.preventDefault();
    if (!step1Valid) return;
    setStep(1);
  }

  async function handleCreate() {
    if (!step1Valid || saving) return;
    setSaving(true);
    try {
      const trimmedDesc = spaceDescription.trim();
      const { data, error } = await createProject({
        name: name.trim(),
        space_size: space,
        space_description: trimmedDesc || null,
      });
      if (error) {
        const msg = [error.message, error.details, error.hint].filter(Boolean).join(' — ');
        showToast(msg || '프로젝트를 만들지 못했습니다.');
        return;
      }
      clearProjectWizardDraft();
      await reloadProjects();
      showToast('프로젝트가 생성되었습니다.');
      if (data?.id != null) {
        navigate(`/project/${data.id}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`project-new-page${step === 1 ? ' project-new-page--map-builder' : ''}`}>
      {step === 1 ? (
        <MapBuilderWorkspace
          projectTitle={name.trim() || '새 프로젝트'}
          onBack={() => setStep(0)}
          onSaveAndContinue={handleCreate}
          saving={saving}
          saveDisabled={!step1Valid}
        />
      ) : (
      <div className="project-new-page__card">
        <div className="project-new-page__accent" aria-hidden />
        <header className="project-new-page__header">
          <span className="project-new-page__label">Digital Garden</span>
          <h1 className="project-new-page__title">새 프로젝트</h1>
          <ol className="project-new-page__steps" aria-label="진행 단계">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className={`project-new-page__step ${i === step ? 'project-new-page__step--current' : ''} ${
                  i < step ? 'project-new-page__step--done' : ''
                }`}
              >
                <span className="project-new-page__step-index">{i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        </header>

        <form className="project-new-page__form" onSubmit={handleNext}>
            <div className="project-new-page__field">
              <TextField
                label="프로젝트 명"
                inputId="project-new-name"
                inputType="text"
                inputName="project-new-name"
                autoComplete="off"
                size="m"
                showHelperText={false}
                placeholder="최대 20자"
                value={name}
                onChange={setNameClamped}
                maxLength={MAX_NAME_LEN}
                className="project-new-page__field-control"
              />
            </div>

            <div className="project-new-page__field">
              <span className="project-new-page__field-label" id="project-new-space-label">
                공간 넓이<span className="project-new-page__required">*</span>
              </span>
              <Select
                options={PROJECT_SPACE_SIZE_TAB_ITEMS}
                value={space}
                onChange={setSpace}
                size="m"
                placeholder="공간 넓이를 선택하세요"
                className="project-new-page__space-select"
                aria-labelledby="project-new-space-label"
              />
            </div>

            <div className="project-new-page__field">
              <TextField
                label="설명"
                inputId="project-new-space-desc"
                inputName="project-new-space-desc"
                type="long"
                variant="text-area"
                autoComplete="off"
                size="m"
                showHelperText={false}
                placeholder="이 공간에 대한 설명을 적을 수 있어요. (선택)"
                value={spaceDescription}
                onChange={setSpaceDescriptionClamped}
                maxLength={MAX_SPACE_DESC_LEN}
                className="project-new-page__field-control"
              />
            </div>

            <div className="project-new-page__actions">
              <Link to="/dashboard" className="project-new-page__link-secondary">
                취소
              </Link>
              <TextButton
                label="다음"
                htmlType="submit"
                styleType="primary"
                size="m"
                disabled={!step1Valid}
                className="project-new-page__btn-primary"
              />
            </div>
          </form>
      </div>
      )}
    </div>
  );
}
