import { useZones } from '@/app/providers/ZonesContext';
import GardenMap from '@/features/garden-map/GardenMap';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import './LandingPage.css';

/**
 * PG-01: 랜딩 페이지(지도) - 실제 대지 간이 지도 중심 정원 탐색
 */
function getTasksByZone(tasks, zoneId) {
  return tasks.filter((t) => t.zone_id === zoneId && t.status !== 'completed');
}

function getPlantsByZone(plants, zoneId) {
  return plants.filter((p) => p.zone_id === zoneId);
}

function getZoneById(zones, id) {
  return zones.find((z) => z.id === id);
}

export default function LandingPage() {
  const { zones, tasks, plants, loading, error } = useZones();

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
      <GardenMap
        zones={zones}
        getTasksByZone={(zoneId) => getTasksByZone(tasks, zoneId)}
        getPlantsByZone={(zoneId) => getPlantsByZone(plants, zoneId)}
        getZoneById={(id) => getZoneById(zones, id)}
      />
    </div>
  );
}
