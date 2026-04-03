# 반응형 디자인 가이드

이 프로젝트의 **모든 컴포넌트**는 아래 브레이크포인트를 공통으로 사용합니다.

## 브레이크포인트 정의

| 이름 | 최소 너비 | 용도 |
|------|-----------|------|
| **sm** | 640px | 작은 화면(모바일) → 태블릿 전환 |
| **md** | 768px | 태블릿 → 데스크톱 전환 |
| **lg** | 1024px | 데스크톱 |

- **기본(모바일 우선)**: 640px 미만일 때의 스타일을 먼저 정의하고, `min-width` 미디어 쿼리로 큰 화면을 보강합니다.
- **최대 너비 제한이 필요할 때**: `max-width` 미디어 쿼리는 `639px`, `767px`, `1023px`를 사용합니다.

## CSS 미디어 쿼리 예시

```css
/* 모바일 우선: 기본은 작은 화면 */
.thing {
  padding: 0.5rem;
  font-size: 0.85rem;
}

/* 640px 이상 */
@media (min-width: 640px) {
  .thing {
    padding: 1rem;
    font-size: 0.95rem;
  }
}

/* 768px 이상 */
@media (min-width: 768px) {
  .thing {
    padding: 1.25rem;
  }
}

/* 1024px 이상 */
@media (min-width: 1024px) {
  .thing {
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* 특정 구간만 다르게 할 때 (max-width) */
@media (max-width: 639px) {
  .thing {
    flex-direction: column;
  }
}
```

## 컴포넌트별 반응형 적용 현황

| 컴포넌트 | 적용 내용 |
|----------|-----------|
| **App** | `app__main` 패딩 sm/md/lg 구간별 조정 |
| **Header** | 로고·탭 폰트/패딩 sm·md 구간 |
| **FullPage** | 패딩, 헤더 레이아웃, 제목 크기 sm·md |
| **FullPageFilter** | 모바일에서 select 축소 (max-width: 639px) |
| **FullPageSorter** | (필요 시 동일 브레이크포인트로 보강) |
| **GardenMap** | 패딩, 컨트롤/범례 간격·폰트 sm |
| **Drawer** | 위치·크기 480px, 헤더/본문 패딩 md |
| **Popover** | min/max 너비, 패딩 sm |
| **ErrorState** | 패딩·min-height sm |
| **TaskCard** | 전용 CSS: 패딩·gap·border-radius·max-width를 sm/md/lg별 적용 (lg에서 max-width 300px) |
| **PlantCard** | 전용 CSS: 카드 크기·앞/뒤 면 패딩을 sm/md/lg별 적용 (lg에서 max-width 300px, 높이 330px) |
| **Switch** | 고정 크기 UI, 터치 영역만 유지 (선택적 sm) |

페이지 레이아웃(Tasks, Plants)의 카드 그리드(`.tasks-page__cards`, `.plants-page__cards`)는 **gap**을 브레이크포인트별로 적용합니다. 모바일 0.75rem → sm 1rem → md 1.25rem → **lg 1.5rem**(PC에서 카드 간격 확대). 그리드 열은 `minmax(min(280px, 100%), 1fr)`로 동일 브레이크포인트를 따릅니다.

## 참고

- `src/index.css`에 브레이크포인트 주석이 있습니다.
- 새 컴포넌트 추가 시 이 브레이크포인트를 사용해 일관된 반응형을 적용하세요.
