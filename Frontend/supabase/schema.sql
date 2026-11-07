-- NoTo (Note Your Todos) Database Schema & Security
-- PostgreSQL + Supabase Migration

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. User Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  avatar_url text,
  selected_theme text default 'default',
  notification_preferences jsonb default '{"email_notifications": true, "task_reminders": true, "weekly_summary": false}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Sticky Notes Table
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text default '' not null,
  category text default 'General',
  tags text[] default '{}',
  color text default '#f1e4c3',
  is_pinned boolean default false not null,
  is_archived boolean default false not null,
  order_index integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. Todos Table
create table if not exists public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text default '',
  due_date date,
  due_time time,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium' not null,
  category text default 'General',
  is_completed boolean default false not null,
  completed_at timestamptz,
  order_index integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 5. Indexes for Fast Filtering & Sorting
create index if not exists idx_notes_user_id on public.notes (user_id);
create index if not exists idx_notes_created_at on public.notes (created_at desc);
create index if not exists idx_notes_pinned on public.notes (user_id, is_pinned desc);
create index if not exists idx_notes_archived on public.notes (user_id, is_archived);

create index if not exists idx_todos_user_id on public.todos (user_id);
create index if not exists idx_todos_due_date on public.todos (user_id, due_date);
create index if not exists idx_todos_completed on public.todos (user_id, is_completed);

-- 6. Updated At Trigger Function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

create or replace trigger set_notes_updated_at
before update on public.notes
for each row execute function public.handle_updated_at();

create or replace trigger set_todos_updated_at
before update on public.todos
for each row execute function public.handle_updated_at();

-- 7. Automatically Create Profile on User Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, selected_theme)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    null,
    'default'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 8. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.notes enable row level security;
alter table public.todos enable row level security;

-- 9. Row Level Security Policies

-- Profiles Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Notes Policies
create policy "Users can view own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- Todos Policies
create policy "Users can view own todos"
  on public.todos for select
  using (auth.uid() = user_id);

create policy "Users can insert own todos"
  on public.todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on public.todos for update
  using (auth.uid() = user_id);

create policy "Users can delete own todos"
  on public.todos for delete
  using (auth.uid() = user_id);

