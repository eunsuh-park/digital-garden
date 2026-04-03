# Notion DB 연결 정리

이 프로젝트는 여러 페이지에서 서로 다른 Notion 데이터베이스를 사용합니다. 각 API별로 필요한 환경 변수를 정리했습니다.

## 요약표

| 기능 | API 경로 | 환경 변수 | Notion DB 속성 구조 |
|------|----------|-----------|---------------------|
| **Timeline** (시기별 노트) | `/api/notionByPeriod` | `NOTION_DATABASE_ID` 또는 `NOTION_DB_ID` | period_name, period_start, cover_front_url 등 |
| **By type** (타입별 갤러리) | `/api/notionByType` | `NOTION_BY_TYPE_DB_ID` 또는 `NOTION_DATABASE_ID` | notebook_type, cover_front_url 등 |

## 1. Timeline / 노트 (Notebooks)

- **API**: `api/notionByPeriod.js`
- **환경 변수**: `NOTION_API_KEY`, `NOTION_DATABASE_ID` 또는 `NOTION_DB_ID`
- **기본값**: `18dfb9c7066e4df99962c5fed616b3db`
- **Notion DB 필수 속성**:
  - period_name (Select): Elementary School, University, Middle & High School, After School (1:1 매칭)
  - period_start, period_end (Date)
  - cover_front_url, cover_back_url (URL)
  - 이름/Name/title (Title)

## 2. Story

Story 페이지는 현재 하드코딩된 정적 콘텐츠를 사용합니다. Notion 연동이 필요하면 `api/story` 엔드포인트를 다시 추가할 수 있습니다.

## 3. By type

- **API**: `api/notionByType.js`
- **환경 변수**: `NOTION_API_KEY`, `NOTION_BY_TYPE_DB_ID` 또는 `NOTION_DATABASE_ID`
- **Notion DB notebook_type 태그** (1:1 매칭):
  - 다이어리(일기장), 스케줄러, 수첩/메모지, 스케치북, 줄공책

---

## 설정 방법 (Vercel 예시)

Vercel 프로젝트 → Settings → Environment Variables에서:

```
NOTION_API_KEY=secret_xxxxx
NOTION_DATABASE_ID=18dfb9c7066e4df99962c5fed616b3db   # Timeline/노트용
NOTION_STORY_DB_ID=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy   # Story 전용 (별도 DB)
NOTION_BY_TYPE_DB_ID=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz   # By type (별도 DB, 선택)
```

Story 전용 DB를 만들 때는 `convertNotionPageToStoryPost`가 기대하는 속성(Title, Subtitle, Date, Image 등)을 갖춘 페이지를 추가하면 됩니다.
