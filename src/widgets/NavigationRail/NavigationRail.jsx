import { Link, NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import bookmarkFill from '@iconify-icons/mingcute/bookmark-fill';
import addLine from '@iconify-icons/mingcute/add-line';
import settings3Line from '@iconify-icons/mingcute/settings-3-line';
import user3Line from '@iconify-icons/mingcute/user-3-line';
import exitDoorLine from '@iconify-icons/mingcute/exit-door-line';
import logoSymbol from '@/asset/logo/symbol.svg';
import { useAuth } from '@/app/providers/AuthContext';
import { useProjects } from '@/app/providers/ProjectsContext';
import { Tooltip } from '@/shared/ui/tooltip/Tooltip';
import './NavigationRail.css';

const MAX_SLOTS = 3;

function truncateLabel(name, max = 10) {
  const s = String(name || '').trim();
  if (s.length <= max) return s || '프로젝트';
  return `${s.slice(0, max - 1)}…`;
}

/** 데스크톱(≥1024px) 좌측 고정 네비게이션 레일 — 프로젝트 슬롯(최대 3) + 새 프로젝트 */
export default function NavigationRail({ onOpenSettings, onLogout }) {
  const { currentUser } = useAuth();
  const { projects, loading } = useProjects();
  const profileTooltip =
    typeof currentUser?.email === 'string' && currentUser.email.trim() !== ''
      ? currentUser.email.trim()
      : '프로필';

  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => projects[i] ?? null);
  const firstEmptyIndex = slots.findIndex((s) => s === null);

  return (
    <aside className="navigation-rail" aria-label="프로젝트 및 계정">
      <div className="navigation-rail__top">
        <Link to="/" className="navigation-rail__logo" aria-label="홈">
          <img src={logoSymbol} alt="" width={36} height={34} />
        </Link>
      </div>

      <nav className="navigation-rail__projects" aria-label="프로젝트">
        {loading && projects.length === 0 ? (
          <p className="navigation-rail__loading" aria-live="polite">
            불러오는 중…
          </p>
        ) : null}

        {!(loading && projects.length === 0) &&
          slots.map((p, idx) => {
          if (p) {
            const to = `/project/${p.id}`;
            const projectTooltip =
              typeof p.name === 'string' && p.name.trim() !== '' ? p.name.trim() : '(이름 없음)';
            return (
              <div key={p.id} className="navigation-rail__project">
                <Tooltip
                  content={projectTooltip}
                  placement="right"
                  trigger="hover"
                  className="navigation-rail__tooltip navigation-rail__tooltip--project"
                >
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `navigation-rail__project-btn ${isActive ? 'navigation-rail__project-link--active' : ''}`
                    }
                  >
                    <Icon icon={bookmarkFill} width={22} height={22} aria-hidden />
                  </NavLink>
                </Tooltip>
                <span className="navigation-rail__project-label">{truncateLabel(p.name)}</span>
              </div>
            );
          }

          const isFirstEmptySlot = idx === firstEmptyIndex;

          return (
            <div key={`empty-${idx}`} className="navigation-rail__project navigation-rail__project--empty">
              {isFirstEmptySlot ? (
                <Tooltip
                  content="새 프로젝트 만들기"
                  placement="right"
                  trigger="hover"
                  className="navigation-rail__tooltip"
                >
                  <Link
                    to="/project/new"
                    className="navigation-rail__project-btn"
                    aria-label="새 프로젝트 만들기"
                  >
                    <Icon icon={addLine} width={22} height={22} aria-hidden />
                  </Link>
                </Tooltip>
              ) : (
                <Tooltip
                  content="위 슬롯부터 순서대로 채워 주세요"
                  placement="right"
                  trigger="hover"
                  className="navigation-rail__tooltip"
                >
                  <span className="navigation-rail__slot-disabled-wrap">
                    <button
                      type="button"
                      className="navigation-rail__project-btn"
                      disabled
                      aria-label="위 슬롯부터 순서대로 프로젝트를 만드세요"
                    >
                      <Icon icon={addLine} width={22} height={22} aria-hidden />
                    </button>
                  </span>
                </Tooltip>
              )}
            </div>
          );
        })}
      </nav>

      <div className="navigation-rail__bottom">
        <Tooltip content="설정" placement="right" trigger="hover" className="navigation-rail__tooltip">
          <button type="button" className="navigation-rail__icon-btn" aria-label="설정 열기" onClick={onOpenSettings}>
            <Icon icon={settings3Line} width={22} height={22} aria-hidden />
          </button>
        </Tooltip>
        <Tooltip
          content={profileTooltip}
          placement="right"
          trigger="hover"
          className="navigation-rail__tooltip navigation-rail__tooltip--account"
        >
          <button type="button" className="navigation-rail__icon-btn" aria-label="프로필 (준비 중)">
            <Icon icon={user3Line} width={22} height={22} aria-hidden />
          </button>
        </Tooltip>
        <Tooltip content="로그아웃" placement="right" trigger="hover" className="navigation-rail__tooltip">
          <button type="button" className="navigation-rail__icon-btn" aria-label="로그아웃" onClick={onLogout}>
            <Icon icon={exitDoorLine} width={22} height={22} aria-hidden />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
