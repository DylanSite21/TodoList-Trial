create table public."TodoList" (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone not null default now(),
  name text not null,
  "isCompleted" boolean not null default false
);