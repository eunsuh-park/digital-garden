## 아이콘 가이드 (MingCute + Iconify)

이 프로젝트는 **MingCute 아이콘 세트**를 `@iconify/react` + `@iconify-icons/mingcute` 조합으로 사용합니다.  
아이콘 추가 시에는 **트리쉐이킹(개별 아이콘 임포트)** 과 **일관된 스타일**을 지키는 것을 원칙으로 합니다.

### 1. 기본 사용법

- **패키지**
  - `@iconify/react`
  - `@iconify-icons/mingcute`
- **기본 패턴**
  ```jsx
  import { Icon } from '@iconify/react';
  import map2Fill from '@iconify-icons/mingcute/map-2-fill';

  <Icon icon={map2Fill} width={18} height={18} />;
  ```
- 항상 **아이콘별 모듈**을 임포트해서 사용합니다.  
  문자열 `"mingcute:..."` 방식은 쓰지 않습니다. (번들 크기 최소화)

### 2. 스타일 가이드

- **스타일 타입**: 기본은 **filled 스타일** 사용
  - 예: `map-2-fill`, `task-2-fill`, `leaf-3-fill`, `arrow-up-fill`, `arrow-down-fill`
- **색상**
  - 아이콘에 `color`를 직접 지정하지 않고, **텍스트 컬러를 상속**받는 것을 기본으로 합니다.
  - 활성/비활성, hover 상태는 부모 텍스트 컬러에 맞춰 자동으로 같이 변하게 유지합니다.
- **정렬**
  - 텍스트와 함께 쓰는 경우, 부모에 `display: inline-flex; align-items: center; gap: …` 패턴 사용
  - 예: `Header` 탭 (`.page-header__tab`)

### 3. 헤더 탭 예시

- 위치: `src/components/Header/Header.jsx`, `Header.css`
- 사용 아이콘
  - 지도 탭: `map-2-fill`
  - 할 일 탭: `task-2-fill`
  - 식물 탭: `leaf-3-fill`
- JSX 예시
  ```jsx
  import { Icon } from '@iconify/react';
  import map2Fill from '@iconify-icons/mingcute/map-2-fill';

  <Link className="page-header__tab">
    <Icon icon={map2Fill} width={18} height={18} />
    지도
  </Link>
  ```
- 정렬 CSS 예시
  ```css
  .page-header__tab {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem; /* sm 이상에서는 0.3rem */
  }
  ```

### 4. 정렬 컨트롤 예시 (FullPageSorter)

- 위치: `src/components/FullPage/FullPageSorter.jsx`
- 사용 아이콘
  - 오름차순: `arrow-up-fill`
  - 내림차순: `arrow-down-fill`
- JSX 패턴
  ```jsx
  import { Icon } from '@iconify/react';
  import arrowUpFill from '@iconify-icons/mingcute/arrow-up-fill';
  import arrowDownFill from '@iconify-icons/mingcute/arrow-down-fill';

  <button className="full-page-sorter__dir" ...>
    <Icon
      icon={currentDir === 'asc' ? arrowUpFill : arrowDownFill}
      width={16}
      height={16}
    />
  </button>
  ```

### 5. 새 아이콘을 추가할 때 체크리스트

1. **아이콘 선택**
   - 가능한 한 **filled 스타일** (`*-fill`)을 우선 사용합니다.
2. **임포트 방식**
   - `@iconify-icons/mingcute/xxx-fill` 에서 아이콘을 개별 임포트합니다.
3. **사이즈**
   - 헤더/탭/버튼: 보통 `16~20px` 범위, 텍스트 높이와 어울리게 조정합니다.
4. **정렬**
   - 텍스트와 같이 쓸 경우, 부모 컨테이너에 `inline-flex + align-items: center + gap` 패턴을 적용합니다.
5. **색상**
   - 특별한 이유가 없다면 직접 색상을 지정하지 말고, 텍스트 색상을 그대로 상속받도록 둡니다.

