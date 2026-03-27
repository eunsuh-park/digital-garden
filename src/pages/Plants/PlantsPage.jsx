import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import arrowUpLine from '@iconify-icons/mingcute/arrow-up-line';
import arrowDownLine from '@iconify-icons/mingcute/arrow-down-line';
import { fetchLocations, fetchPlants } from '@/shared/api/notionApi';
import { parseLocationsResponse } from '@/entities/location/lib/notion-schema';
import { parsePlantsResponse } from '@/entities/plant/lib/notion-schema';
import FullPage from '@/shared/ui/full-page/FullPage';
import FullPageFilter from '@/shared/ui/full-page/FullPageFilter';
import FullPageSorter from '@/shared/ui/full-page/FullPageSorter';
import ErrorState from '@/shared/ui/error-state/ErrorState';
import PlantCard from '@/shared/ui/plant-card/PlantCard';
import { useLocations } from '@/app/providers/LocationsContext';
import { useMapPanelDetail } from '@/app/providers/MapPanelDetailContext';
import { usePlantsPanelUi, PLANTS_PANEL_DEFAULT_SORT } from '@/app/providers/PlantsPanelUiContext';
import { getPlantSpeciesKind } from '@/shared/lib/plantSpeciesKind';
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
 * variant="embedded": 하단 시트 — 종(species)별 아코디언 + 타일 (상세는 layouts/PanelDocLayouts)
 */
export default function PlantsPage({ variant = 'default' }) {
  const { openPlantCreate } = useMapPanelDetail();
  const panelUi = usePlantsPanelUi();
  const ctx = useLocations();
  const isEmbedded = variant === 'embedded';

  const [localFilter, setLocalFilter] = useState({});
  const [localSort, setLocalSort] = useState(PLANTS_PANEL_DEFAULT_SORT);

  const filterValues = isEmbedded && panelUi ? panelUi.filterValues : localFilter;
  const setFilterValues = isEmbedded && panelUi ? panelUi.setFilterValues : setLocalFilter;
  const sortValue = isEmbedded && panelUi ? panelUi.sortValue : localSort;
  const setSortValue = isEmbedded && panelUi ? panelUi.setSortValue : setLocalSort;
  const resetPanelFilters = isEmbedded && panelUi ? panelUi.resetFilters : null;

  const defaultSort = PLANTS_PANEL_DEFAULT_SORT;

  const [locations, setLocations] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStandalone = useCallback(async (options = {}) => {
    const silent = options.silent === true;
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      const [locationsRes, plantsRes] = await Promise.all([fetchLocations(), fetchPlants()]);

      const plantsList = parsePlantsResponse(plantsRes);
      const locationsList = parseLocationsResponse(locationsRes);
      setPlants(plantsList);
      setLocations(locationsList);
    } catch (e) {
      setError(e.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isEmbedded) return undefined;
    loadStandalone();
    return undefined;
  }, [isEmbedded, loadStandalone]);

  const plantsData = isEmbedded ? ctx.plants : plants;
  const locationsData = isEmbedded ? ctx.locations : locations;
  const loadingData = isEmbedded ? ctx.loading : loading;
  const errorData = isEmbedded ? ctx.error : error;

  const locationMap = useMemo(
    () => Object.fromEntries(locationsData.map((l) => [l.id, l])),
    [locationsData]
  );

  const plantsFilters = useMemo(() => {
    const locationOptions = locationsData.map((l) => ({ value: l.id, label: l.name }));
    const filters = [
      {
        key: 'status',
        label: '상태',
        options: [
          { value: 'planted', label: '확인됨' },
          { value: 'planned', label: '식재 예정' },
          { value: 'needs_care', label: '관리 필요' },
        ],
      },
    ];
    if (locationOptions.length > 0) {
      filters.push({ key: 'section_id', label: '구역', options: locationOptions });
    }
    return filters;
  }, [locationsData]);

  const filteredAndSortedPlants = useMemo(() => {
    let list = plantsData;
    if (filterValues.status) list = list.filter((p) => (p.status || '') === filterValues.status);
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
  }, [plantsData, filterValues, sortValue]);

  const hasContent = plantsData.length > 0;

  function toCardStatus(status) {
    if (status === 'needs_care') return '관리 필요';
    if (status === 'planned') return '식재 예정';
    if (status === 'planted') return '확인됨';
    return '미확인';
  }

  function toCardSpecies(plant) {
    return getPlantSpeciesKind(plant);
  }

  if (loadingData) {
    return (
      <FullPage variant={variant} title="식물" subtitle="로딩 중...">
        <p className="plants-page__loading">데이터를 불러오는 중입니다.</p>
      </FullPage>
    );
  }

  if (errorData) {
    return (
      <FullPage variant={variant} title="식물">
        <ErrorState variant="error" message={errorData} showHomeLink />
      </FullPage>
    );
  }

  if (isEmbedded) {
    return (
      <FullPage variant="embedded" title="식물" subtitle={`${filteredAndSortedPlants.length}종`}>
        <div className="plants-page plants-page--embedded-with-footer">
          <div className="plants-page__scroll">
            <div className="plants-page__sticky-top">
              <div className="plants-page__controls plants-page__controls--embedded">
                <FullPageFilter
                  filters={plantsFilters}
                  values={filterValues}
                  onChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value || undefined }))}
                  onReset={() => {
                    if (resetPanelFilters) resetPanelFilters();
                    else {
                      setLocalFilter({});
                      setLocalSort(PLANTS_PANEL_DEFAULT_SORT);
                    }
                  }}
                />
                <FullPageSorter
                  options={PLANTS_SORT_OPTIONS}
                  value={sortValue}
                  active={sortValue.field !== defaultSort.field || sortValue.dir !== defaultSort.dir}
                  onChange={(field, dir) => setSortValue({ field, dir })}
                />
              </div>
            </div>
            <PlantsEmbeddedAccordion plantsList={filteredAndSortedPlants} />
          </div>
          <div className="plants-page__footer">
            <button type="button" className="plants-page__add-plant-btn" onClick={() => openPlantCreate()}>
              <span className="plants-page__add-plant-icon" aria-hidden>
                +
              </span>
              식물 추가
            </button>
          </div>
        </div>
      </FullPage>
    );
  }

  return (
    <FullPage
      variant={variant}
      title="식물"
      subtitle={`식재된 식물 ${plantsData.length}종`}
      emptyMessage={!hasContent ? '등록된 식물이 없습니다.' : undefined}
    >
      <div className="plants-page plants-page--standalone">
        <div className="plants-page__scroll plants-page__scroll--standalone">
        <p className="notion-db-badge" aria-label="연동된 Notion DB">
          Notion DB: Locations(구역) · 식물
        </p>
        <div className="plants-page__sticky-top">
          <div className="plants-page__controls">
            <FullPageFilter
              filters={plantsFilters}
              values={filterValues}
              onChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value || undefined }))}
              onReset={() => {
                setLocalFilter({});
                setLocalSort(PLANTS_PANEL_DEFAULT_SORT);
              }}
            />
            <FullPageSorter
              options={PLANTS_SORT_OPTIONS}
              value={sortValue}
              active={sortValue.field !== defaultSort.field || sortValue.dir !== defaultSort.dir}
              onChange={(field, dir) => setSortValue({ field, dir })}
            />
          </div>
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
        </div>
      </div>
    </FullPage>
  );
}
