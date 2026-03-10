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

function getLocationById(locations, id) {
  return locations.find((l) => l.id === id);
}

export default function LandingPage() {
  const [locations, setLocations] = useState([]);
  const [tasks, setTasks] = useState([]);
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
        tasksList.filter((t) => t.status !== 'completed').forEach((t) => {
          if (t.section_id) taskCountMap[t.section_id] = (taskCountMap[t.section_id] || 0) + 1;
        });
        plantsList.forEach((p) => {
          if (p.section_id) plantCountMap[p.section_id] = (plantCountMap[p.section_id] || 0) + 1;
        });

        const locationsList = parseLocationsResponse(
          locationsRes,
          taskCountMap,
          plantCountMap
        );
        setLocations(locationsList);
        setTasks(tasksList);
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
        getLocationById={(id) => getLocationById(locations, id)}
      />
    </div>
  );
}
