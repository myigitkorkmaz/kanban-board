-- ============================================
-- Flow Board — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- TASKS TABLE
-- ============================================
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  due_date date,
  user_id uuid not null references auth.users(id) on delete cascade,
  assignee_ids uuid[] default '{}',
  label_ids uuid[] default '{}',
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users can manage their own tasks"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#7c6cfc',
  initials text not null,
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

create policy "Users can manage their own team members"
  on public.team_members
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- LABELS TABLE
-- ============================================
create table public.labels (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#7c6cfc',
  created_at timestamptz not null default now()
);

alter table public.labels enable row level security;

create policy "Users can manage their own labels"
  on public.labels
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Users can manage their own comments"
  on public.comments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
create table public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

alter table public.activity_logs enable row level security;

create policy "Users can manage their own activity logs"
  on public.activity_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================
-- AUTO-SET user_id via trigger (convenience)
-- ============================================
create or replace function public.set_user_id()
returns trigger as $$
begin
  new.user_id = auth.uid();
  return new;
end;
$$ language plpgsql security definer;

create trigger set_tasks_user_id
  before insert on public.tasks
  for each row execute function public.set_user_id();

create trigger set_team_members_user_id
  before insert on public.team_members
  for each row execute function public.set_user_id();

create trigger set_labels_user_id
  before insert on public.labels
  for each row execute function public.set_user_id();

create trigger set_comments_user_id
  before insert on public.comments
  for each row execute function public.set_user_id();

create trigger set_activity_logs_user_id
  before insert on public.activity_logs
  for each row execute function public.set_user_id();

-- ============================================
-- INDEXES for performance
-- ============================================
create index tasks_user_id_idx on public.tasks(user_id);
create index tasks_status_idx on public.tasks(status);
create index comments_task_id_idx on public.comments(task_id);
create index activity_logs_task_id_idx on public.activity_logs(task_id);
create index team_members_user_id_idx on public.team_members(user_id);
create index labels_user_id_idx on public.labels(user_id);
