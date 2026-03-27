import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import bookmarkFill from '@iconify-icons/mingcute/bookmark-fill';
import addLine from '@iconify-icons/mingcute/add-line';
import settings3Line from '@iconify-icons/mingcute/settings-3-line';
import user3Line from '@iconify-icons/mingcute/user-3-line';
import exitDoorLine from '@iconify-icons/mingcute/exit-door-line';
import logoSymbol from '@/asset/logo/symbol.svg';
import './NavigationRail.css';

/** 데스크톱(≥1024px) 좌측 고정 네비게이션 레일 — 프로젝트 슬롯 + 하단 액션(플레이스홀더) */
export default function NavigationRail() {
  return (
    <aside className="navigation-rail" aria-label="프로젝트 및 계정">
      <div className="navigation-rail__top">
        <Link to="/" className="navigation-rail__logo" aria-label="홈">
          <img src={logoSymbol} alt="" width={36} height={34} />
        </Link>
      </div>

      <nav className="navigation-rail__projects" aria-label="프로젝트">
        <div className="navigation-rail__project navigation-rail__project--active">
          <button type="button" className="navigation-rail__project-btn" aria-current="true">
            <Icon icon={bookmarkFill} width={22} height={22} aria-hidden />
          </button>
          <span className="navigation-rail__project-label">Garden 1</span>
        </div>
        <div className="navigation-rail__project navigation-rail__project--empty">
          <button type="button" className="navigation-rail__project-btn" aria-label="프로젝트 추가 (준비 중)" disabled>
            <Icon icon={addLine} width={22} height={22} aria-hidden />
          </button>
        </div>
        <div className="navigation-rail__project navigation-rail__project--empty">
          <button type="button" className="navigation-rail__project-btn" aria-label="프로젝트 추가 (준비 중)" disabled>
            <Icon icon={addLine} width={22} height={22} aria-hidden />
          </button>
        </div>
      </nav>

      <div className="navigation-rail__bottom">
        <button type="button" className="navigation-rail__icon-btn" aria-label="설정 (준비 중)">
          <Icon icon={settings3Line} width={22} height={22} />
        </button>
        <button type="button" className="navigation-rail__icon-btn" aria-label="프로필 (준비 중)">
          <Icon icon={user3Line} width={22} height={22} />
        </button>
        <button type="button" className="navigation-rail__icon-btn" aria-label="로그아웃 (준비 중)">
          <Icon icon={exitDoorLine} width={22} height={22} />
        </button>
      </div>
    </aside>
  );
}
