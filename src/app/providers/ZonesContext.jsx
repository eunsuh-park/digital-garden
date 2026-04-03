import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { fetchZones, fetchTasks, fetchPlants } from '@/shared/api/notionApi';
import { parseZonesResponse } from '@/entities/zone/lib/notion-schema';
import { parseTasksResponse } from '@/entities/task/lib/notion-schema';
import { parsePlantsResponse } from '@/entities/plant/lib/notion-schema';

const ZonesContext = createContext(null);

/**
 * 구역(zones)·할 일·식물 데이터 — AppShell 하위(지도·우측 패널)에서 공유
 */
export function ZonesProvider({ children }) {
  const [zones, setZones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);

  const load = useCallback(async (options = {}) => {
    const silent = options.silent === true;
    const requestId = ++requestIdRef.current;
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const [zonesRes, tasksRes, plantsRes] = await Promise.all([
        fetchZones(),
        fetchTasks(),
        fetchPlants(),
      ]);

      if (requestIdRef.current !== requestId) return;

      const tasksList = parseTasksResponse(tasksRes);
      const plantsList = parsePlantsResponse(plantsRes);
      const taskCountMap = {};
      const plantCountMap = {};
      const normId = (id) => (id == null ? '' : String(id).trim());
      tasksList.filter((t) => t.status !== 'completed').forEach((t) => {
        const zid = normId(t.zone_id);
        if (zid) taskCountMap[zid] = (taskCountMap[zid] || 0) + 1;
      });
      plantsList.forEach((p) => {
        const zid = normId(p.zone_id);
        if (zid) plantCountMap[zid] = (plantCountMap[zid] || 0) + 1;
      });

      let zonesList = parseZonesResponse(zonesRes, taskCountMap, plantCountMap);
      zonesList = zonesList.map((z) => ({
        ...z,
        taskCount: taskCountMap[normId(z.id)] ?? z.taskCount ?? 0,
        plantCount: plantCountMap[normId(z.id)] ?? z.plantCount ?? 0,
      }));
      setZones(zonesList);
      setTasks(tasksList);
      setPlants(plantsList);
    } catch (e) {
      if (requestIdRef.current === requestId) setError(e.message);
    } finally {
      if (requestIdRef.current === requestId && !silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => {
    load({ silent: true });
  }, [load]);

  const value = useMemo(
    () => ({ zones, tasks, plants, loading, error, reload }),
    [zones, tasks, plants, loading, error, reload]
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
