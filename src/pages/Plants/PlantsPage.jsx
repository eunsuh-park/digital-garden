import { PLANTS, SECTIONS } from '../../data/mockData';
import FullPage from '../../components/FullPage/FullPage';

/**
 * PG-07: Plants 전체 페이지 - 식물 DB 전체 조회
 */
export default function PlantsPage() {
  const plantsBySection = {};
  SECTIONS.forEach((s) => {
    plantsBySection[s.id] = PLANTS.filter((p) => p.section_id === s.id);
  });

  return (
    <FullPage
      title="식물"
      subtitle={`식재된 식물 ${PLANTS.length}종`}
    >
      <div className="full-page__list">
        {SECTIONS.map((section) => {
          const plants = plantsBySection[section.id] || [];
          if (plants.length === 0) return null;

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
                {plants.map((plant) => (
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
