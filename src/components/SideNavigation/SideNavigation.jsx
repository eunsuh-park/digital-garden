import { Link, useLocation } from 'react-router-dom';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

// TODO: loadProjects()로 교체
const MOCK_PROJECTS = [
  { id: '1', name: '베란다 미니 정원' },
  { id: '2', name: '뒷뜰 조경' },
];

export default function SideNavigation() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" isActive={path === '/map'}>
              <Link to="/map">디지털 가든</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>프로젝트</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MOCK_PROJECTS.map((project, index) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild isActive={path === '/map' && index === 0}>
                    <Link to="/map">{project.name}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/project">+ 새 프로젝트</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
