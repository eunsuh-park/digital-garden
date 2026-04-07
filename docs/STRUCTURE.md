# Digital Garden — 전체 구조 문서

> 최종 업데이트: 2026-04-04
> 이전 Notion 연동은 완전히 제거됐고, 모든 데이터는 **Supabase**에서 관리됩니다.

---

## 1. 기술 스택 요약

| 영역 | 기술 |
|---|---|
| 프론트엔드 | React + Vite (FSD 아키텍처) |
| 백엔드(DB) | Supabase (PostgreSQL) |
| 인증 | Supabase Auth (이메일/패스워드) |
| 스타일링 | CSS 모듈 + 디자인 토큰 |
| 아이콘 | MingCute via @iconify/react |
| 배포 | Vercel (정적 + Serverless Functions) |

---

## 2. 데이터베이스 다이어그램

```
auth.users (Supabase 내장)
   │
   │ id → profiles.id
   ▼
┌────────────────────────────────────────────────────────────────┐
│ public.profiles                                                │
│  id (uuid, PK → auth.users.id)                                │
│  email, nickname, avatar_url, onboarding_completed            │
└───────────────────────────────────┬────────────────────────────┘
                                    │ id = owner_id
                                    ▼
┌────────────────────────────────────────────────────────────────┐
│ public.projects                                                │
│  id (bigint, PK)                                               │
│  owner_id (uuid → auth.users.id)                              │
│  name, space_size, space_description                          │
│  is_demo  ← true면 모든 로그인 사용자가 읽기 전용으로 조회 가능  │
└──────┬─────────────────────────────────────────────────────────┘
       │ project_id FK (공통)
       │
       ├──────────────────────────┐
       │                          │
       ▼                          ▼
┌──────────────────┐   ┌──────────────────────────────────────┐
│ garden_zones     │   │ garden_tasks                         │
│  id (uuid, PK)   │   │  id (uuid, PK)                       │
│  project_id      │   │  project_id                          │
│  name            │◄──┤  zone_id (uuid, FK → garden_zones.id)│
│  description     │   │  title, status, status_label         │
│  color_label     │   │  task_type, difficulty               │
│  color_token     │   │  estimated_duration, scheduled_date  │
│  svg_id          │   │  due_date, notes                     │
└──────────────────┘   └──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ garden_plants                            │
│  id (uuid, PK)                           │
│  project_id                              │
│  zone_id (uuid, FK → garden_zones.id)    │
│  name, species, category                 │
│  status, bloom_season, quantity, notes   │
└──────────────────────────────────────────┘
```

**핵심 원칙:**
- 중간(junction) 테이블 없음 — 관계는 단순 FK로 처리
- Task는 하나의 Zone에 속함 (`zone_id`)
- Plant는 하나의 Zone에 속함 (`zone_id`)
- Zone별 task/plant는 **프론트엔드에서 필터링**으로 조회

---

## 3. RLS (행 레벨 보안) 정책

> RLS = Row Level Security. 데이터베이스가 사용자별로 어떤 행을 읽고 쓸 수 있는지 직접 제한하는 기능.

| 테이블 | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| projects | 자신의 것 OR `is_demo = true` | 자신의 것만 |
| garden_zones | 위와 동일 (project 통해 확인) | 자신 소유 project만 |
| garden_tasks | 위와 동일 | 자신 소유 project만 |
| garden_plants | 위와 동일 | 자신 소유 project만 |

→ **데모 프로젝트**(`is_demo = true`)는 누구나 읽을 수 있지만, 수정/삭제는 막혀 있습니다.

---

## 4. 프론트엔드 구조 (FSD)

