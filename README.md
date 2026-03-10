# 양주 정원

실제 대지 간이 SVG 지도를 중심으로 섹션·식물·할 일을 연결해 탐색하는 정원 관리 웹 서비스입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 빌드

```bash
npm run build
npm run preview   # 빌드 결과 미리보기
```

## 배포 후 데이터가 안 뜰 때 (Vercel)

1. **Vercel 대시보드** → 해당 프로젝트 → **Settings** → **Environment Variables**
2. 아래 4개가 **Production(과 Preview)** 에 모두 있는지 확인. 없으면 추가 후 **Redeploy**.
   - `NOTION_API_KEY` = Notion Integration 시크릿
   - `NOTION_DATABASE_ID_SECTIONS` = Locations(구역) DB ID
   - `NOTION_DATABASE_ID_TASKS` = 할 일 DB ID
   - `NOTION_DATABASE_ID_PLANTS` = 식물 DB ID
3. 브라우저에서 **F12 → Console** 확인. `[Notion API] 실패` 또는 `Notion config missing` 이면 위 환경 변수/재배포 다시 확인.

(GitHub Pages 등 다른 도메인에서 Vercel API를 쓰려면, 빌드 시 `VITE_API_ORIGIN`을 Vercel 배포 URL로 설정해야 함.)

## 문서

- `doc/서비스 기획서.xlsx` - 서비스 기획 원본
- `doc/진행사항.xlsx` - 개발 진행사항
- `doc/바이브코딩/` - 참고 가이드 (아키텍처, 배포, Notion 연동 등)

## Phase 1 MVP (완료)

- SVG 간이 지도 + 섹션 하이라이트
- 회전 버튼 (도로/집 기준)
- 섹션 팝오버 (hover)
- 섹션 드로어 (상세 패널)
- 헤더 + 탭 (지도/할 일)
- 할 일 페이지 기본 조회 (섹션 그룹, 예정일 순)
