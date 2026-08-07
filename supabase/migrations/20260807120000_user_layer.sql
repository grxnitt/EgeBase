create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_slug text not null check (char_length(article_slug) between 1 and 160),
  created_at timestamptz not null default now(),
  unique (user_id, article_slug)
);

create table if not exists public.article_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_slug text not null check (char_length(article_slug) between 1 and 160),
  status text not null default 'unread' check (status in ('read', 'unread')),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, article_slug)
);

create index if not exists favorites_user_id_created_at_idx
  on public.favorites (user_id, created_at desc);

create index if not exists article_progress_user_id_status_idx
  on public.article_progress (user_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public;
revoke execute on function public.handle_new_user() from public;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists article_progress_set_updated_at on public.article_progress;
create trigger article_progress_set_updated_at
  before update on public.article_progress
  for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name)
select id, nullif(raw_user_meta_data ->> 'display_name', '')
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.article_progress enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can read own favorites" on public.favorites;
create policy "Users can read own favorites"
  on public.favorites
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own favorites" on public.favorites;
create policy "Users can insert own favorites"
  on public.favorites
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites"
  on public.favorites
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own article progress" on public.article_progress;
create policy "Users can read own article progress"
  on public.article_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own article progress" on public.article_progress;
create policy "Users can insert own article progress"
  on public.article_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own article progress" on public.article_progress;
create policy "Users can update own article progress"
  on public.article_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own article progress" on public.article_progress;
create policy "Users can delete own article progress"
  on public.article_progress
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.article_progress to authenticated;
