# Notion API (Vercel Serverless) 구조

Vercel Hobby 플랜의 **서버리스 함수 개수 제한(12개 미만)**을 맞추기 위해, 동일 DB에 대해 예전에 분리되어 있던 **조회·생성·수정·삭제** 엔드포인트를 **파일 3개**로 통합했습니다.

## 루트 `api/` (배포되는 함수)

| 파일 | 역할 |
|------|------|
| `api/notion-locations.js` | Locations(Sections) DB |
| `api/notion-tasks.js` | Tasks DB |
| `api/notion-plants.js` | Plants DB |

**함수 개수: 3** (12 미만)

각 파일은 다음을 처리합니다.

- **GET** — 해당 DB `query` (기존과 동일한 JSON 응답)
- **POST** — `Content-Type: application/json`, 본문에 **`action`** 필수
  - `create` — 새 페이지
  - `update` — 페이지 속성 PATCH
  - `delete` — 페이지 `archived: true`

## 제거된 엔드포인트 (클라이언트는 단일 경로로 통합)

| 이전 경로 | 통합 후 |
|-----------|---------|
| `POST /api/notion-locations-create` | `POST /api/notion-locations` + `action: "create"` |
| `POST /api/notion-locations-update` | `POST /api/notion-locations` + `action: "update"` |
| `POST /api/notion-locations-delete` | `POST /api/notion-locations` + `action: "delete"` |
| `POST /api/notion-tasks-*` (3종) | `POST /api/notion-tasks` + 동일 패턴 |
| `POST /api/notion-plants-*` (3종) | `POST /api/notion-plants` + 동일 패턴 |

`vercel.json`의 **`/api/notion-sections` → `/api/notion-locations` 리라이트**는 GET 호환을 위해 그대로 유지됩니다.

## 프론트엔드 (`src/lib/notionApi.js`)

- `fetchLocations` / `fetchTasks` / `fetchPlants` — `GET` 동일 경로
- `create*` / `update*` / `delete*` — 위 표와 같이 **단일 경로**에 `action`과 기존 필드를 넣어 `POST`

Supabase 프로젝트 CRUD는 **`src/api/`**에서 **`src/lib/`**로만 이동했으며, 서버리스 함수와 무관합니다.

## 로컬 개발

- **`scripts/local-api.mjs`**: 현재 **GET(조회)** 위주. 빠른 읽기 전용 테스트용입니다.
- 생성·수정·삭제까지 로컬에서 동일하게 쓰려면 **`vercel dev`**로 전체 API를 띄우는 것을 권장합니다.
