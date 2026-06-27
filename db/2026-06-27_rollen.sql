-- Rollen: genau ein Administrator, alle anderen Mitarbeiter (nur Leserechte auf Einstellungen)
-- Einspielen im Supabase SQL-Editor:
-- https://supabase.com/dashboard/project/xcrsnemexrvcatttmqey/sql/new

-- 1) Rollen-Spalte
alter table public.app_users
  add column if not exists rolle text not null default 'mitarbeiter';

alter table public.app_users drop constraint if exists app_users_rolle_check;
alter table public.app_users
  add constraint app_users_rolle_check check (rolle in ('admin','mitarbeiter'));

-- 2) Inhaber zum Admin machen (Juri Schäfer)
insert into public.app_users (id, vorname, nachname, rolle)
  values ('9a62f99e-d8e1-4574-9a5f-5df7842f8c91', 'Juri', 'Schäfer', 'admin')
  on conflict (id) do update set rolle = 'admin';

-- 3) Es darf immer nur EINEN Admin geben
create unique index if not exists app_users_one_admin
  on public.app_users ((rolle)) where (rolle = 'admin');

-- 4) Helfer: ist der aktuelle Nutzer Admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.app_users
    where id = auth.uid() and rolle = 'admin'
  );
$$;

-- 5) Schutz: ein Mitarbeiter darf seine eigene Rolle NICHT ändern
create or replace function public.app_users_guard_rolle()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if new.rolle is distinct from old.rolle and not public.is_admin() then
    raise exception 'Nur der Administrator darf Rollen ändern.';
  end if;
  return new;
end $$;

drop trigger if exists app_users_guard_rolle on public.app_users;
create trigger app_users_guard_rolle
  before update on public.app_users
  for each row execute function public.app_users_guard_rolle();

-- 6) Admin-Rechte übertragen (atomar: danach genau ein Admin)
create or replace function public.set_admin(target uuid)
returns void language plpgsql security definer
set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Nur der Administrator darf Rollen ändern.';
  end if;
  update public.app_users
    set rolle = case when id = target then 'admin' else 'mitarbeiter' end;
end $$;
grant execute on function public.set_admin(uuid) to authenticated;

-- 7) RLS: Einstellungen darf jeder lesen, aber nur die EIGENE Zeile schreiben.
--    Da Firmendaten unter der Inhaber-ID liegen, kann sie damit nur der Inhaber/Admin ändern.
alter table public.einstellungen enable row level security;

drop policy if exists einstellungen_select on public.einstellungen;
create policy einstellungen_select on public.einstellungen
  for select to authenticated using (true);

drop policy if exists einstellungen_own_write on public.einstellungen;
create policy einstellungen_own_write on public.einstellungen
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
