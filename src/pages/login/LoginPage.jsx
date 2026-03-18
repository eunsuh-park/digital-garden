import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate('/map', { replace: true });
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__accent" aria-hidden />
        <div className="login-page__header">
          <span className="login-page__label">Digital Garden</span>
          <h1 className="login-page__title">로그인</h1>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <div className="login-page__field">
            <label className="login-page__field-label" htmlFor="login-email">
              이메일
            </label>
            <input
              id="login-email"
              type="email"
              className="login-page__input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="login-page__field">
            <label className="login-page__field-label" htmlFor="login-password">
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              className="login-page__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-page__btn">
            로그인
          </button>
        </form>

        <div className="login-page__footer">
          <span className="login-page__meta">계정이 없으신가요?</span>
          <a href="#/signup" className="login-page__link">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}
