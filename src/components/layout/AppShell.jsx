import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LocationsProvider } from '../../context/LocationsContext';
import { MapPanelLayoutProvider } from '../../context/MapPanelLayoutContext';
import { MapPanelDetailProvider, useMapPanelDetail } from '../../context/MapPanelDetailContext';
import NavigationRail from './NavigationRail';
import MapSidePanel from './MapSidePanel';
import AppBar from './AppBar';
import NavDrawer from './NavDrawer';
import './AppShell.css';

function AppShellWithDetailSync() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sectionNavCollapsed, setSectionNavCollapsed] = useState(true);
  const { detail } = useMapPanelDetail();

  useEffect(() => {
    if (detail) setSectionNavCollapsed(false);
  }, [detail]);

  return (
    <div className="app-shell">
      <NavigationRail />
      <div className="app-shell__body">
        <AppBar onOpenMenu={() => setDrawerOpen(true)} />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
      <MapSidePanel
        collapsed={sectionNavCollapsed}
        onToggleCollapsed={() => setSectionNavCollapsed((c) => !c)}
      />
      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

/**
 * 로그인 후 공통 레이아웃
 * - 데스크톱: 좌 NavigationRail · 가운데 본문 · 우 MapSidePanel
 * - 모바일·태블릿: App Bar + 본문(상) + MapSidePanel(하) + NavDrawer
 */
export default function AppShell() {
  return (
    <LocationsProvider>
      <MapPanelLayoutProvider>
        <MapPanelDetailProvider>
          <AppShellWithDetailSync />
        </MapPanelDetailProvider>
      </MapPanelLayoutProvider>
    </LocationsProvider>
  );
}
