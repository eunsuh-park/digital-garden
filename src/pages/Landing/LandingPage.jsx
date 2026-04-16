import { Link, Navigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import mapLine from '@iconify-icons/mingcute/map-line';
import { useGardenProjectId } from '@/app/providers/useGardenProjectId';
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
  const { invalidProject, projectId, ready: gpReady, isDemoProject } = useGardenProjectId();
  const { zones, tasks, plants, loading, error, isReadOnlyGarden } = useZones();

  const showMapBuilderCta =
    gpReady &&
    !invalidProject &&
    Boolean(projectId) &&
    !isReadOnlyGarden &&
    !loading &&
    !error &&
    zones.length === 0;

  if (invalidProject) {
    return (
      <div className="landing-page landing-page--centered">
        <ErrorState
          variant="404"
          title="프로젝트를 찾을 수 없습니다"
          message="목록에 없거나 삭제된 프로젝트일 수 있어요."
          showHomeLink
        />
      </div>
    );
  }

  if (gpReady && !invalidProject && !projectId) {
    return <Navigate to="/" replace />;
  }

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

  if (showMapBuilderCta) {
    return (
      <div className="landing-page landing-page--map-pending">
        <div className="landing-page__map-pending">
          <h1 className="landing-page__map-pending-title">정원 지도를 아직 그리지 않았어요</h1>
          <p className="landing-page__map-pending-desc">
            맵 빌더에서 터를 그리면 이 화면에서 정원 지도와 구역·할 일·식물을 함께 쓸 수 있어요.
          </p>
          <Link
            to={`/project/${projectId}/map-builder`}
            className="landing-page__map-pending-btn"
          >
            <Icon icon={mapLine} width={20} height={20} aria-hidden />
            맵 빌딩 마저하기
          </Link>
        </div>
      </div>
    );
  }

  if (!isDemoProject) {
    return (
      <div className="landing-page landing-page--centered">
        <p>데모 프로젝트에서만 기본 정원 배경 맵을 표시합니다.</p>
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
