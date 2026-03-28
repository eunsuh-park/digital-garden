import { Link } from 'react-router-dom';
import './TokenLabPage.css';

const COLOR_SECTIONS = [
  {
    title: 'Brand',
    items: [
      { label: 'Primary', token: '--brand-primary' },
      { label: 'Primary Strong', token: '--brand-primary-strong' },
      { label: 'Primary Light', token: '--brand-primary-light' },
      { label: 'Accent', token: '--brand-accent' },
    ],
  },
  {
    title: 'Gray Scale',
    items: [
      { label: 'Gray 0', token: '--gray-0' },
      { label: 'Gray 50', token: '--gray-50' },
      { label: 'Gray 100', token: '--gray-100' },
      { label: 'Gray 200', token: '--gray-200' },
      { label: 'Gray 300', token: '--gray-300' },
      { label: 'Gray 400', token: '--gray-400' },
      { label: 'Gray 500', token: '--gray-500' },
      { label: 'Gray 600', token: '--gray-600' },
      { label: 'Gray 700', token: '--gray-700' },
      { label: 'Gray 800', token: '--gray-800' },
      { label: 'Gray 900', token: '--gray-900' },
    ],
  },
  {
    title: 'Semantic',
    items: [
      { label: 'Background', token: '--color-bg' },
      { label: 'Surface', token: '--color-surface' },
      { label: 'Surface Soft', token: '--color-surface-soft' },
      { label: 'Surface Muted', token: '--color-surface-muted' },
      { label: 'Text', token: '--color-text' },
      { label: 'Text Muted', token: '--color-text-muted' },
      { label: 'Text Strong', token: '--color-text-strong' },
      { label: 'Border', token: '--color-border' },
      { label: 'Primary Alias', token: '--color-primary' },
    ],
  },
  {
    title: 'Status',
    items: [
      { label: 'Success BG', token: '--color-success-bg' },
      { label: 'Success Hover', token: '--color-success-bg-hover' },
      { label: 'Success Text', token: '--color-success-text' },
      { label: 'Warning BG', token: '--color-warning-bg' },
      { label: 'Warning Text', token: '--color-warning-text' },
      { label: 'Danger BG', token: '--color-danger-bg' },
      { label: 'Danger Text', token: '--color-danger-text' },
      { label: 'Info Accent', token: '--color-info-accent' },
    ],
  },
];

const TYPOGRAPHY_ITEMS = [
  { label: 'Sans', token: '--font-sans', sample: '가든 디자인 시스템 Pretendard 0123' },
  { label: 'Serif', token: '--font-serif', sample: '가든 타이틀 스타일 Noto Serif KR 0123' },
  { label: 'Mono', token: '--font-mono', sample: 'TOKEN_VAR --color-primary 0123' },
];

const TYPO_SCALE_ITEMS = [
  {
    className: 'typo-display-lg',
    label: 'Display LG',
    tokens: '--font-size-display-lg / --font-weight-bold / --line-height-tight',
    sample: 'The quick brown fox jumps',
  },
  {
    className: 'typo-display-md',
    label: 'Display MD',
    tokens: '--font-size-display-md / --font-weight-bold / --line-height-tight',
    sample: 'The quick brown fox jumps',
  },
  {
    className: 'typo-h1',
    label: 'Heading 1',
    tokens: '--font-size-heading-1 / --font-weight-bold',
    sample: 'The quick brown fox jumps',
  },
  {
    className: 'typo-h2',
    label: 'Heading 2',
    tokens: '--font-size-heading-2 / --font-weight-bold',
    sample: 'The quick brown fox jumps',
  },
  {
    className: 'typo-h3',
    label: 'Heading 3',
    tokens: '--font-size-heading-3 / --font-weight-semibold',
    sample: 'The quick brown fox jumps',
  },
  {
    className: 'typo-h4',
    label: 'Heading 4',
    tokens: '--font-size-heading-4 / --font-weight-semibold',
    sample: 'The quick brown fox jumps',
  },
  {
    className: 'typo-body-lg',
    label: 'Body LG',
    tokens: '--font-size-body-lg / --line-height-normal',
    sample: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    className: 'typo-body-md',
    label: 'Body MD',
    tokens: '--font-size-body-md / --line-height-normal',
    sample: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    className: 'typo-body-sm',
    label: 'Body SM',
    tokens: '--font-size-body-sm / --line-height-normal',
    sample: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    className: 'typo-caption',
    label: 'Caption',
    tokens: '--font-size-caption / --font-weight-medium',
    sample: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    className: 'typo-overline',
    label: 'Overline',
    tokens: '--font-size-overline / --letter-spacing-wide',
    sample: 'The quick brown fox jumps',
  },
];

