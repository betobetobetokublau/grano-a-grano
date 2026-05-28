-- Grano a Grano: schema inicial
--
-- Una sola tabla: `coffees`. Cada fila es una bolsa de cafe del usuario.
-- expires_at NO se almacena: se computa desde roast_date + is_open + opened_at
-- en el cliente (ver lib/expiration.ts). Esto evita que el valor se desincronice
-- al editar otros campos.
--
-- RLS activo: cada usuario solo ve y modifica sus propios cafes via auth.uid().

create extension if not exists "pgcrypto";

create table public.coffees (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  name               text not null,
  quantity_grams     integer not null default 340 check (quantity_grams >= 0),
  roast_date         date,
  manual_expires_at  date,
  is_open            boolean not null default false,
  opened_at          date,
  origin             text,
  created_at         timestamptz not null default now()
);

-- Index para el query mas comun: listar cafes del usuario.
create index coffees_user_id_idx on public.coffees (user_id);

-- RLS: cada usuario ve y modifica solo sus cafes.
alter table public.coffees enable row level security;

create policy "users select own coffees"
  on public.coffees
  for select
  using (auth.uid() = user_id);

create policy "users insert own coffees"
  on public.coffees
  for insert
  with check (auth.uid() = user_id);

create policy "users update own coffees"
  on public.coffees
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users delete own coffees"
  on public.coffees
  for delete
  using (auth.uid() = user_id);
