import { useEffect, useState } from 'react';
import { fetchLocations, fetchTasks, fetchPlants } from '../../api/notionApi';
import { parseLocationsResponse } from '../Locations/notionSchema';
import { parseTasksResponse } from '../Tasks/notionSchema';
import { parsePlantsResponse } from '../Plants/notionSchema';
import GardenMap from '../../components/GardenMap/GardenMap';
import ErrorState from '../../components/ErrorState/ErrorState';
import './LandingPage.css';

/**
 * PG-01: 랜딩 페이지(지도) - 실제 대지 간이 지도 중심 정원 탐색
 */
function getTasksByLocation(tasks, locationId) {
  return tasks.filter((t) => t.section_id === locationId && t.status !== 'completed');
}

function getPlantsByLocation(plants, locationId) {
  return plants.filter((p) => p.section_id === locationId);
}

function getLocationById(locations, id) {
  return locations.find((l) => l.id === id);
}

export default function LandingPage() {
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
        // 맵 키 정규화와 맞추기: location.id로 조회 시 동일 형식 사용
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
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="landing-page landing-page--loading">
        <p>지도를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="landing-page landing-page--centered">
        <ErrorState variant="error" message={error} showHomeLink />
      </div>
    );
  }

  return (
    <div className="landing-page__wrap">
      <p className="notion-db-badge notion-db-badge--landing" aria-label="연동된 Notion DB">
        Notion DB: Locations(구역) · 할 일 · 식물
      </p>
      <GardenMap
        locations={locations}
        getTasksByLocation={(locationId) => getTasksByLocation(tasks, locationId)}
        getPlantsByLocation={(locationId) => getPlantsByLocation(plants, locationId)}
        getLocationById={(id) => getLocationById(locations, id)}
      />
    </div>
  );
}
