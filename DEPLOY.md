# 배포 가이드

## GitHub에 푸시하기

프로젝트 디렉토리에서 다음 명령어를 실행하세요:

```bash
# Git 저장소 초기화 (이미 되어있다면 생략)
git init

# 모든 파일 추가 (.env 제외)
git add .

# 커밋
git commit -m "Initial commit: Add Groq API integration"

# 브랜치 이름을 main으로 변경
git branch -M main

# 원격 저장소 추가
git remote add origin https://github.com/daeungo11-sys/Las-vegas-program-.git

# 푸시
git push -u origin main
```

## Vercel에 배포하기

### 방법 1: Vercel 웹사이트에서 배포

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택: `daeungo11-sys/Las-vegas-program-`
4. 프로젝트 설정:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Environment Variables 추가:
   - Key: `VITE_GROQ_API_KEY`
   - Value: (실제 Groq API 키)
6. "Deploy" 클릭

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 환경 변수 설정

Vercel 대시보드에서:
1. 프로젝트 선택
2. Settings > Environment Variables
3. 다음 변수 추가:
   - `VITE_GROQ_API_KEY`: Groq API 키

## 중요 사항

- `.env` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)
- Vercel에서는 Environment Variables를 통해 API 키를 설정해야 합니다
- 배포 후 환경 변수가 제대로 설정되었는지 확인하세요
