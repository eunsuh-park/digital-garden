import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ButtonTabGroup from '@/shared/ui/button-tab/ButtonTab';
import TextButton from '@/shared/ui/text-button/TextButton';
import TextField from '@/shared/ui/text-field/TextField';
import { useToast } from '@/app/providers/ToastContext';
import { useProjects } from '@/app/providers/ProjectsContext';
import { createProject } from '@/shared/lib/createProject';
import {
  loadProjectWizardDraft,
  saveProjectWizardDraft,
  clearProjectWizardDraft,
} from '@/shared/lib/projectWizardDraft';
import './ProjectNewPage.css';

const SPACE_OPTIONS = [
  { value: 's', label: 'S', desc: '소형' },
  { value: 'm', label: 'M', desc: '중형' },
  { value: 'l', label: 'L', desc: '대형' },
];

const PURPOSE_OPTIONS = [
  { value: 'indoor', label: '실내 정원' },
  { value: 'outdoor', label: '실외 정원' },
  { value: 'landscape', label: '기타 조경 공간' },
  { value: 'personal', label: '개인 공간' },
];

const SPACE_TAB_ITEMS = SPACE_OPTIONS.map((option) => ({
  value: option.value,
  label: `${option.label} · ${option.desc}`,
}));

const STEPS = ['기본 정보', '맵·구역'];

export default function ProjectNewPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { reload: reloadProjects } = useProjects();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [space, setSpace] = useState('');
  const [purpose, setPurpose] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = loadProjectWizardDraft();
    if (d) {
      setName(d.name);
      setSpace(d.space);
      setPurpose(d.purpose);
    }
  }, []);

  useEffect(() => {
    saveProjectWizardDraft({ name, space, purpose });
  }, [name, space, purpose]);

  const step1Valid = Boolean(name.trim() && space && purpose);

  function handleNext(e) {
    e.preventDefault();
    if (!step1Valid) return;
    setStep(1);
  }

  async function handleCreate() {
    if (!step1Valid || saving) return;
    setSaving(true);
    try {
      const { data, error } = await createProject({
        name: name.trim(),
        space_size: space,
        purpose,
      });
      if (error) {
        showToast(error.message || '프로젝트를 만들지 못했습니다.');
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
    <div className="project-new-page">
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

        {step === 0 ? (
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
                placeholder="예: 우리 집 베란다 정원"
                value={name}
                onChange={setName}
                className="project-new-page__field-control"
              />
            </div>

            <div className="project-new-page__field">
              <span className="project-new-page__field-label">공간 넓이</span>
              <ButtonTabGroup
                items={SPACE_TAB_ITEMS}
                value={space}
                onChange={setSpace}
                size="m"
                className="project-new-page__tab-group"
              />
            </div>

            <div className="project-new-page__field">
              <span className="project-new-page__field-label">활용 목적</span>
              <ButtonTabGroup
                items={PURPOSE_OPTIONS}
                value={purpose}
                onChange={setPurpose}
                size="m"
                className="project-new-page__tab-group project-new-page__tab-group--purpose"
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
        ) : (
          <div className="project-new-page__panel">
            <p className="project-new-page__lead">
              <strong>{name.trim() || '프로젝트'}</strong> · 공간 {space?.toUpperCase()} ·{' '}
              {PURPOSE_OPTIONS.find((p) => p.value === purpose)?.label ?? ''}
            </p>
            <div className="project-new-page__placeholder" role="status">
              <p className="project-new-page__placeholder-title">맵·구역 구성</p>
              <p className="project-new-page__placeholder-desc">
                다음 단계에서 SVG 맵과 구역(Zone)을 연결할 예정입니다. 지금은 저장만 하면 대시보드·지도에서 이어갈 수
                있어요.
              </p>
            </div>
            <div className="project-new-page__actions project-new-page__actions--footer">
              <button
                type="button"
                className="project-new-page__link-secondary project-new-page__link-as-btn"
                onClick={() => setStep(0)}
              >
                이전
              </button>
              <TextButton
                label={saving ? '저장 중…' : '프로젝트 저장'}
                htmlType="button"
                styleType="primary"
                size="m"
                disabled={saving || !step1Valid}
                className="project-new-page__btn-primary"
                onClick={handleCreate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
