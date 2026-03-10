import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSections, fetchTasks, fetchPlants } from '../../api/notionApi';
import { parseSectionsResponse } from './notionSchema';
import { parseTasksResponse } from '../Tasks/notionSchema';
import { parsePlantsResponse } from '../Plants/notionSchema';
import FullPage from '../../components/FullPage/FullPage';
import './LocationsPage.css';

/**
 * PG-06: Locations 전체 페이지 - 공간 단위 전체 정보 탐색
 */
export default function LocationsPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [sectionsRes, tasksRes, plantsRes] = await Promise.all([
          fetchSections(),
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

        const sectionsList = parseSectionsResponse(
          sectionsRes,
          taskCountMap,
          plantCountMap
        );
        setSections(sectionsList);
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
        <p className="locations-page__error">{error}</p>
      </FullPage>
    );
  }

  return (
    <FullPage title="위치" subtitle="정원 구역별 요약">
      <div className="full-page__list full-page__list--compact">
        {sections.map((location) => (
          <Link
            key={location.id}
            to={`/?location=${location.id}`}
            className="full-page__card"
          >
            <span
              className="full-page__group-color full-page__group-color--large"
              style={{ background: location.color_token }}
            />
            <div className="full-page__card-body">
              <h2 className="full-page__card-name">{location.name}</h2>
              <p className="full-page__card-meta">
                할 일 {location.taskCount}건 · 식물 {location.plantCount}종
              </p>
            </div>
          </Link>
        ))}
      </div>
    </FullPage>
  );
}
