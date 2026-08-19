-- Table profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone not null default now()
);

-- Tambahkan relasi user ke TodoList
alter table public."TodoList"
add column user_id uuid not null references public.profiles(id) on delete cascade;