import { Icon } from '@iconify/react';
import imageAddLine from '@iconify-icons/mingcute/pic-line';
import './PlantDetailLayout.css';

function plantStatusLabel(status) {
  if (status === 'needs_care') return '관리 필요';
  if (status === 'planned') return '식재 예정';
  if (status === 'planted') return '확인됨';
  return '미확인';
}

/**
 * 패널 식물 상세 — 카드(flip) 없이 문서형 레이아웃 + 이미지 플레이스홀더
 * @param {{ plant: object, locationName?: string | null, imageUrl?: string | null, onLocationNavigate?: () => void }} props
 */
export default function PlantDetailLayout({ plant, locationName, imageUrl = null, onLocationNavigate }) {
  const status = plantStatusLabel(plant.status);
  const bloom =
    plant.bloom_season && plant.bloom_season !== '-' ? plant.bloom_season : null;
  const qty = plant.quantity != null && plant.quantity !== '' ? String(plant.quantity) : null;
  const notes = plant.notes?.trim() || '';
  const category = plant.category && plant.category !== '-' ? plant.category : null;
  const species = plant.species && plant.species !== '-' ? plant.species : null;
  const speciesBadge = species || '종 미입력';

  return (
    <article className="plant-detail">
      <div className="plant-detail__media">
        <div className="plant-detail__media-inner">
          {imageUrl ? (
            <img className="plant-detail__img" src={imageUrl} alt="" />
          ) : (
            <div className="plant-detail__media-placeholder" aria-hidden>
              <span className="plant-detail__media-icon">🌿</span>
              <span className="plant-detail__media-caption">이미지 없음</span>
            </div>
          )}
          <button
            type="button"
            className="plant-detail__media-upload-btn"
            aria-label="사진 업로드"
            disabled
            title="사진 업로드"
          >
            <Icon icon={imageAddLine} width={22} height={22} aria-hidden />
          </button>
        </div>
      </div>

      <div className="plant-detail__body">
        <h1 className="plant-detail__title">{plant.name}</h1>

        <div className="plant-detail__badges">
          <span className="plant-detail__badge plant-detail__badge--status">{status}</span>
          <span className="plant-detail__badge plant-detail__badge--kind">{speciesBadge}</span>
        </div>

        {category ? (
          <dl className="plant-detail__dl">
            <dt>카테고리</dt>
            <dd>{category}</dd>
          </dl>
        ) : null}

        <dl className="plant-detail__dl plant-detail__dl--compact">
          {species ? (
            <>
              <dt>종</dt>
              <dd>{species}</dd>
            </>
          ) : null}
          {locationName ? (
            <>
              <dt>위치</dt>
              <dd>
                {onLocationNavigate ? (
                  <button type="button" className="plant-detail__link" onClick={onLocationNavigate}>
                    📍 {locationName}
                  </button>
                ) : (
                  <>📍 {locationName}</>
                )}
              </dd>
            </>
          ) : null}
          {bloom ? (
            <>
              <dt>개화시기</dt>
              <dd>{bloom}</dd>
            </>
          ) : null}
          {qty ? (
            <>
              <dt>개체 수</dt>
              <dd>{qty}</dd>
            </>
          ) : null}
        </dl>

        {notes ? (
          <section className="plant-detail__notes" aria-label="메모">
            <h2 className="plant-detail__section-title">메모</h2>
            <p className="plant-detail__notes-body">{notes}</p>
          </section>
        ) : null}
      </div>
    </article>
  );
}
