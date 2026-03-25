import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavigationRail from './NavigationRail';
import SectionNavRail from './SectionNavRail';
import AppBar from './AppBar';
import NavDrawer from './NavDrawer';
import './AppShell.css';

/**
 * 로그인 후 공통 레이아웃 — 좌측 프로젝트 레일, 우측 섹션 레일(데스크톱),
 * 태블릿/모바일 App Bar + 좌측 드로어
 */
export default function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sectionNavCollapsed, setSectionNavCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <NavigationRail />
      <div className="app-shell__body">
        <AppBar onOpenMenu={() => setDrawerOpen(true)} />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
      <SectionNavRail
        collapsed={sectionNavCollapsed}
        onToggleCollapsed={() => setSectionNavCollapsed((c) => !c)}
      />
      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