const SPACE_ITEMS = [
  '--space-0',
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-5',
  '--space-6',
];

const RADIUS_ITEMS = [
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-xl',
  '--radius-2xl',
  '--radius-full',
];

const SHADOW_ITEMS = ['--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-side-panel'];

function ColorSwatch({ label, token }) {
  return (
    <div className="token-lab__swatch-card">
      <div className="token-lab__swatch" style={{ background: `var(${token})` }} />
      <strong>{label}</strong>
      <span>{token}</span>
    </div>
  );
}

export default function TokenLabPage() {
  return (
    <div className="token-lab">
      <header className="token-lab__header">
        <div>
          <h1>Design Token Lab</h1>
          <p>프로젝트 토큰을 색상/타입/간격/효과 단위로 한 번에 검증하는 페이지입니다.</p>
        </div>
        <Link to="/ui-lab" className="token-lab__link">
          UI Lab 이동
        </Link>
      </header>

      {COLOR_SECTIONS.map((section) => (
        <section key={section.title} className="token-lab__section">
          <h2>{section.title}</h2>
          <div className="token-lab__swatch-grid">
            {section.items.map((item) => (
              <ColorSwatch key={item.token} label={item.label} token={item.token} />
            ))}
          </div>
        </section>
      ))}

      <section className="token-lab__section">
        <h2>Typography</h2>
        <div className="token-lab__type-list">
          {TYPOGRAPHY_ITEMS.map((item) => (
            <div key={item.token} className="token-lab__type-item">
              <div className="token-lab__type-meta">
                <strong>{item.label}</strong>
                <span>{item.token}</span>
              </div>
              <p style={{ fontFamily: `var(${item.token})` }}>{item.sample}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="token-lab__section">
        <h2>Typography Scale</h2>
        <div className="token-lab__typo-scale">
          {TYPO_SCALE_ITEMS.map((item) => (
            <article key={item.label} className="token-lab__typo-row">
              <div className="token-lab__typo-meta">
                <strong>{item.label}</strong>
                <span>{item.className}</span>
                <span>{item.tokens}</span>
              </div>
              <p className={item.className}>{item.sample}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="token-lab__section">
        <h2>Spacing</h2>
        <div className="token-lab__space-list">
          {SPACE_ITEMS.map((token) => (
            <div key={token} className="token-lab__space-item">
              <span>{token}</span>
              <div className="token-lab__space-bar" style={{ width: `calc(var(${token}) * 24)` }} />
            </div>
          ))}
        </div>
      </section>

      <section className="token-lab__section">
        <h2>Radius</h2>
        <div className="token-lab__radius-grid">
          {RADIUS_ITEMS.map((token) => (
            <div key={token} className="token-lab__radius-card">
              <div className="token-lab__radius-box" style={{ borderRadius: `var(${token})` }} />
              <span>{token}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="token-lab__section">
        <h2>Shadow</h2>
        <div className="token-lab__shadow-grid">
          {SHADOW_ITEMS.map((token) => (
            <div key={token} className="token-lab__shadow-card">
              <div className="token-lab__shadow-box" style={{ boxShadow: `var(${token})` }} />
              <span>{token}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

