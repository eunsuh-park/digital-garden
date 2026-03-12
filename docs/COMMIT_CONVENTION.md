# 커밋 컨벤션 (Conventional Commits)

이 프로젝트에서는 [Conventional Commits](https://www.conventionalcommits.org/) 형식을 사용합니다.

## 기본 형식

```
<타입>(<범위>): <제목>

<본문(선택)>
```

- **타입**: 커밋의 성격을 한 단어로 표시
- **범위**(선택): 수정한 모듈/영역 (예: Tasks, PlantCard, GardenMap)
- **제목**: 50자 이내로 요약 (마침표 생략)
- **본문**(선택): 상세 설명이 필요할 때 작성

## 타입 목록

| 타입       | 설명 |
|------------|------|
| `feat`     | 새로운 기능 추가 |
| `fix`      | 버그 수정 |
| `docs`     | 문서만 수정 (README, 주석 등) |
| `style`    | 코드 스타일/포맷 변경 (동작 변경 없음) |
| `refactor` | 리팩터링 (기능 변경 없이 구조 개선) |
| `chore`    | 빌드, 설정, 기타 잡일 |

## 예시

```
feat(Tasks): Task_Type, Difficulty Notion 연동
fix(Popover): 할 일/식물 수 0일 때 배열 길이 fallback 적용
docs: 커밋 컨벤션 문서 추가
style(PlantCard): 카테고리 배지 여백 조정
refactor(GardenMap): 범례 필터 로직 훅으로 분리
chore: 의존성 버전 업데이트
```

## 참고

- 제목은 명령형으로 작성 (예: "추가한다" → "추가", "수정했다" → "수정")
- 본문이 있으면 제목과 한 줄 비우기
- 이 규칙을 따르면 CHANGELOG 자동 생성 및 이력 파악이 쉬워집니다.
