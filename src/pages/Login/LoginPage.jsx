import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, credentialsConfigured, login, setupCredentials } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupMode, setSetupMode] = useState(() => !credentialsConfigured);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = useMemo(() => location.state?.from || '/', [location.state]);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  function resetFeedback() {
    setMessage('');
    setIsError(false);
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    resetFeedback();

    if (!username.trim() || !password) {
      setIsError(true);
      setMessage('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(username.trim(), password);
      if (!result.ok) {
        setIsError(true);
        if (result.reason === 'missing_credentials') {
          setMessage('등록된 계정이 없습니다. 아래에서 먼저 계정을 설정해 주세요.');
          setSetupMode(true);
        } else {
          setMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
        return;
      }

      navigate(redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetupSubmit(e) {
    e.preventDefault();
    resetFeedback();

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password || !confirmPassword) {
      setIsError(true);
      setMessage('아이디, 비밀번호, 비밀번호 확인을 모두 입력해 주세요.');
      return;
    }
    if (password.length < 8) {
      setIsError(true);
      setMessage('비밀번호는 8자 이상으로 설정해 주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setSubmitting(true);
    try {
      await setupCredentials(normalizedUsername, password);
      navigate('/', { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <div className="login-page__accent" aria-hidden />
        <div className="login-page__header">
          <span className="login-page__label">Digital Garden</span>
          <h1 className="login-page__title">{setupMode ? '계정 설정' : '로그인'}</h1>
        </div>

        <form className="login-page__form" onSubmit={setupMode ? handleSetupSubmit : handleLoginSubmit}>
          <div className="login-page__field">
            <label className="login-page__field-label" htmlFor="login-username">
              아이디
            </label>
            <input
              id="login-username"
              type="text"
              className="login-page__input"
              placeholder="my-id"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
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
          {setupMode && (
            <div className="login-page__field">
              <label className="login-page__field-label" htmlFor="login-password-confirm">
                비밀번호 확인
              </label>
              <input
                id="login-password-confirm"
                type="password"
                className="login-page__input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          )}
          {message && (
            <p className={`login-page__message ${isError ? 'login-page__message--error' : ''}`}>{message}</p>
          )}
          <button type="submit" className="login-page__btn" disabled={submitting}>
            {submitting ? '처리 중...' : setupMode ? '계정 저장 후 시작' : '로그인'}
          </button>
        </form>

        <div className="login-page__footer">
          {setupMode ? (
            <>
              <span className="login-page__meta">이미 계정을 설정하셨나요?</span>
              <button
                type="button"
                className="login-page__link login-page__link-btn"
                onClick={() => {
                  resetFeedback();
                  setSetupMode(false);
                }}
              >
                로그인으로 전환
              </button>
            </>
          ) : (
            <>
              <span className="login-page__meta">아이디/비밀번호를 새로 설정할까요?</span>
              <button
                type="button"
                className="login-page__link login-page__link-btn"
                onClick={() => {
                  resetFeedback();
                  setSetupMode(true);
                }}
              >
                계정 재설정
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
