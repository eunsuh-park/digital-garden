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
  const { isAuthenticated, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [setupMode, setSetupMode] = useState(false);
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

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setIsError(true);
      setMessage('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(normalizedEmail, password);
      if (!result.ok) {
        setIsError(true);
        setMessage(result.reason || '로그인에 실패했습니다. 이메일/비밀번호를 확인해 주세요.');
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

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password || !confirmPassword) {
      setIsError(true);
      setMessage('이메일, 비밀번호, 비밀번호 확인을 모두 입력해 주세요.');
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
      const result = await register(normalizedEmail, password);
      if (!result.ok) {
        setIsError(true);
        setMessage(result.reason || '회원가입에 실패했습니다.');
        return;
      }
      setIsError(false);
      setMessage('회원가입 성공! 이제 로그인해 주세요.');
      setSetupMode(false);
      setPassword('');
      setConfirmPassword('');
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
                  <span className="login-page__meta">이미 계정이 있으신가요?</span>
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
                  <span className="login-page__meta">계정이 없으신가요?</span>
                  <TextButton
                    label="회원가입"
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
                label="이메일"
                inputId="login-email"
                inputType="email"
                inputName="email"
                autoComplete="email"
                size="m"
                showHelperText={false}
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
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
              label={submitting ? '처리 중...' : setupMode ? '회원가입' : '로그인'}
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
