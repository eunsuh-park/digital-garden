import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { fetchLocations, fetchTasks, fetchPlants } from '@/shared/api/notionApi';
import { parseLocationsResponse } from '@/entities/location/lib/notion-schema';
import { parseTasksResponse } from '@/entities/task/lib/notion-schema';
import { parsePlantsResponse } from '@/entities/plant/lib/notion-schema';

const LocationsContext = createContext(null);

/**
 * 구역(locations)·할 일·식물 데이터 — AppShell 하위(지도·우측 패널)에서 공유
 */
export function LocationsProvider({ children }) {
  const [locations, setLocations] = useState([]);
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
      const [locationsRes, tasksRes, plantsRes] = await Promise.all([
        fetchLocations(),
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
        const sid = normId(t.section_id);
        if (sid) taskCountMap[sid] = (taskCountMap[sid] || 0) + 1;
      });
      plantsList.forEach((p) => {
        const sid = normId(p.section_id);
        if (sid) plantCountMap[sid] = (plantCountMap[sid] || 0) + 1;
      });

      let locationsList = parseLocationsResponse(
        locationsRes,
        taskCountMap,
        plantCountMap
      );
      locationsList = locationsList.map((loc) => ({
        ...loc,
        taskCount: taskCountMap[normId(loc.id)] ?? loc.taskCount ?? 0,
        plantCount: plantCountMap[normId(loc.id)] ?? loc.plantCount ?? 0,
      }));
      setLocations(locationsList);
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

  /** 삭제·수정 후 데이터만 갱신 — 전역 로딩 화면을 띄우지 않음 */
  const reload = useCallback(() => {
    load({ silent: true });
  }, [load]);

  const value = useMemo(
    () => ({ locations, tasks, plants, loading, error, reload }),
    [locations, tasks, plants, loading, error, reload]
  );

  return <LocationsContext.Provider value={value}>{children}</LocationsContext.Provider>;
}

export function useLocations() {
  const ctx = useContext(LocationsContext);
  if (!ctx) {
    throw new Error('useLocations는 LocationsProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
