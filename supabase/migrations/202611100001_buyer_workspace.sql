-- Apply in your own Supabase project before enabling account sync or paid AI.
-- No service-role key is used in the app. Every operation uses the authenticated JWT and RLS.
create table if not exists public.buyer_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 preferences jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists public.buyer_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null,
 updated_at timestamptz not null default now(),
 constraint workspace_version check (state->>'version' = '2')
);
alter table public.buyer_profiles enable row level security;
alter table public.buyer_workspaces enable row level security;
create policy "Owner reads and writes own profile" on public.buyer_profiles for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "Owner reads and writes own workspace" on public.buyer_workspaces for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
revoke all on public.buyer_profiles, public.buyer_workspaces from anon;
grant select,insert,update,delete on public.buyer_profiles, public.buyer_workspaces to authenticated;
-- Persistent budget guard: at most 20 requests/user/day and 200 requests/project/day.
-- Lower the constants for your budget. Configure provider spending limits independently.
create table public.ai_daily_usage (
 day date not null,
 subject text not null,
 requests integer not null default 0,
 primary key(day,subject)
);
alter table public.ai_daily_usage enable row level security;
revoke all on public.ai_daily_usage from anon,authenticated;
create or replace function public.consume_ai_quota() returns boolean
language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); today date:=(now() at time zone 'utc')::date; user_count integer; global_count integer;
begin
 if uid is null then return false; end if;
 -- Serialize project-wide allocation to prevent concurrent overspending races.
 perform pg_advisory_xact_lock(7142995);
 select requests into user_count from public.ai_daily_usage where day=today and subject=uid::text;
 select requests into global_count from public.ai_daily_usage where day=today and subject='project';
 if coalesce(user_count,0)>=20 or coalesce(global_count,0)>=200 then return false; end if;
 insert into public.ai_daily_usage(day,subject,requests) values(today,uid::text,1),(today,'project',1)
 on conflict(day,subject) do update set requests=public.ai_daily_usage.requests+1;
 return true;
end $$;
revoke all on function public.consume_ai_quota() from public,anon;
grant execute on function public.consume_ai_quota() to authenticated;
