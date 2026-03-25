import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import arrowUpLine from '@iconify-icons/mingcute/arrow-up-line';
import arrowDownLine from '@iconify-icons/mingcute/arrow-down-line';
import { fetchLocations, fetchPlants } from '../../api/notionApi';
import { parseLocationsResponse } from '../Locations/notionSchema';
import { parsePlantsResponse } from './notionSchema';
import FullPage from '../../components/FullPage/FullPage';
import FullPageFilter from '../../components/FullPage/FullPageFilter';
import FullPageSorter from '../../components/FullPage/FullPageSorter';
import ErrorState from '../../components/ErrorState/ErrorState';
import PlantCard from '../../components/PlantCard';
import { useMapPanelDetail } from '../../context/MapPanelDetailContext';
import { getPlantSpeciesKind } from '../../lib/plantSpeciesKind';
import './PlantsPage.css';

const PLANTS_SORT_OPTIONS = [
  { value: 'name', label: '이름' },
  { value: 'category', label: '카테고리' },
  { value: 'bloom_season', label: '개화시기' },
];

/** Notion `종`(species) 값으로 그룹 키 — 비어 있으면 기타 */
function speciesGroupKey(species) {
  const s = species == null ? '' : String(species).trim();
  if (!s || s === '-') return '기타';
  return s;
}

/**
 * 하단 시트 전용: 종(species)별 아코디언 + 타일 그리드
 */
