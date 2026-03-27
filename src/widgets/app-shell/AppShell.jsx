import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LocationsProvider } from '@/app/providers/LocationsContext';
import { ToastProvider } from '@/app/providers/ToastContext';
import { TasksPanelUiProvider } from '@/app/providers/TasksPanelUiContext';
import { PlantsPanelUiProvider } from '@/app/providers/PlantsPanelUiContext';
import { MapPanelLayoutProvider } from '@/app/providers/MapPanelLayoutContext';
import { MapPanelDetailProvider, useMapPanelDetail } from '@/app/providers/MapPanelDetailContext';
import { useAuth } from '@/app/providers/AuthContext';
import NavigationRail from './NavigationRail';
import MapSidePanel from '@/widgets/map-panel/MapSidePanel';
import AppBar from './AppBar';
import NavDrawer from './NavDrawer';
import './AppShell.css';

function AppShellWithDetailSync() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sectionNavCollapsed, setSectionNavCollapsed] = useState(true);
  const { detail } = useMapPanelDetail();

  useEffect(() => {
    if (detail) setSectionNavCollapsed(false);
  }, [detail]);

  function handleLogout() {
    logout();
    setDrawerOpen(false);
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <NavigationRail onLogout={handleLogout} />
      <div className="app-shell__body">
        <AppBar onOpenMenu={() => setDrawerOpen(true)} onLogout={handleLogout} />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
      <MapSidePanel
        collapsed={sectionNavCollapsed}
        onToggleCollapsed={() => setSectionNavCollapsed((c) => !c)}
      />
      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onLogout={handleLogout} />
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
      <ToastProvider>
        <TasksPanelUiProvider>
          <PlantsPanelUiProvider>
            <MapPanelLayoutProvider>
              <MapPanelDetailProvider>
                <AppShellWithDetailSync />
              </MapPanelDetailProvider>
            </MapPanelLayoutProvider>
          </PlantsPanelUiProvider>
        </TasksPanelUiProvider>
      </ToastProvider>
    </LocationsProvider>
  );
}
