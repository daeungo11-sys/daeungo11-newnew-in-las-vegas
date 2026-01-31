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

## 학생 히스토리 DB 연동 (Supabase Edge Functions)

학생별 학습 기록 저장은 Supabase Edge Functions + Postgres를 사용합니다.

### 1) 환경 변수 설정 (Vercel)

```
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_SUPABASE_FUNCTIONS_URL=https://<project-ref>.functions.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2) Supabase 테이블 생성 (SQL)

Supabase SQL Editor에서 아래를 실행하세요:

```
create table if not exists students (
  id text primary key,
  name text not null,
  email text unique,
  created_at timestamptz default now()
);

create table if not exists student_activities (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references students(id) on delete cascade,
  activity_type text not null,
  input_text text not null,
  output_text text not null,
  created_at timestamptz default now()
);

create index if not exists student_activities_student_id_idx
  on student_activities(student_id, created_at desc);
```

이미 테이블이 생성되어 있다면 아래를 추가 실행하세요:

```
alter table student_activities
  drop constraint if exists student_activities_student_id_fkey;

alter table students
  alter column id type text;

alter table student_activities
  alter column student_id type text;

alter table student_activities
  add constraint student_activities_student_id_fkey
  foreign key (student_id) references students(id) on delete cascade;
```

### 3) Supabase Edge Functions 배포

Supabase CLI 설치 후:

```bash
supabase login
supabase link --project-ref <project-ref>
supabase secrets set SUPABASE_URL=https://<project-ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase functions deploy create-student
supabase functions deploy get-student
supabase functions deploy find-student
supabase functions deploy save-history
supabase functions deploy get-history
```

## 빌드

```bash
npm run build
```

## 배포

이 프로젝트는 Vercel을 통해 배포됩니다.
