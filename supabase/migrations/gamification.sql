-- 게이미피케이션: 포인트 및 뱃지
-- Supabase SQL Editor에서 실행하세요.

-- 1) students 테이블에 포인트 컬럼 추가 (이미 있으면 무시)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'students' and column_name = 'points'
  ) then
    alter table students add column points integer not null default 0;
  end if;
end $$;

-- 2) 학생 뱃지 테이블
create table if not exists student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references students(id) on delete cascade,
  badge_key text not null,
  earned_at timestamptz default now(),
  unique(student_id, badge_key)
);

create index if not exists student_badges_student_id_idx
  on student_badges(student_id);

comment on table student_badges is '학습 성취에 따른 뱃지 (first_activity, quiz_perfect, streak_3 등)';
