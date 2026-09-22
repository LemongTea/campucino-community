create table if not exists public.audio_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  roblox_profile_id text not null,
  youtube_url text not null,
  original_title text,
  generated_name text,
  generated_description text,
  amplifier_db numeric not null default 0,
  bass_boost_db numeric not null default 0,
  playback_speed numeric not null default 1,
  output_format text not null default 'mp3',
  status text not null default 'queued',
  roblox_operation_path text,
  roblox_asset_id text,
  error_message text
);

alter table public.audio_jobs add column if not exists completed_at timestamptz;
alter table public.audio_jobs add column if not exists original_title text;
alter table public.audio_jobs add column if not exists generated_name text;
alter table public.audio_jobs add column if not exists generated_description text;
alter table public.audio_jobs add column if not exists roblox_operation_path text;
alter table public.audio_jobs add column if not exists roblox_asset_id text;
alter table public.audio_jobs add column if not exists error_message text;
alter table public.audio_jobs enable row level security;
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  username text not null unique,
  password_hash text not null,
  password_salt text not null,
  active boolean not null default true
);

alter table public.app_users enable row level security;

insert into public.app_users (username, password_hash, password_salt)
values ('campucino', '8d2ee59339a67ab16ec82c5c262dc521ff15dfd0ae16426b953cc291f29bf00b', 'f2a94efd673202739447f71a77e270f9')
on conflict (username) do update set password_hash = excluded.password_hash, password_salt = excluded.password_salt, active = true;