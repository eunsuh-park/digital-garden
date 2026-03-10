# 프론트엔드 구조

## 파일·폴더 명명 규칙

- **파일명**: **카멜케이스(camelCase)** 로 통일합니다.
  - 예: `notionNotebooks.js`, `typeOptions.js`, `filterNotesGallery.js`
- **폴더명**: 컴포넌트·위젯·페이지 단위 폴더는 PascalCase(예: `PageHeader`, `Button`, `Story`), 그 외는 소문자 또는 카멜케이스를 씁니다.

## 컴포넌트 vs 위젯

- **컴포넌트** (`src/components/`): 재사용되는 **UI 최소 단위**입니다. 버튼, 토스트, 모달, 푸터처럼 한 가지 역할을 하는 조각입니다.
- **위젯** (`src/widgets/`): **컴포넌트 여러 개 + 기타 로직**으로 이루어진, 그보다 한 단계 위의 조합 단위입니다. 예: PageHeader(로고 + FilterSubMenu + Story 링크 등).

새로 만드는 UI가 “여러 컴포넌트를 묶은 레이아웃/블록”이면 `widgets/`, 단일 재사용 조각이면 `components/`에 두면 됩니다.
