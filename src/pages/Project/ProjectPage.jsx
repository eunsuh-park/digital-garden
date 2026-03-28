import { useState } from 'react';
import ButtonTabGroup from '@/shared/ui/button-tab/ButtonTab';
import TextButton from '@/shared/ui/text-button/TextButton';
import TextField from '@/shared/ui/text-field/TextField';
import './ProjectPage.css';

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

export default function ProjectPage() {
  const [name, setName] = useState('');
  const [space, setSpace] = useState('');
  const [purpose, setPurpose] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: createProject API 연동
  }

  return (
    <div className="project-page">
      <div className="project-page__card">
        <div className="project-page__accent" aria-hidden />
        <div className="project-page__header">
          <span className="project-page__label">Digital Garden</span>
          <h1 className="project-page__title">프로젝트 만들기</h1>
        </div>

        <form className="project-page__form" onSubmit={handleSubmit}>
          <div className="project-page__field">
            <TextField
              label="프로젝트 명"
              inputId="project-name"
              inputType="text"
              inputName="project-name"
              autoComplete="off"
              size="m"
              showHelperText={false}
              placeholder="예: 우리 집 베란다 정원"
              value={name}
              onChange={setName}
              className="project-page__field-control"
            />
          </div>

          <div className="project-page__field">
            <span className="project-page__field-label">공간 넓이</span>
            <ButtonTabGroup
              items={SPACE_TAB_ITEMS}
              value={space}
              onChange={setSpace}
              size="m"
              className="project-page__tab-group"
            />
          </div>

          <div className="project-page__field">
            <span className="project-page__field-label">활용 목적</span>
            <ButtonTabGroup
              items={PURPOSE_OPTIONS}
              value={purpose}
              onChange={setPurpose}
              size="m"
              className="project-page__tab-group project-page__tab-group--purpose"
            />
          </div>

          <TextButton
            label="프로젝트 생성"
            htmlType="submit"
            styleType="primary"
            size="m"
            disabled={!name.trim() || !space || !purpose}
            className="project-page__btn"
          />
        </form>
      </div>
    </div>
  );
}
