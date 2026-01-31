# AI English Learning Platform

Groq API를 활용한 AI 영어 학습 플랫폼입니다.

## 주요 기능

- Groq API를 통한 AI 채팅 기능
- 실시간 스트리밍 응답
- 영어 학습을 위한 AI 코치

## 기술 스택

- React
- Vite
- Groq SDK

## 설치 방법

```bash
npm install
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Groq API 키는 [Groq Console](https://console.groq.com/keys)에서 발급받을 수 있습니다.

## 실행 방법

```bash
npm run dev
```

## 학생 히스토리 DB 연동

학생별 학습 기록 저장을 위해 SQLite + Prisma 기반의 간단한 API 서버가 포함되어 있습니다.

### 1) 환경 변수 설정

`.env` 파일을 만들고 아래 내용을 추가하세요:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_API_BASE_URL=http://localhost:8787
DATABASE_URL="file:./dev.db"
```

### 2) Prisma 초기화

```bash
npm run db:generate
npm run db:migrate
```

### 3) API 서버 실행

```bash
npm run server
```

## 빌드

```bash
npm run build
```

## 배포

이 프로젝트는 Vercel을 통해 배포됩니다.
