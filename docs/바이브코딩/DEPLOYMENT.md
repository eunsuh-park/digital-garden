# 배포 가이드

이 프로젝트를 웹사이트에 배포하는 방법을 안내합니다.

## Vercel 배포

1. **Vercel 계정 생성**
   - [vercel.com](https://vercel.com)에 접속하여 GitHub 계정으로 로그인

2. **프로젝트 배포**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소를 선택하거나 직접 업로드
   - 프로젝트 설정:
     - Framework Preset: Vite
     - Build Command: `npm run build` (자동 감지됨)
     - Output Directory: `dist` (자동 감지됨)
   - "Deploy" 클릭

3. **환경 변수 설정 (Notion API 사용 시)**
   - 프로젝트 설정 > Environment Variables
   - `VITE_NOTION_API_KEY` 추가 (필요한 경우)

4. **자동 배포**
   - GitHub에 푸시할 때마다 자동으로 재배포됩니다.

## 로컬 빌드 테스트

배포 전에 로컬에서 빌드가 정상적으로 작동하는지 확인하세요:

```bash
# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 주의사항

1. **환경 변수**: Notion API를 사용하는 경우, 배포 플랫폼에서 환경 변수를 설정해야 합니다.
2. **이미지 경로**: `public` 폴더의 이미지들은 빌드 시 자동으로 포함됩니다.
3. **SPA 라우팅**: 모든 경로가 `index.html`로 리다이렉트되도록 설정되어 있습니다.

## 문제 해결

- 빌드 오류가 발생하면 로컬에서 `npm run build`를 실행하여 오류를 확인하세요.
- 배포 후 페이지가 표시되지 않으면 브라우저 콘솔에서 오류를 확인하세요.
- Notion API 오류가 발생하면 환경 변수가 올바르게 설정되었는지 확인하세요.

