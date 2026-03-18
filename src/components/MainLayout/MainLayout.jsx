import { Outlet } from 'react-router-dom';
import SideNavigation from '../SideNavigation/SideNavigation';
import Header from '../Header/Header';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <SideNavigation />
      <div className="main-layout__body">
        <Header />
        <main className="main-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
