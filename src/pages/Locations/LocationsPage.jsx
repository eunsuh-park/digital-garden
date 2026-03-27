import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLocations, fetchTasks, fetchPlants } from '../../lib/notionApi';
import { parseLocationsResponse } from './notionSchema';
import { parseTasksResponse } from '../Tasks/notionSchema';
import { parsePlantsResponse } from '../Plants/notionSchema';
import FullPage from '../../components/FullPage/FullPage';
import ErrorState from '../../components/ErrorState/ErrorState';
import LocationMapThumb from './LocationMapThumb';
import './LocationsPage.css';

/**
 * PG-06: Locations 전체 페이지 - 공간 단위 전체 정보 탐색
 */
export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
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
        const pendingTasks = tasksList.filter((t) => t.status !== 'completed');

        const taskCountMap = {};
        const plantCountMap = {};
        pendingTasks.forEach((t) => {
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
      <FullPage title="위치" subtitle="로딩 중...">
        <p className="locations-page__loading">데이터를 불러오는 중입니다.</p>
      </FullPage>
    );
  }

  if (error) {
    return (
      <FullPage title="위치">
        <ErrorState variant="error" message={error} showHomeLink />
      </FullPage>
    );
  }

  const grouped = useMemo(() => {
    const map = new Map();
    locations.forEach((loc) => {
      const key = (loc.color_token || '').trim() || '#a8d5a2';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(loc);
    });

    return Array.from(map.entries())
      .map(([color, items]) => ({
        color,
        items: items.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko-KR')),
      }))
      .sort((a, b) => a.color.localeCompare(b.color));
  }, [locations]);

  return (
    <FullPage title="위치" subtitle="정원 구역별 요약">
      <p className="notion-db-badge" aria-label="연동된 Notion DB">
        Notion DB: Locations(구역) · 할 일 · 식물
      </p>
      <div className="locations-page__groups">
        {grouped.map((group) => (
          <section key={group.color} className="locations-page__group" aria-label={`색상 그룹 ${group.color}`}>
            <div className="locations-page__group-header">
              <span className="locations-page__group-swatch" style={{ background: group.color }} aria-hidden />
              <span className="locations-page__group-title">{group.color}</span>
              <span className="locations-page__group-count">{group.items.length}개</span>
            </div>

            <div className="locations-page__list">
              {group.items.map((location) => (
                <Link
                  key={location.id}
                  to={`/?location=${location.id}`}
                  className="locations-page__card"
                >
                  <LocationMapThumb svgId={location.svg_id} colorToken={location.color_token} />
                  <span
                    className="locations-page__card-color"
                    style={{ background: location.color_token }}
                    aria-hidden
                  />
                  <div className="locations-page__card-body">
                    <h2 className="locations-page__card-name">{location.name}</h2>
                    <p className="locations-page__card-meta">
                      할 일 {location.taskCount}건 · 식물 {location.plantCount}종
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </FullPage>
  );
}
