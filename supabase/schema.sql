create extension if not exists "uuid-ossp";

create type public.member_role as enum ('admin', 'employee');
create type public.lead_stage as enum ('New leads', 'Contacted', 'Proposal', 'Negotiation', 'Won');

create table public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  workspace_id uuid references public.workspaces on delete set null,
  full_name text,
  role public.member_role not null default 'employee',
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  owner_id uuid references auth.users on delete set null,
  name text not null,
  company text not null,
  email text,
  deal_value numeric(12,2) not null default 0,
  stage public.lead_stage not null default 'New leads',
  source text not null default 'Website',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  lead_id uuid references public.leads on delete cascade,
  assignee_id uuid references auth.users on delete set null,
  title text not null,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  actor_id uuid references auth.users on delete set null,
  lead_id uuid references public.leads on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and workspace_id = target_workspace);
$$;

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_log enable row level security;

create policy "members can view their workspace" on public.workspaces for select using (id in (select workspace_id from public.profiles where id = auth.uid()));
create policy "members can view profiles" on public.profiles for select using (workspace_id in (select workspace_id from public.profiles where id = auth.uid()));
create policy "members manage leads" on public.leads for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members manage tasks" on public.tasks for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "members view activity" on public.activity_log for select using (public.is_workspace_member(workspace_id));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare new_workspace uuid;
begin
  insert into public.workspaces (name) values (coalesce(new.raw_user_meta_data->>'workspace_name', 'My Workspace')) returning id into new_workspace;
  insert into public.profiles (id, workspace_id, full_name, role) values (new.id, new_workspace, new.raw_user_meta_data->>'full_name', 'admin');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Supabase Auth runs this trigger as supabase_auth_admin.
grant usage on schema public to supabase_auth_admin;
grant insert, select on public.workspaces to supabase_auth_admin;
grant insert, select on public.profiles to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before update on public.leads for each row execute procedure public.set_updated_at();

alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.activity_log;
