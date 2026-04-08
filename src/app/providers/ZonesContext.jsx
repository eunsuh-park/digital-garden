import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isDevMockEnabled } from '@/lib/isDevMock';
import { getDemoGardenSnapshot } from '@/shared/lib/gardenDemoSeed';
import { loadGardenData } from '@/shared/api/gardenApi';
import { useGardenProjectId } from '@/app/providers/useGardenProjectId';

const ZonesContext = createContext(null);

/**
 * 구역·할 일·식물 — project_id(프로젝트) 단위, Supabase garden_* 테이블
 */
export function ZonesProvider({ children }) {
  const { projectId, loading: projectLoading, ready: projectReady, isDemoProject } = useGardenProjectId();

  const [zones, setZones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [plants, setPlants] = useState([]);
  const [internalBusy, setInternalBusy] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);
  const loading = projectLoading || internalBusy;

  const load = useCallback(
    async (options = {}) => {
      const silent = options.silent === true;
      const requestId = ++requestIdRef.current;
      try {
        if (!silent) {
          setInternalBusy(true);
        }
        setError(null);

        if (isDevMockEnabled()) {
          if (isDemoProject) {
            const snap = getDemoGardenSnapshot();
            if (requestIdRef.current !== requestId) return;
            setZones(snap.zones);
            setTasks(snap.tasks);
            setPlants(snap.plants);
          } else {
            if (requestIdRef.current !== requestId) return;
            setZones([]);
            setTasks([]);
            setPlants([]);
          }
          return;
        }

        if (!projectReady || projectLoading) {
          return;
        }

        if (!projectId) {
          if (requestIdRef.current !== requestId) return;
          setZones([]);
          setTasks([]);
          setPlants([]);
          return;
        }

        const { zones: z, tasks: t, plants: p } = await loadGardenData(projectId);
        if (requestIdRef.current !== requestId) return;
        setZones(z);
        setTasks(t);
        setPlants(p);
      } catch (e) {
        if (requestIdRef.current === requestId) {
          const msg = e instanceof Error ? e.message : String(e);
          setError(msg || '데이터를 불러오지 못했습니다.');
        }
      } finally {
        if (requestIdRef.current === requestId && !silent) {
          setInternalBusy(false);
        }
      }
    },
    [projectId, projectLoading, projectReady, isDemoProject]
  );

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => {
    load({ silent: true });
  }, [load]);

  const value = useMemo(
    () => ({
      zones,
      tasks,
      plants,
      loading,
      error,
      reload,
      projectId,
      isReadOnlyGarden: Boolean(isDemoProject),
    }),
    [zones, tasks, plants, loading, error, reload, projectId, isDemoProject]
  );

  return <ZonesContext.Provider value={value}>{children}</ZonesContext.Provider>;
}

export function useZones() {
  const ctx = useContext(ZonesContext);
  if (!ctx) {
    throw new Error('useZones는 ZonesProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
