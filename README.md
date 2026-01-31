# AI English Learning Platform

Groq API를 활용한 AI 영어 학습 플랫폼입니다.

## 주요 기능

- Groq API를 통한 AI 채팅 기능
- 실시간 스트리밍 응답
- 영어 학습을 위한 AI 코치

## 학원 운영 시나리오 제안

학원 환경에서는 모든 학생의 에세이를 강사가 개별 첨삭하기에 현실적 한계가 있으므로, 1차 첨삭을 앱이 담당하는 구조를 제안합니다.

### Step 1: AI 자동 분석 + 학급 통계 대시보드

- 학생이 에세이를 제출하면 AI가 문법, 어휘, 토익 적합도를 자동 분석
- 강사에게는 개별 결과 대신 학급 전체 오류 통계를 대시보드로 제공
- 강사는 수업 시작 전 통계를 참고해 공통 오류를 중심으로 수업 진행

### 데이터베이스 설계 방향

- 학생별 제출 에세이와 AI 분석 결과를 저장
- 학급/기간 기준으로 오류 유형 집계가 가능한 통계 테이블 구축
- 대시보드에서 문법/어휘/토익 적합도 지표를 조회할 수 있도록 인덱싱

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

## 빌드

```bash
npm run build
```

## 배포

이 프로젝트는 Vercel을 통해 배포됩니다.

## 로컬 데이터베이스(API) 설정

이 프로젝트에는 학급 통계 대시보드용 데이터베이스 스키마와 간단한 API 서버가 포함되어 있습니다.

### 1) 의존성 설치

```bash
npm install
```

### 2) 환경 변수 설정

`.env` 파일을 만들고 아래 내용을 추가하세요:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL="file:./dev.db"
```

### 3) Prisma 초기화

```bash
npm run db:generate
npm run db:migrate
```

### 4) API 서버 실행

```bash
npm run server
```
