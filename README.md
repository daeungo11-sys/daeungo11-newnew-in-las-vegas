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
supabase functions deploy get-leaderboard
supabase functions deploy get-vocabulary
supabase functions deploy add-vocabulary
supabase functions deploy delete-vocabulary
```

### 4) 게이미피케이션 (포인트·뱃지·랭킹)

학습 성취도에 따라 포인트와 뱃지를 부여하고, 학원 내 랭킹을 표시하려면 아래 SQL을 Supabase SQL Editor에서 실행하세요.  
`supabase/migrations/gamification.sql` 내용을 실행하거나, 아래와 같이 실행합니다.

```sql
-- students에 포인트 컬럼 추가
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'students' and column_name = 'points'
  ) then
    alter table students add column points integer not null default 0;
  end if;
end $$;

-- 학생 뱃지 테이블
create table if not exists student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references students(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique(student_id, badge_key)
);
create index if not exists student_badges_student_id_idx on student_badges(student_id);
```

- **포인트**: Paraphrasing 10P, 보완학습 플랜 10P, 데일리 리뷰 15P, 지문 요약 10P, 미니 퀴즈 정답당 5P
- **뱃지**: 첫 학습(`first_activity`), 퀴즈 만점(`quiz_perfect`) 등
- **랭킹**: 상단 메뉴 "학원 랭킹"에서 포인트 순위 확인

### 5) 모바일 단어 복습 (학원 단어 게임 연동)

학원에서 배운 단어를 이동 중·집에서 게임처럼 복습하려면 아래를 적용하세요.

**Supabase SQL** (Supabase SQL Editor에서 실행):

```sql
create table if not exists student_vocabulary (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references students(id) on delete cascade,
  word text not null,
  meaning text not null,
  created_at timestamptz default now()
);
create index if not exists student_vocabulary_student_id_idx on student_vocabulary(student_id, created_at desc);
```

- **웹**: 학생 뷰에서 「내 단어장」 메뉴로 단어 추가·삭제 후, **「📱 이동 중·집에서 복습하기」** 링크로 복습 페이지 주소 확인
- **모바일**: 브라우저에서 `/review` 주소로 접속한 뒤 **학생 ID를 입력**해 로그인하면 플래시카드·뜻 맞히기 퀴즈 사용 가능. **홈 화면에 추가**하면 앱처럼 사용할 수 있음 (PWA)

## 빌드

```bash
npm run build
```

## 배포

이 프로젝트는 Vercel을 통해 배포됩니다.
