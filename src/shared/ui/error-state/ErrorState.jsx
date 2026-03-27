import { Link } from 'react-router-dom';
import './ErrorState.css';

/**
 * 404, API/네트워크 오류 등 에러 상태 통합 컴포넌트
 * @param {Object} props
 * @param {'error' | '404'} props.variant - 'error': API/네트워크 오류, '404': 페이지 없음
 * @param {string} [props.title] - 표시할 제목
 * @param {string} [props.message] - 상세 메시지
 * @param {boolean} [props.showHomeLink] - 홈으로 가기 링크 표시 (기본: 404일 때 true)
 */
export default function ErrorState({ variant = 'error', title, message, showHomeLink }) {
  const is404 = variant === '404';
  const displayTitle = title ?? (is404 ? '페이지를 찾을 수 없습니다' : '오류가 발생했습니다');
  const displayMessage = message ?? (is404 ? '요청한 페이지가 존재하지 않습니다.' : '잠시 후 다시 시도해 주세요.');
  const showLink = showHomeLink ?? is404;

  return (
    <div className="error-state" role="alert" aria-live="polite">
      <div className="error-state__icon" aria-hidden>
        {is404 ? '🔍' : '⚠️'}
      </div>
      <h2 className="error-state__title">{displayTitle}</h2>
      <p className="error-state__message">{displayMessage}</p>
      {showLink && (
        <Link to="/" className="error-state__link">
          홈으로 돌아가기
        </Link>
      )}
    </div>
  );
}
