import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchLocations, fetchTasks, fetchPlants } from '../api/notionApi';
import { parseLocationsResponse } from '../pages/Locations/notionSchema';
import { parseTasksResponse } from '../pages/Tasks/notionSchema';
import { parsePlantsResponse } from '../pages/Plants/notionSchema';

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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [locationsRes, tasksRes, plantsRes] = await Promise.all([
          fetchLocations(),
          fetchTasks(),
          fetchPlants(),
        ]);
        if (cancelled) return;

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
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ locations, tasks, plants, loading, error }),
    [locations, tasks, plants, loading, error]
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
