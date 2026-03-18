import { Outlet } from 'react-router-dom';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar';
import SideNavigation from '../SideNavigation/SideNavigation';
import Header from '../Header/Header';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SideNavigation />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="main-layout__main">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
