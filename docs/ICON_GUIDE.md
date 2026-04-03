# 아이콘 가이드 (MingCute + Iconify)

이 프로젝트에서는 **MingCute 아이콘 세트**를 `@iconify/react` + `@iconify-icons/mingcute` 조합으로 사용합니다.  
아래는 **아이콘 선택(라인/필 일관성)** 과 **레이아웃·색** 을 맞출 때의 기준입니다.

## 1. 기본 사용법

- **패키지**
  - `@iconify/react`
  - `@iconify-icons/mingcute`
- **기본 예시**
  ```jsx
  import { Icon } from '@iconify/react';
  import mapLine from '@iconify-icons/mingcute/map-line';

  <Icon icon={mapLine} width={18} height={18} />;
  ```
- 가능하면 **named import(위처럼 모듈 import)** 를 씁니다.  
  문자열 `"mingcute:..."` 단독 사용은 피합니다. (번들·트리셰이킹 측면)

## 2. 선택·스타일 규칙

- **스타일 일관**
  - 지도·할 일·식물 등 한 화면/영역 안에서는 **line / fill** 변형을 섞지 않도록 맞춥니다.
  - 탭, 필터, 툴바 같은 **내비·조작 UI** 는 기본적으로 **line 계열**을 씁니다.
- **색**
  - 아이콘에 `color`를 직접 주기보다, **부모 텍스트 색**을 타게 하는 편이 유지보수에 유리합니다.
  - 라이트/다크, hover 시에도 텍스트와 같이 변하도록 CSS로 묶습니다.
- **정렬**
  - 텍스트와 한 줄에 놓을 때는 `display: inline-flex; align-items: center; gap: …` 등으로 맞춥니다.
  - 예: `Header` 탭 (`.page-header__tab`), `FullPageFilter` 안의 버튼 등

## 3. 예시: 헤더 탭

- 위치: `src/components/Header/Header.jsx`, `Header.css`
- 사용 아이콘
  - 지도 탭: `map-line`
  - 할 일 탭: `task-2-line`
  - 식물 탭: `leaf-3-fill`
- JSX 예시
  ```jsx
  import { Icon } from '@iconify/react';
  import mapLine from '@iconify-icons/mingcute/map-line';

  <Link className="page-header__tab">
    <Icon icon={mapLine} width={18} height={18} />
    지도
  </Link>
  ```
- 관련 CSS 예시
  ```css
  .page-header__tab {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem; /* sm 이상이면 0.3rem 등으로 조정 */
  }
  ```

## 4. 예시: 정렬 방향 (FullPageSorter)

- 위치: `src/components/FullPage/FullPageSorter.jsx`
- 사용 아이콘
  - 오름차순: `arrow-up-line`
  - 내림차순: `arrow-down-line`
- JSX 예시
  ```jsx
  import { Icon } from '@iconify/react';
  import up from '@iconify-icons/mingcute/arrow-up-line';
  import down from '@iconify-icons/mingcute/arrow-down-line';

  <button className="full-page-sorter__dir" ...>
    <Icon
      icon={currentDir === 'asc' ? up : down}
      width={16}
      height={16}
    />
  </button>
  ```

## 5. 새 UI에 아이콘 넣을 때 체크리스트

1. **같은 맥락끼리 통일**
   - 한 블록(헤더, 카드, 모달 등) 안에서는 line / fill을 섞지 않도록 맞춥니다.
2. **import 방식**
   - `@iconify-icons/mingcute/xxx-line` 또는 `xxx-fill` 형태의 **named import**를 씁니다.
3. **크기**
   - 탭/툴바/필터: 보통 `16~20px` 안에서, 주변 텍스트와 균형을 맞춥니다.
4. **정렬**
   - 텍스트와 나란히 두면 `inline-flex + align-items: center + gap` 패턴을 재사용합니다.
5. **접근성**
   - 의미 있는 버튼이면 `aria-label` 등으로 보조 설명을 두고, 장식만이면 `aria-hidden`을 고려합니다.

## 6. 상태별 스타일 (hover / active / disabled)

- 클릭 가능한 아이콘 버튼은 **기본·호버·비활성**이 한눈에 구분되게 합니다.
  - 예: 지도 툴바 `garden-map__toolbar-btn`, 정렬 `full-page-sorter__dir`, `full-page-filter__reset`.
- 색·대비
  - 기본: 아이콘 색이 배경과 충분히 대비 (예: `rgba(0, 0, 0, 0.8)`)
  - `:hover`: 배경·테두리 변화와 함께 아이콘도 약간 밝아지거나 진해지게
  - `--active` 등: 선택된 탭/토글은 채도·굵기로 현재 상태 표시
  - `:disabled`: `opacity: 0.5` + 포인터 이벤트 제한, 클릭 불가가 분명히 보이게
- 참고 구현: `GardenMap.css`의 `.garden-map__toolbar-btn`, `FullPageFilter.css`의 `.full-page-filter__reset` 등.