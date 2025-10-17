create extension if not exists "pgcrypto";

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  commune text,
  price numeric(10,2),
  score_tags text[] default '{}',
  perks text[] default '{}',
  created_at timestamptz default now()
);

alter table public.listings enable row level security;

drop policy if exists "read_all_listings" on public.listings;
create policy "read_all_listings"
on public.listings for select
to anon, authenticated
using (true);

create index if not exists listings_created_at_idx on public.listings(created_at desc);

-- === LocalKaz: contenu & carte (ajout) ===
create table if not exists public.site_settings (
  id int primary key default 1,
  site_name text,
  hero_title text,
  hero_subtitle text,
  hero_image_url text
);
alter table public.site_settings enable row level security;
drop policy if exists "read_site_settings" on public.site_settings;
create policy "read_site_settings" on public.site_settings
for select to anon, authenticated using (true);

create table if not exists public.communes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  blurb text,
  top_pct numeric not null default 0,
  left_pct numeric not null default 0,
  tags text[] default '{}'
);
alter table public.communes enable row level security;
drop policy if exists "read_communes" on public.communes;
create policy "read_communes" on public.communes
for select to anon, authenticated using (true);

-- Ajout éventuel de cover_url sur listings (si absent)
alter table public.listings add column if not exists cover_url text;
