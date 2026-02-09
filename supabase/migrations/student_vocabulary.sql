-- 학원에서 배운 단어 (모바일 복습용)
-- Supabase SQL Editor에서 실행하세요.

create table if not exists student_vocabulary (
  id uuid primary key default gen_random_uuid(),
  student_id text not null references students(id) on delete cascade,
  word text not null,
  meaning text not null,
  created_at timestamptz default now()
);

create index if not exists student_vocabulary_student_id_idx
  on student_vocabulary(student_id, created_at desc);

comment on table student_vocabulary is '학생별 단어장 - 모바일 복습 게임 연동';
