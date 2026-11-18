-- FORJA · Esquema de Supabase (ejecutar una vez en SQL Editor del proyecto nuevo)
-- Cada usuario guarda todo su estado (plan, registros, dieta...) en una fila JSON.
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

-- Cada persona solo puede leer y escribir su propia fila
drop policy if exists "leer lo mio" on public.user_state;
create policy "leer lo mio" on public.user_state for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "crear lo mio" on public.user_state;
create policy "crear lo mio" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "editar lo mio" on public.user_state;
create policy "editar lo mio" on public.user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "borrar lo mio" on public.user_state;
create policy "borrar lo mio" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);
