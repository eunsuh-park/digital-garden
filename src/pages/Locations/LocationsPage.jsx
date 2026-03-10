import { Link } from 'react-router-dom';
import { SECTIONS } from '../../data/mockData';
import FullPage from '../../components/FullPage/FullPage';

/**
 * PG-06: Locations 전체 페이지 - 공간 단위 전체 정보 탐색
 * 기획서 Section = Locations(위치)
 */
export default function LocationsPage() {
  return (
    <FullPage
      title="위치"
      subtitle="정원 구역별 요약"
    >
      <div className="full-page__list full-page__list--compact">
        {SECTIONS.map((location) => (
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
