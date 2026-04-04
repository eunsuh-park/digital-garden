import { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { useProjects } from '@/app/providers/ProjectsContext';

/**
 * 구역·할 일·식물(garden_*)이 붙는 프로젝트 ID.
 * - /project/:projectId 가 유효하면 그 프로젝트
 * - 아니면 데모 프로젝트(is_demo) 우선, 없으면 본인 첫 프로젝트
 */
export function useGardenProjectId() {
  const { pathname } = useLocation();
  const { projects, loading } = useProjects();

  return useMemo(() => {
    const m = matchPath('/project/:projectId', pathname);
    const routeId = m?.params?.projectId;
    if (routeId && projects.some((p) => String(p.id) === String(routeId))) {
      const p = projects.find((x) => String(x.id) === String(routeId));
      return {
        projectId: String(routeId),
        loading: false,
        ready: true,
        isDemoProject: Boolean(p?.is_demo),
      };
    }
    if (loading) {
      return { projectId: null, loading: true, ready: false, isDemoProject: false };
    }
    const demo = projects.find((p) => p.is_demo);
    const owned = projects.find((p) => !p.is_demo);
    const pick = demo || owned;
    return {
      projectId: pick ? String(pick.id) : null,
      loading: false,
      ready: true,
      isDemoProject: Boolean(pick?.is_demo),
    };
  }, [pathname, projects, loading]);
}
