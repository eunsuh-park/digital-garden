import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import menuLine from '@iconify-icons/mingcute/menu-line';
import settings3Line from '@iconify-icons/mingcute/settings-3-line';
import user3Line from '@iconify-icons/mingcute/user-3-line';
import exitDoorLine from '@iconify-icons/mingcute/exit-door-line';
import logoSymbol from '@/asset/logo/symbol.svg';
import './AppBar.css';

/**
 * 태블릿·모바일 상단 App Bar — 로고 중앙, 좌측 메뉴
 * 태블릿(768~1023): 우측에 설정·프로필·로그아웃
 */
export default function AppBar({ onOpenMenu }) {
  return (
    <header className="app-bar">
      <button
        type="button"
        className="app-bar__menu"
        onClick={onOpenMenu}
        aria-label="메뉴 열기"
      >
        <Icon icon={menuLine} width={24} height={24} />
      </button>

      <Link to="/" className="app-bar__logo" aria-label="디지털 가든 홈">
        <img src={logoSymbol} alt="" width={32} height={30} />
      </Link>

      <div className="app-bar__end" aria-label="계정 메뉴(플레이스홀더)">
        <button type="button" className="app-bar__icon-btn" aria-label="설정 (준비 중)">
          <Icon icon={settings3Line} width={22} height={22} />
        </button>
        <button type="button" className="app-bar__icon-btn" aria-label="프로필 (준비 중)">
          <Icon icon={user3Line} width={22} height={22} />
        </button>
        <button type="button" className="app-bar__icon-btn" aria-label="로그아웃 (준비 중)">
          <Icon icon={exitDoorLine} width={22} height={22} />
        </button>
      </div>
    </header>
  );
}
