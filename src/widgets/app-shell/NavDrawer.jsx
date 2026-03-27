import { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import mapLine from '@iconify-icons/mingcute/map-line';
import task2Line from '@iconify-icons/mingcute/task-2-line';
import leaf3Fill from '@iconify-icons/mingcute/leaf-3-fill';
import bookmarkFill from '@iconify-icons/mingcute/bookmark-fill';
import addLine from '@iconify-icons/mingcute/add-line';
import settings3Line from '@iconify-icons/mingcute/settings-3-line';
import user3Line from '@iconify-icons/mingcute/user-3-line';
import exitDoorLine from '@iconify-icons/mingcute/exit-door-line';
import closeLine from '@iconify-icons/mingcute/close-line';
import logoSymbol from '@/asset/logo/symbol.svg';
import './NavDrawer.css';

/**
 * 좌측에서 슬라이드되는 내비 — 태블릿/모바일 햄버거
 * 태블릿: 프로젝트 + 지도/할일/식물 (CSS로 하단 푸터 숨김)
 * 모바일: 위 + 설정/프로필/로그아웃
 */
export default function NavDrawer({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`nav-drawer__backdrop ${isOpen ? 'nav-drawer__backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`nav-drawer ${isOpen ? 'nav-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
      >
        <div className="nav-drawer__head">
          <Link to="/" className="nav-drawer__brand" onClick={onClose}>
            <img src={logoSymbol} alt="" width={36} height={34} />
            <span className="nav-drawer__brand-text">디지털 가든</span>
          </Link>
          <button type="button" className="nav-drawer__close" onClick={onClose} aria-label="메뉴 닫기">
            <Icon icon={closeLine} width={22} height={22} />
          </button>
        </div>

        <div className="nav-drawer__scroll">
          <section className="nav-drawer__section" aria-labelledby="nav-drawer-projects-heading">
            <h2 id="nav-drawer-projects-heading" className="nav-drawer__section-title">
              프로젝트
            </h2>
            <div className="nav-drawer__projects">
              <div className="nav-drawer__project nav-drawer__project--active">
                <span className="nav-drawer__project-icon" aria-hidden>
                  <Icon icon={bookmarkFill} width={20} height={20} />
                </span>
                <span className="nav-drawer__project-name">Garden 1</span>
              </div>
              <div className="nav-drawer__project nav-drawer__project--empty">
                <span className="nav-drawer__project-icon" aria-hidden>
                  <Icon icon={addLine} width={20} height={20} />
                </span>
                <span className="nav-drawer__project-name">빈 슬롯</span>
              </div>
              <div className="nav-drawer__project nav-drawer__project--empty">
                <span className="nav-drawer__project-icon" aria-hidden>
                  <Icon icon={addLine} width={20} height={20} />
                </span>
                <span className="nav-drawer__project-name">빈 슬롯</span>
              </div>
            </div>
          </section>

          <section className="nav-drawer__section nav-drawer__section--mobile-hide" aria-labelledby="nav-drawer-nav-heading">
            <h2 id="nav-drawer-nav-heading" className="nav-drawer__section-title">
              이동
            </h2>
            <nav className="nav-drawer__links">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-drawer__link ${isActive ? 'nav-drawer__link--active' : ''}`
                }
                onClick={onClose}
              >
                <Icon icon={mapLine} width={20} height={20} />
                지도
              </NavLink>
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `nav-drawer__link ${isActive ? 'nav-drawer__link--active' : ''}`
                }
                onClick={onClose}
              >
                <Icon icon={task2Line} width={20} height={20} />
                할 일
              </NavLink>
              <NavLink
                to="/plants"
                className={({ isActive }) =>
                  `nav-drawer__link ${isActive ? 'nav-drawer__link--active' : ''}`
                }
                onClick={onClose}
              >
                <Icon icon={leaf3Fill} width={20} height={20} />
                식물
              </NavLink>
            </nav>
          </section>

          <section className="nav-drawer__footer" aria-label="계정(플레이스홀더)">
            <button type="button" className="nav-drawer__footer-btn">
              <Icon icon={settings3Line} width={20} height={20} />
              설정
            </button>
            <button type="button" className="nav-drawer__footer-btn">
              <Icon icon={user3Line} width={20} height={20} />
              프로필
            </button>
            <button type="button" className="nav-drawer__footer-btn">
              <Icon icon={exitDoorLine} width={20} height={20} />
              로그아웃
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