function PlantsEmbeddedAccordion({ plantsList }) {
  const { openPlantDetail } = useMapPanelDetail();
  const [expanded, setExpanded] = useState(() => new Set());

  const { sortedKeys, groupMap } = useMemo(() => {
    const m = new Map();
    for (const p of plantsList) {
      const k = speciesGroupKey(p.species);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(p);
    }
    const keys = [...m.keys()].sort((a, b) => {
      if (a === '기타') return 1;
      if (b === '기타') return -1;
      return a.localeCompare(b, 'ko');
    });
    return { sortedKeys: keys, groupMap: m };
  }, [plantsList]);

  useEffect(() => {
    setExpanded(new Set(sortedKeys));
  }, [sortedKeys]);

  const toggle = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (plantsList.length === 0) {
    return <p className="plants-embedded__empty">등록된 식물이 없습니다.</p>;
  }

  return (
    <div className="plants-embedded">
      {sortedKeys.map((key) => {
        const items = groupMap.get(key) || [];
        const label = key;
        const isOpen = expanded.has(key);

        return (
          <section key={key} className="plants-embedded__group">
            <button
              type="button"
              className="plants-embedded__group-header"
              onClick={() => toggle(key)}
              aria-expanded={isOpen}
            >
              <span className="plants-embedded__group-title">{label}</span>
              <span className="plants-embedded__group-count">{items.length}</span>
              <Icon
                icon={isOpen ? arrowUpLine : arrowDownLine}
                width={18}
                height={18}
                className="plants-embedded__group-chevron"
                aria-hidden
              />
            </button>
            {isOpen && (
              <ul className="plants-embedded__grid" aria-label={`${label} 식물`}>
                {items.map((p) => (
                  <li key={p.id} className="plants-embedded__cell">
                    <button
                      type="button"
                      className="plants-embedded__tile"
                      onClick={() => openPlantDetail(p)}
                    >
                      {p.status === 'needs_care' ? (
                        <span className="plants-embedded__tile-dot" aria-label="관리 필요" />
                      ) : null}
                      <span className="plants-embedded__tile-name">{p.name}</span>
                    </button>
                  </li>
                ))}
                <li className="plants-embedded__cell">
                  <span
                    className="plants-embedded__tile plants-embedded__tile--add"
                    title="추가 예정"
                    aria-disabled="true"
                  >
                    +
                  </span>
                </li>
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

/**
 * PG-07: Plants 전체 페이지 - 식물 DB 전체 조회
 * variant="embedded": 하단 시트 — 종(species)별 아코디언 + 타일 (상세는 PlantDetailLayout)
 */
export default function PlantsPage({ variant = 'default' }) {
  const [locations, setLocations] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterValues, setFilterValues] = useState({});
  const defaultSort = { field: 'name', dir: 'asc' };
  const [sortValue, setSortValue] = useState(defaultSort);

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
    return () => {
      cancelled = true;
    };
  }, []);

  const locationMap = useMemo(() => Object.fromEntries(locations.map((l) => [l.id, l])), [locations]);
  const plantsFilters = useMemo(() => {
    const speciesKinds = [...new Set(plants.map((p) => getPlantSpeciesKind(p)).filter(Boolean))]
      .sort()
      .map((s) => ({ value: s, label: s }));
    const locationOptions = locations.map((l) => ({ value: l.id, label: l.name }));
    return [
      { key: 'status', label: '상태', options: [{ value: 'planted', label: '확인됨' }, { value: 'planned', label: '식재 예정' }, { value: 'needs_care', label: '관리 필요' }] },
      { key: 'species_kind', label: '종류', options: speciesKinds },
      { key: 'section_id', label: '위치', options: locationOptions },
    ].filter((f) => f.options.length > 0 || f.key === 'status');
  }, [plants, locations]);
  const filteredAndSortedPlants = useMemo(() => {
    let list = plants;
    if (filterValues.status) list = list.filter((p) => (p.status || '') === filterValues.status);
    if (filterValues.species_kind) list = list.filter((p) => getPlantSpeciesKind(p) === filterValues.species_kind);
    if (filterValues.section_id) list = list.filter((p) => (p.section_id || '') === filterValues.section_id);
    const field = sortValue.field || 'name';
    const dir = sortValue.dir === 'desc' ? -1 : 1;
    list = [...list].sort((a, b) => {
      if (field === 'name') return (a.name || '').localeCompare(b.name || '', 'ko') * dir;
      if (field === 'category') return (a.category || '').localeCompare(b.category || '', 'ko') * dir;
      if (field === 'bloom_season') return (a.bloom_season || '').localeCompare(b.bloom_season || '', 'ko') * dir;
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
    return getPlantSpeciesKind(plant);
  }

  if (variant === 'embedded' && loading) {
    return <p className="plants-page__loading">데이터를 불러오는 중입니다.</p>;
  }

  if (variant === 'embedded' && error) {
    return <p className="plants-page__hint--error">{error}</p>;
  }

  if (variant === 'embedded' && !loading && !error) {
    return <PlantsEmbeddedAccordion plantsList={filteredAndSortedPlants} />;
  }

  if (loading) {
    return (
      <FullPage variant={variant} title="식물" subtitle="로딩 중...">
        <p className="plants-page__loading">데이터를 불러오는 중입니다.</p>
      </FullPage>
    );
  }

  if (error) {
    return (
      <FullPage variant={variant} title="식물">
        <ErrorState variant="error" message={error} showHomeLink />
      </FullPage>
    );
  }

  return (
    <FullPage
      variant={variant}
      title="식물"
      subtitle={`식재된 식물 ${plants.length}종`}
      emptyMessage={!hasContent ? '등록된 식물이 없습니다.' : undefined}
    >
      {variant !== 'embedded' && (
        <p className="notion-db-badge" aria-label="연동된 Notion DB">
          Notion DB: Locations(구역) · 식물
        </p>
      )}
      <div className="plants-page__controls">
        <FullPageFilter
          filters={plantsFilters}
          values={filterValues}
          onChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value || undefined }))}
          onReset={() => {
            setFilterValues({});
            setSortValue(defaultSort);
          }}
        />
        <FullPageSorter
          options={PLANTS_SORT_OPTIONS}
          value={sortValue}
          active={sortValue.field !== defaultSort.field || sortValue.dir !== defaultSort.dir}
          onChange={(field, dir) => setSortValue({ field, dir })}
        />
      </div>
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
            Quantity: p.quantity ?? undefined,
            Notes:
              (p.notes && p.notes.trim()) ||
              [
                p.category && p.category !== '-' ? `카테고리: ${p.category}` : null,
                p.species && p.species !== '-' ? `종: ${p.species}` : null,
              ]
                .filter(Boolean)
                .join(' · '),
          };

          return <PlantCard key={p.id} plant={cardPlant} />;
        })}
      </div>
    </FullPage>
  );
}
