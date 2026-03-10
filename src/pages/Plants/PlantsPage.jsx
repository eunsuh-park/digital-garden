import { useEffect, useState } from 'react';
import { fetchLocations, fetchPlants } from '../../api/notionApi';
import { parseLocationsResponse } from '../Locations/notionSchema';
import { parsePlantsResponse } from './notionSchema';
import FullPage from '../../components/FullPage/FullPage';
import ErrorState from '../../components/ErrorState/ErrorState';
import './PlantsPage.css';

/**
 * PG-07: Plants 전체 페이지 - 식물 DB 전체 조회
 */
export default function PlantsPage() {
  const [locations, setLocations] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [locationsRes, plantsRes] = await Promise.all([
          fetchLocations(),
          fetchPlants(),
        ]);
        if (cancelled) return;

        const plantsList = parsePlantsResponse(plantsRes);
        const locationsList = parseLocationsResponse(locationsRes);
        setPlants(plantsList);
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

  const plantsBySection = {};
  locations.forEach((s) => {
    plantsBySection[s.id] = plants.filter((p) => p.section_id === s.id);
  });

  const hasContent = locations.some((s) => (plantsBySection[s.id] || []).length > 0);

  if (loading) {
    return (
      <FullPage title="식물" subtitle="로딩 중...">
        <p className="plants-page__loading">데이터를 불러오는 중입니다.</p>
      </FullPage>
    );
  }

  if (error) {
    return (
      <FullPage title="식물">
        <ErrorState variant="error" message={error} showHomeLink />
      </FullPage>
    );
  }

  return (
    <FullPage
      title="식물"
      subtitle={`식재된 식물 ${plants.length}종`}
      emptyMessage={!hasContent ? '등록된 식물이 없습니다.' : undefined}
    >
      <p className="notion-db-badge" aria-label="연동된 Notion DB">
        Notion DB: Locations(구역) · 식물
      </p>
      <div className="full-page__list">
        {locations.map((section) => {
          const sectionPlants = plantsBySection[section.id] || [];
          if (sectionPlants.length === 0) return null;

          return (
            <section key={section.id} className="full-page__group">
              <h2 className="full-page__group-title">
                <span
                  className="full-page__group-color"
                  style={{ background: section.color_token }}
                />
                {section.name}
              </h2>
              <ul className="full-page__item-list">
                {sectionPlants.map((plant) => (
                  <li key={plant.id} className="full-page__item full-page__item--between">
                    <span className="full-page__item-title">{plant.name}</span>
                    <span className="full-page__item-meta">
                      {plant.category} · {plant.species}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </FullPage>
  );
}
