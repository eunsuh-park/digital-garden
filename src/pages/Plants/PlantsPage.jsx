import { useEffect, useMemo, useState } from 'react';
import { fetchLocations, fetchPlants } from '../../api/notionApi';
import { parseLocationsResponse } from '../Locations/notionSchema';
import { parsePlantsResponse } from './notionSchema';
import FullPage from '../../components/FullPage/FullPage';
import FullPageFilter from '../../components/FullPage/FullPageFilter';
import FullPageSorter from '../../components/FullPage/FullPageSorter';
import ErrorState from '../../components/ErrorState/ErrorState';
import PlantCard from '../../components/PlantCard';
import './PlantsPage.css';

const PLANTS_SORT_OPTIONS = [
  { value: 'name', label: '이름' },
  { value: 'category', label: '카테고리' },
  { value: 'bloom_season', label: '개화시기' },
];

/**
 * PG-07: Plants 전체 페이지 - 식물 DB 전체 조회
 */
export default function PlantsPage() {
  const [locations, setLocations] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const [sortValue, setSortValue] = useState({ field: 'name', dir: 'asc' });

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

  const locationMap = useMemo(() => Object.fromEntries(locations.map((l) => [l.id, l])), [locations]);
  const plantsFilters = useMemo(() => {
    const categories = [...new Set(plants.map((p) => p.category).filter(Boolean))].sort().map((c) => ({ value: c, label: c }));
    const locationOptions = locations.map((l) => ({ value: l.id, label: l.name }));
    return [
      { key: 'status', label: '상태', options: [{ value: 'planted', label: '확인됨' }, { value: 'planned', label: '식재 예정' }, { value: 'needs_care', label: '관리 필요' }] },
      { key: 'category', label: '카테고리', options: categories },
      { key: 'section_id', label: '위치', options: locationOptions },
    ].filter((f) => f.options.length > 0 || f.key === 'status');
  }, [plants, locations]);
  const filteredAndSortedPlants = useMemo(() => {
    let list = plants;
    if (filterValues.status) list = list.filter((p) => (p.status || '') === filterValues.status);
    if (filterValues.category) list = list.filter((p) => (p.category || '') === filterValues.category);
    if (filterValues.section_id) list = list.filter((p) => (p.section_id || '') === filterValues.section_id);
    const field = sortValue.field || 'name';
    const dir = sortValue.dir === 'desc' ? -1 : 1;
    list = [...list].sort((a, b) => {
      if (field === 'name') return ((a.name || '').localeCompare(b.name || '', 'ko')) * dir;
      if (field === 'category') return ((a.category || '').localeCompare(b.category || '', 'ko')) * dir;
      if (field === 'bloom_season') return ((a.bloom_season || '').localeCompare(b.bloom_season || '', 'ko')) * dir;
      return 0;
    });
    return list;
  }, [plants, filterValues, sortValue]);
  const hasContent = plants.length > 0;

  function toCardStatus(status) {
    if (status === 'needs_care') return '관리 필요';
    if (status === 'planned') return '식재 예정';
    if (status === 'planted') return '확인됨';
    return '미확인';
  }

  function toCardSpecies(plant) {
    const raw = plant.category || plant.species || '';
    if (/(나무|목|교목|관목)/.test(raw)) return '나무';
    if (/(꽃|화|개화)/.test(raw)) return '꽃';
    return '풀';
  }

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
      headerRight={
        <>
          <FullPageFilter
            filters={plantsFilters}
            values={filterValues}
            onChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value || undefined }))}
          />
          <FullPageSorter
            options={PLANTS_SORT_OPTIONS}
            value={sortValue}
            onChange={(field, dir) => setSortValue({ field, dir })}
          />
        </>
      }
    >
      <p className="notion-db-badge" aria-label="연동된 Notion DB">
        Notion DB: Locations(구역) · 식물
      </p>
      <div className="plants-page__cards">
        {filteredAndSortedPlants.map((p) => {
          const location = p.section_id ? locationMap[p.section_id] : null;
          const cardPlant = {
            Name: p.name,
            Species: toCardSpecies(p),
            SpeciesRaw: p.species && p.species !== '-' ? p.species : undefined,
            Category: p.category && p.category !== '-' ? p.category : undefined,
            Status: toCardStatus(p.status),
            Location: location ? [location.name] : [],
            Color: undefined,
            'Bloom Season': p.bloom_season && p.bloom_season !== '-' ? p.bloom_season : undefined,
            'Pruning Season': undefined,
            'Fertilizing Season': undefined,
            Quantity: undefined,
            Notes: [p.category && p.category !== '-' ? `카테고리: ${p.category}` : null, p.species && p.species !== '-' ? `종: ${p.species}` : null]
              .filter(Boolean)
              .join(' · '),
          };

          return <PlantCard key={p.id} plant={cardPlant} />;
        })}
      </div>
    </FullPage>
  );
}
