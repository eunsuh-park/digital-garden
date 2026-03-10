# 프론트엔드 구조

## 파일·폴더 명명 규칙

- **파일명**: **카멜케이스(camelCase)** 로 통일합니다.
  - 예: `notionNotebooks.js`, `typeOptions.js`, `filterNotesGallery.js`
- **폴더명**: 컴포넌트·위젯·페이지 단위 폴더는 PascalCase(예: `PageHeader`, `Button`, `Story`), 그 외는 소문자 또는 카멜케이스를 씁니다.

---

## 컴포넌트·페이지 폴더링 가이드

동일한 prefix 또는 도메인을 가진 컴포넌트/페이지는 하나의 폴더로 묶어 관리합니다.

### 컴포넌트 (`src/components/`)

| 규칙 | 예시 |
|------|------|
| **단일 컴포넌트** | `Header/Header.jsx`, `Header/Header.css` |
| **이름별 단일 컴포넌트** | `Drawer/Drawer.jsx`, `Popover/Popover.jsx` |
| **큰 단위 컴포넌트** | `GardenMap/GardenMap.jsx`, `GardenMap/GardenMap.css` |

**구조 예시:**
```
src/components/
├── FullPage/
│   ├── FullPage.jsx
│   └── FullPage.css
├── Header/
│   ├── Header.jsx
│   └── Header.css
├── GardenMap/
│   ├── GardenMap.jsx
│   └── GardenMap.css
├── Drawer/
│   ├── Drawer.jsx
│   └── Drawer.css
└── Popover/
    ├── Popover.jsx
    └── Popover.css
```

- **FullPage**: Tasks, Locations, Plants 페이지의 공통 템플릿. 해당 페이지들의 스타일은 `FullPage.css`에 통합됨.

- 같은 이름/prefix를 가진 컴포넌트는 해당 폴더 안에 함께 둡니다.
- 각 컴포넌트는 자신의 `.jsx`와 `.css`를 같은 폴더에 둡니다.

### 페이지 (`src/pages/`)

| 규칙 | 예시 |
|------|------|
| **페이지별 폴더** | `Landing/LandingPage.jsx` |
| **관련 스타일** | `Tasks/TasksPage.jsx`, `Tasks/TasksPage.css` |

**구조 예시:**
```
src/pages/
├── Landing/
│   └── LandingPage.jsx
└── Tasks/
    ├── TasksPage.jsx
    └── TasksPage.css
```

- 각 페이지는 대응하는 폴더를 두고 그 안에 배치합니다.
- import 경로: `from './components/Header/Header'`, `from './components/Drawer/Drawer'`, `from './components/Popover/Popover'`, `from './pages/Landing/LandingPage'`

---

## 컴포넌트 vs 위젯

- **컴포넌트** (`src/components/`): 재사용되는 **UI 최소 단위**입니다. 버튼, 토스트, 모달, 푸터처럼 한 가지 역할을 하는 조각입니다.
- **위젯** (`src/widgets/`): **컴포넌트 여러 개 + 기타 로직**으로 이루어진, 그보다 한 단계 위의 조합 단위입니다. 예: PageHeader(로고 + FilterSubMenu + Story 링크 등).

새로 만드는 UI가 “여러 컴포넌트를 묶은 레이아웃/블록”이면 `widgets/`, 단일 재사용 조각이면 `components/`에 두면 됩니다.
