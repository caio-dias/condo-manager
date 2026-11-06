create schema if not exists private;

create table if not exists public.admin_profiles (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.residents (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(btrim(full_name)) > 0),
  email text not null check (email = lower(btrim(email))),
  tower text not null check (length(btrim(tower)) > 0),
  apartment text not null check (length(btrim(apartment)) > 0),
  phone text check (phone is null or length(btrim(phone)) > 0),
  created_at timestamptz not null default now()
);

create unique index if not exists residents_email_unique_idx
  on public.residents (email);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.residents (id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  description text not null check (length(btrim(description)) > 0),
  category text not null check (
    category in (
      'manutencao',
      'limpeza',
      'ruido',
      'seguranca',
      'areas_comuns',
      'outro'
    )
  ),
  location text not null check (length(btrim(location)) > 0),
  status text not null default 'aberta' check (
    status in ('aberta', 'em_andamento', 'resolvida')
  ),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists incidents_created_at_idx
  on public.incidents (created_at desc);
create index if not exists incidents_status_created_at_idx
  on public.incidents (status, created_at desc);
create index if not exists incidents_category_created_at_idx
  on public.incidents (category, created_at desc);
create index if not exists incidents_resident_id_idx
  on public.incidents (resident_id);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents (id) on delete cascade,
  resident_author_id uuid references public.residents (id) on delete cascade,
  admin_author_id uuid references public.admin_profiles (user_id) on delete cascade,
  body text not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  constraint comments_exactly_one_author check (
    (resident_author_id is not null)::integer +
    (admin_author_id is not null)::integer = 1
  )
);

create index if not exists comments_incident_created_at_idx
  on public.comments (incident_id, created_at);
create index if not exists comments_resident_author_id_idx
  on public.comments (resident_author_id);
create index if not exists comments_admin_author_id_idx
  on public.comments (admin_author_id);

alter table public.admin_profiles enable row level security;
alter table public.residents enable row level security;
alter table public.incidents enable row level security;
alter table public.comments enable row level security;

revoke all on public.admin_profiles from anon, authenticated;
revoke all on public.residents from anon, authenticated;
revoke all on public.incidents from anon, authenticated;
revoke all on public.comments from anon, authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'incident-photos',
  'incident-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists private.resident_access_attempts (
  attempt_key text primary key,
  window_started_at timestamptz not null,
  attempt_count integer not null check (attempt_count > 0),
  updated_at timestamptz not null default now()
);

create or replace function public.consume_resident_access_attempt(
  p_attempt_key text,
  p_max_attempts integer default 5,
  p_window_seconds integer default 900
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_attempt_count integer;
begin
  if p_attempt_key is null
    or length(p_attempt_key) <> 64
    or p_max_attempts < 1
    or p_max_attempts > 20
    or p_window_seconds < 60
    or p_window_seconds > 86400
  then
    raise exception 'Invalid rate-limit parameters';
  end if;

  insert into private.resident_access_attempts as attempts (
    attempt_key,
    window_started_at,
    attempt_count,
    updated_at
  )
  values (p_attempt_key, v_now, 1, v_now)
  on conflict (attempt_key) do update
  set
    window_started_at = case
      when attempts.window_started_at <= v_now - make_interval(secs => p_window_seconds)
        then v_now
      else attempts.window_started_at
    end,
    attempt_count = case
      when attempts.window_started_at <= v_now - make_interval(secs => p_window_seconds)
        then 1
      else attempts.attempt_count + 1
    end,
    updated_at = v_now
  returning attempt_count into v_attempt_count;

  return v_attempt_count <= p_max_attempts;
end;
$$;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;
revoke all on table private.resident_access_attempts from public, anon, authenticated;
grant select, insert, update, delete on table private.resident_access_attempts to service_role;
revoke all on function public.consume_resident_access_attempt(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_resident_access_attempt(text, integer, integer)
  to service_role;
