import { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import TextField from '@/shared/ui/text-field/TextField';
import TextButton from '@/shared/ui/text-button/TextButton';
import Container from '@/shared/ui/container/Container';
import Dialog from '@/shared/ui/dialog/Dialog';
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
      <Container viewport centered className="login-page__container">
        <Dialog
          label="Digital Garden"
          title={setupMode ? '계정 설정' : '로그인'}
          className="login-page__card"
          bodyClassName="login-page__body"
          footer={
            <>
              {setupMode ? (
                <>
                  <span className="login-page__meta">이미 계정을 설정하셨나요?</span>
                  <TextButton
                    label="로그인으로 전환"
                    styleType="tertiary"
                    size="xs"
                    className="login-page__link-btn"
                    onClick={() => {
                      resetFeedback();
                      setSetupMode(false);
                    }}
                  />
                </>
              ) : (
                <>
                  <span className="login-page__meta">아이디/비밀번호를 새로 설정할까요?</span>
                  <TextButton
                    label="계정 재설정"
                    styleType="tertiary"
                    size="xs"
                    className="login-page__link-btn"
                    onClick={() => {
                      resetFeedback();
                      setSetupMode(true);
                    }}
                  />
                </>
              )}
            </>
          }
        >
          <form className="login-page__form" onSubmit={setupMode ? handleSetupSubmit : handleLoginSubmit}>
            <div className="login-page__field">
              <TextField
                label="아이디"
                inputId="login-username"
                inputType="text"
                inputName="username"
                autoComplete="username"
                size="m"
                showHelperText={false}
                placeholder="my-id"
                value={username}
                onChange={setUsername}
                className="login-page__field-control"
              />
            </div>
            <div className="login-page__field">
              <TextField
                label="비밀번호"
                inputId="login-password"
                inputType="password"
                inputName="password"
                autoComplete={setupMode ? 'new-password' : 'current-password'}
                size="m"
                showHelperText={false}
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                className="login-page__field-control"
              />
            </div>
            {setupMode && (
              <div className="login-page__field">
                <TextField
                  label="비밀번호 확인"
                  inputId="login-password-confirm"
                  inputType="password"
                  inputName="password-confirm"
                  autoComplete="new-password"
                  size="m"
                  showHelperText={false}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  className="login-page__field-control"
                />
              </div>
            )}
            {message && (
              <p className={`login-page__message ${isError ? 'login-page__message--error' : ''}`}>{message}</p>
            )}
            <TextButton
              label={submitting ? '처리 중...' : setupMode ? '계정 저장 후 시작' : '로그인'}
              htmlType="submit"
              styleType="primary"
              size="m"
              disabled={submitting}
              className="login-page__btn"
            />
          </form>
        </Dialog>
      </Container>
    </div>
  );
}
