import { useState } from 'react';
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
            <label className="project-page__field-label" htmlFor="project-name">
              프로젝트 명
            </label>
            <input
              id="project-name"
              type="text"
              className="project-page__input"
              placeholder="예: 우리 집 베란다 정원"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="project-page__field">
            <span className="project-page__field-label">공간 넓이</span>
            <div className="project-page__chips" role="group" aria-label="공간 넓이 선택">
              {SPACE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`project-page__chip ${space === opt.value ? 'project-page__chip--active' : ''}`}
                  onClick={() => setSpace(opt.value)}
                >
                  <span className="project-page__chip-label">{opt.label}</span>
                  <span className="project-page__chip-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="project-page__field">
            <span className="project-page__field-label">활용 목적</span>
            <div className="project-page__chips project-page__chips--purpose" role="group" aria-label="활용 목적 선택">
              {PURPOSE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`project-page__chip project-page__chip--purpose ${purpose === opt.value ? 'project-page__chip--active' : ''}`}
                  onClick={() => setPurpose(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="project-page__btn" disabled={!name.trim() || !space || !purpose}>
            프로젝트 생성
          </button>
        </form>
      </div>
    </div>
  );
}
