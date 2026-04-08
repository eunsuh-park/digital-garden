import { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { useProjects } from '@/app/providers/ProjectsContext';

const PROJECT_ROUTE_PATTERNS = [
  { path: '/project/:projectId/tasks', end: true },
  { path: '/project/:projectId/plants', end: true },
  { path: '/project/:projectId', end: true },
];

function parseRouteProjectId(pathname) {
  for (const opts of PROJECT_ROUTE_PATTERNS) {
    const m = matchPath(opts, pathname);
    if (m?.params?.projectId) return m.params.projectId;
  }
  return null;
}

/**
 * 구역·할 일·식물(garden_*)이 붙는 프로젝트 ID.
 * - /project/:projectId[/tasks|/plants] 가 목록에 있으면 그 프로젝트
 * - 목록에 없는 id면 invalidProject (404 처리용)
 * - 그 외 경로(/, /dashboard 등)는 projectId 없음 (데모 자동 선택 없음)
 */
export function useGardenProjectId() {
  const { pathname } = useLocation();
  const { projects, loading } = useProjects();

  return useMemo(() => {
    const routeId = parseRouteProjectId(pathname);

    if (routeId && routeId !== 'new') {
      if (loading) {
        return {
          projectId: null,
          loading: true,
          ready: false,
          isDemoProject: false,
          invalidProject: false,
        };
      }
      const p = projects.find((x) => String(x.id) === String(routeId));
      if (p) {
        return {
          projectId: String(routeId),
          loading: false,
          ready: true,
          isDemoProject: Boolean(p.is_demo),
          invalidProject: false,
        };
      }
      return {
        projectId: null,
        loading: false,
        ready: true,
        isDemoProject: false,
        invalidProject: true,
      };
    }

    if (loading) {
      return {
        projectId: null,
        loading: true,
        ready: false,
        isDemoProject: false,
        invalidProject: false,
      };
    }

    return {
      projectId: null,
      loading: false,
      ready: true,
      isDemoProject: false,
      invalidProject: false,
    };
  }, [pathname, projects, loading]);
}
