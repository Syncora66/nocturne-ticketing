-- Run in Supabase SQL Editor.
-- Adds RLS policies + the atomic purchase/release functions needed by
-- the 4 API routes, targeting the REAL "Phase 0" schema already live in
-- this project (organizations / organization_members / events /
-- ticket_types / tickets / support_tickets / support_conversations).
--
-- Safe to re-run: every statement either uses IF EXISTS/OR REPLACE, or
-- ENABLE ROW LEVEL SECURITY (a no-op if already enabled).
--
-- NOTE: public.users does not appear in this schema. owner_id / user_id
-- here reference auth.users(id) directly via auth.uid() — nothing below
-- depends on a public.users table existing.

-- CRITICAL FIX: the signup trigger still targets public.users, which
-- doesn't exist in this schema — every signup has been failing at the
-- database level. Point it at organizations/organization_members
-- instead: each new user gets their own organization, named after the
-- "workspace_name" collected at signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_org_name text := coalesce(new.raw_user_meta_data ->> 'workspace_name', new.email);
  v_slug text;
  v_org_id uuid;
begin
  v_slug := trim(both '-' from lower(regexp_replace(v_org_name, '[^a-zA-Z0-9]+', '-', 'g')))
    || '-' || substr(md5(random()::text), 1, 6);

  insert into public.organizations (owner_id, name, slug, commission_rate)
  values (new.id, v_org_name, v_slug, 0.05)
  returning id into v_org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_org_id, new.id, 'owner');

  return new;
end;
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.tickets enable row level security;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
drop policy if exists "nocturne: owners manage own organizations" on public.organizations;
create policy "nocturne: owners manage own organizations" on public.organizations
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "nocturne: members read their organizations" on public.organizations;
create policy "nocturne: members read their organizations" on public.organizations
  for select using (
    deleted_at is null
    and exists (
      select 1 from public.organization_members
      where organization_members.organization_id = organizations.id
        and organization_members.user_id = auth.uid()
    )
  );

drop policy if exists "nocturne: anyone reads orgs with published events" on public.organizations;
create policy "nocturne: anyone reads orgs with published events" on public.organizations
  for select using (
    deleted_at is null
    and exists (
      select 1 from public.events
      where events.organization_id = organizations.id
        and events.status = 'published'
        and events.deleted_at is null
    )
  );

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
drop policy if exists "nocturne: members read their org membership" on public.organization_members;
create policy "nocturne: members read their org membership" on public.organization_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.owner_id = auth.uid()
    )
  );

drop policy if exists "nocturne: owners manage org membership" on public.organization_members;
create policy "nocturne: owners manage org membership" on public.organization_members
  for all using (
    exists (
      select 1 from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.owner_id = auth.uid()
    )
  );

-- Lets a user who just created an organization insert themselves as a
-- member of it (POST /api/organizations does this in one follow-up call).
drop policy if exists "nocturne: self join as member of owned org" on public.organization_members;
create policy "nocturne: self join as member of owned org" on public.organization_members
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.owner_id = auth.uid()
    )
  );

-- ============================================================
-- EVENTS
-- ============================================================
drop policy if exists "nocturne: org members manage events" on public.events;
create policy "nocturne: org members manage events" on public.events
  for all using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = events.organization_id
        and organization_members.user_id = auth.uid()
    )
    or exists (
      select 1 from public.organizations
      where organizations.id = events.organization_id
        and organizations.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = events.organization_id
        and organization_members.user_id = auth.uid()
    )
    or exists (
      select 1 from public.organizations
      where organizations.id = events.organization_id
        and organizations.owner_id = auth.uid()
    )
  );

drop policy if exists "nocturne: anyone reads published events" on public.events;
create policy "nocturne: anyone reads published events" on public.events
  for select using (status = 'published' and deleted_at is null);

-- ============================================================
-- TICKET TYPES
-- ============================================================
drop policy if exists "nocturne: org members manage ticket types" on public.ticket_types;
create policy "nocturne: org members manage ticket types" on public.ticket_types
  for all using (
    exists (
      select 1 from public.events
      where events.id = ticket_types.event_id
        and (
          exists (
            select 1 from public.organization_members
            where organization_members.organization_id = events.organization_id
              and organization_members.user_id = auth.uid()
          )
          or exists (
            select 1 from public.organizations
            where organizations.id = events.organization_id
              and organizations.owner_id = auth.uid()
          )
        )
    )
  ) with check (
    exists (
      select 1 from public.events
      where events.id = ticket_types.event_id
        and (
          exists (
            select 1 from public.organization_members
            where organization_members.organization_id = events.organization_id
              and organization_members.user_id = auth.uid()
          )
          or exists (
            select 1 from public.organizations
            where organizations.id = events.organization_id
              and organizations.owner_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "nocturne: anyone reads ticket types of published events" on public.ticket_types;
create policy "nocturne: anyone reads ticket types of published events" on public.ticket_types
  for select using (
    exists (
      select 1 from public.events
      where events.id = ticket_types.event_id
        and events.status = 'published'
        and events.deleted_at is null
    )
  );

-- ============================================================
-- TICKETS
-- Buyers have no session (no auth.uid()), so purchases go through
-- /api/tickets/purchase using the service-role client, which bypasses
-- RLS entirely. Only organizers get direct read access here.
-- ============================================================
drop policy if exists "nocturne: org members read own event tickets" on public.tickets;
create policy "nocturne: org members read own event tickets" on public.tickets
  for select using (
    exists (
      select 1 from public.events
      where events.id = tickets.event_id
        and (
          exists (
            select 1 from public.organization_members
            where organization_members.organization_id = events.organization_id
              and organization_members.user_id = auth.uid()
          )
          or exists (
            select 1 from public.organizations
            where organizations.id = events.organization_id
              and organizations.owner_id = auth.uid()
          )
        )
    )
  );

-- ============================================================
-- Atomic ticket purchase — decrements remaining_quantity, never below
-- zero, safe under concurrent purchases of the same ticket type.
-- ============================================================
create or replace function public.purchase_tickets(
  p_ticket_type_id uuid,
  p_quantity integer
)
returns setof public.ticket_types
language plpgsql
security definer set search_path = public
as $$
begin
  return query
  update public.ticket_types
  set remaining_quantity = remaining_quantity - p_quantity
  where id = p_ticket_type_id
    and remaining_quantity >= p_quantity
  returning *;
end;
$$;

-- Compensating action if ticket row creation fails after
-- purchase_tickets() already reserved capacity.
create or replace function public.release_tickets(
  p_ticket_type_id uuid,
  p_quantity integer
)
returns setof public.ticket_types
language plpgsql
security definer set search_path = public
as $$
begin
  return query
  update public.ticket_types
  set remaining_quantity = remaining_quantity + p_quantity
  where id = p_ticket_type_id
  returning *;
end;
$$;