```
src/
├── app/
│   ├── App.jsx                   # 라우팅 루트
│   └── providers/
│       ├── AuthContext.jsx        # 로그인 상태 관리
│       ├── ZonesContext.jsx       # 구역·할일·식물 전역 상태
│       ├── useGardenProjectId.js  # 현재 활성 projectId 결정 훅
│       ├── RequireAuth.jsx        # 로그인 필요 라우트 가드
│       ├── MapPanelDetailContext  # 사이드패널 상세 뷰 상태
│       └── ToastContext.jsx       # 알림 토스트
│
├── pages/
│   ├── Login/                    # 로그인 · 회원가입
│   └── Home/                     # 메인 지도 뷰
│
├── widgets/
│   └── map-panel/
│       ├── MapPanelDetailViews.jsx  # Zone/Task/Plant 상세·생성 폼
│       └── PanelDocLayouts.jsx      # 상세 레이아웃 컴포넌트
│
├── features/
│   ├── task-list/TaskListView.jsx   # 전체 할 일 목록
│   └── plant-list/PlantListView.jsx # 전체 식물 목록
│
├── entities/
│   ├── zone/
│   └── task/
│
└── shared/
    ├── api/
    │   └── gardenApi.js    # Supabase garden_* CRUD 함수 모음
    └── lib/
        ├── gardenFromDb.js   # DB 행 → UI 도메인 객체 변환
        └── gardenDemoSeed.js # 데모 스냅샷 (USE_MOCK 시 또는 mock client)
```

---

## 5. 데이터 흐름

```
[사용자 접속]
      │
      ▼
AuthContext.bootstrapAuth()
  └─ Supabase Auth로 세션 확인
  └─ isAuthReady = true 설정
      │
      ▼
useGardenProjectId()
  └─ URL에 :projectId 있으면 해당 프로젝트
  └─ 없으면 is_demo 프로젝트 → 없으면 첫 번째 프로젝트
      │
      ▼
ZonesContext.load(projectId)
  ├─ [USE_MOCK=true] getDemoGardenSnapshot() 반환
  └─ [실제] gardenApi.loadGardenData(projectId)
       ├─ fetchZones()   → garden_zones
       ├─ fetchTasks()   → garden_tasks
       └─ fetchPlants()  → garden_plants
                 │ mapZoneRow / mapTaskRow / mapPlantRow
                 ▼
           { zones, tasks, plants } → Context에 주입
```

---

## 6. 환경 변수 (.env.local 기준)

| 변수 | 용도 | 브라우저 노출 |
|---|---|---|
| `SUPABASE_URL` | Supabase 프로젝트 URL | 예 (`envPrefix` 설정) |
| `SUPABASE_ANON_KEY` | 공개 anon 키 (읽기 + 인증) | 예 (`envPrefix` 설정) |
| `VITE_SUPABASE_URL` | 레거시 폴백 | 예 |
| `VITE_SUPABASE_ANON_KEY` | 레거시 폴백 | 예 |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI / MCP 전용 | **아니오** (서버만) |
| `SUPABASE_PROJECT_REF` | Supabase CLI / MCP 전용 | **아니오** (서버만) |
| `USE_MOCK` / `VITE_USE_MOCK` | true이면 메모리 mock 사용 | 개발 전용 |

---

## 7. 로컬 개발 시작 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 에 SUPABASE_URL, SUPABASE_ANON_KEY 입력

# 3. 개발 서버 시작
npm run dev
```

Supabase 없이 빠르게 테스트하려면:
```bash
VITE_USE_MOCK=true npm run dev
```
→ DB 없이 gardenDemoSeed.js 의 하드코딩 데이터로 동작합니다.

---

## 8. 구 Notion 연동 (레거시)

기존에 Notion Database를 직접 호출하던 구조는 완전히 제거됐습니다.

| 제거된 것 | 대체 |
|---|---|
| `src/shared/api/notionApi.js` | `gardenApi.js` |
| Notion 스키마 파서 (각 entity) | `gardenFromDb.js` |
| `scripts/local-api.mjs` Notion 프록시 | Supabase 직접 호출 |
| Notion DB 환경 변수 (NOTION_*) | Supabase 환경 변수 |

`scripts/local-api.mjs` 파일은 남아 있지만, 앱 자체는 더 이상 해당 프록시에 의존하지 않습니다.
