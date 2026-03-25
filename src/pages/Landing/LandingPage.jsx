import { useLocations } from '../../context/LocationsContext';
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
  const { locations, tasks, plants, loading, error } = useLocations();

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
