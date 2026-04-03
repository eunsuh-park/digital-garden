# UI Component Rollout Backlog

## 2026-03-28 진행 메모

### 1차 적용 완료
- `LoginPage`
  - 기존 `<input>` -> `TextField`로 교체
  - 기존 제출/전환 버튼 -> `TextButton`으로 교체
- `ProjectPage`
  - 프로젝트명 입력 `<input>` -> `TextField` 교체
  - 공간/활용 목적 선택 칩 -> `ButtonTabGroup` 교체
  - 제출 버튼 -> `TextButton` 교체

### 이번 치환 과정에서 확인된 신규 컴포넌트 후보
1. `FormButton` (또는 `TextButton` 확장)
   - 목적: submit/reset/loading 상태를 표준화한 폼 전용 버튼
   - 근거: 로그인/프로젝트 생성 등 폼 페이지에서 반복 사용

2. `ChoiceCardGroup`
   - 목적: 현재 `ProjectPage`의 S/M/L + 부가설명(desc) 형태 선택 UI를 컴포넌트화
   - 근거: `ButtonTab`은 단일 라벨 중심이라 설명 텍스트 동반 선택 UI에 한계

3. `InlineTextAction`
   - 목적: "로그인으로 전환", "계정 재설정" 같은 링크형 텍스트 액션 공통화
   - 근거: 페이지별로 링크처럼 보이는 버튼 스타일을 매번 별도 CSS로 구성 중

4. `AccordionHeaderButton`
   - 목적: `TasksPage`/`PlantsPage`의 접기/펼치기 헤더 버튼 패턴 통합
   - 근거: 구조/인터랙션이 유사한데 페이지별 구현이 분산됨

5. `FabButton`
   - 목적: 하단 고정 `+ 식물 추가`, `+ 할 일 추가` 버튼의 공통 컴포넌트화
   - 근거: 임베디드 페이지 footer CTA 패턴이 반복됨

## 다음 적용 우선순위 (페이지 기준)
1. `DashboardPage`
   - 카드 내부 뱃지/액션 버튼을 `Badge`, `TextButton` 계열로 정리
2. `TasksPage`
   - 아코디언 헤더/푸터 추가 버튼을 공통 컴포넌트 기반으로 치환
3. `PlantsPage`
   - 타일 액션/푸터 버튼 공통화
4. `LandingPage`
   - 로딩/에러/빈 상태 표현을 상태 컴포넌트로 정리

