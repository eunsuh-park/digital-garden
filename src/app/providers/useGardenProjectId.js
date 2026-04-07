import { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { useProjects } from '@/app/providers/ProjectsContext';

/**
 * 구역·할 일·식물(garden_*)이 붙는 프로젝트 ID.
 * - /project/:projectId(단, new 제외) 가 목록에 있으면 그 프로젝트
 * - 목록에 없는 id면 invalidProject (404 처리용)
 * - 그 외 경로(/)는 데모 프로젝트(is_demo) 우선, 없으면 본인 첫 프로젝트
 */
export function useGardenProjectId() {
  const { pathname } = useLocation();
  const { projects, loading } = useProjects();

  return useMemo(() => {
    const m = matchPath({ path: '/project/:projectId', end: true }, pathname);
    const routeId = m?.params?.projectId;

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
    const demo = projects.find((pr) => pr.is_demo);
    const owned = projects.find((pr) => !pr.is_demo);
    const pick = demo || owned;
    return {
      projectId: pick ? String(pick.id) : null,
      loading: false,
      ready: true,
      isDemoProject: Boolean(pick?.is_demo),
      invalidProject: false,
    };
  }, [pathname, projects, loading]);
}
