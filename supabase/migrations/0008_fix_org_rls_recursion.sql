-- Run in Supabase SQL Editor.
-- Fixes Postgres error 42P17 ("infinite recursion detected in policy
-- for relation organization_members"), discovered while building the
-- QR scanner's /api/scanner/tickets route but not caused by it — it's
-- a pre-existing cycle between organizations and organization_members:
--
--   organizations."members read their organizations" queries
--     organization_members, whose own
--   "members read their org membership" queries organizations again,
--     which re-triggers the first policy — recursing until Postgres
--     gives up.
--
-- Any query touching organizations, organization_members, events,
-- ticket_types, tickets, support_tickets, or support_conversations —
-- i.e. most of the app, including the dashboard itself — hits this
-- whenever the "not the owner, check membership" branch of a policy
-- actually gets evaluated.
--
-- Fix: SECURITY DEFINER helper functions. Postgres RLS is bypassed for
-- tables queried *inside* a SECURITY DEFINER function (this project
-- never sets FORCE ROW LEVEL SECURITY anywhere, so nothing here changes
-- that), so replacing the nested "EXISTS (SELECT ... FROM an
-- RLS-protected table)" subqueries with a call to one of these breaks
-- the cycle instead of just moving it — this is Supabase's own
-- documented fix for this exact error.

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = p_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_owner(p_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organizations
    where id = p_org_id and owner_id = auth.uid()
  );
$$;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
drop policy if exists "nocturne: members read their organizations" on public.organizations;
create policy "nocturne: members read their organizations" on public.organizations
  for select using (
    deleted_at is null and public.is_org_member(id)
  );

-- ============================================================
-- ORGANIZATION MEMBERS
-- ============================================================
drop policy if exists "nocturne: members read their org membership" on public.organization_members;
create policy "nocturne: members read their org membership" on public.organization_members
  for select using (
    user_id = auth.uid() or public.is_org_owner(organization_id)
  );

drop policy if exists "nocturne: owners manage org membership" on public.organization_members;
create policy "nocturne: owners manage org membership" on public.organization_members
  for all using (
    public.is_org_owner(organization_id)
  ) with check (
    public.is_org_owner(organization_id)
  );

drop policy if exists "nocturne: self join as member of owned org" on public.organization_members;
create policy "nocturne: self join as member of owned org" on public.organization_members
  for insert with check (
    user_id = auth.uid() and public.is_org_owner(organization_id)
  );

-- ============================================================
-- EVENTS
-- ============================================================
drop policy if exists "nocturne: org members manage events" on public.events;
create policy "nocturne: org members manage events" on public.events
  for all using (
    public.is_org_member(organization_id) or public.is_org_owner(organization_id)
  ) with check (
    public.is_org_member(organization_id) or public.is_org_owner(organization_id)
  );

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
          public.is_org_member(events.organization_id)
          or public.is_org_owner(events.organization_id)
        )
    )
  ) with check (
    exists (
      select 1 from public.events
      where events.id = ticket_types.event_id
        and (
          public.is_org_member(events.organization_id)
          or public.is_org_owner(events.organization_id)
        )
    )
  );

-- ============================================================
-- TICKETS
-- ============================================================
drop policy if exists "nocturne: org members read own event tickets" on public.tickets;
create policy "nocturne: org members read own event tickets" on public.tickets
  for select using (
    exists (
      select 1 from public.events
      where events.id = tickets.event_id
        and (
          public.is_org_member(events.organization_id)
          or public.is_org_owner(events.organization_id)
        )
    )
  );

-- ============================================================
-- SUPPORT TICKETS / CONVERSATIONS
-- (same recursive pattern as above, introduced in 0005_support_rls.sql)
-- ============================================================
drop policy if exists "nocturne: org members manage own support tickets" on public.support_tickets;
create policy "nocturne: org members manage own support tickets" on public.support_tickets
  for all using (
    organization_id is not null
    and (
      public.is_org_member(organization_id)
      or public.is_org_owner(organization_id)
    )
  ) with check (
    organization_id is not null
    and (
      public.is_org_member(organization_id)
      or public.is_org_owner(organization_id)
    )
  );

drop policy if exists "nocturne: org members manage own support conversations" on public.support_conversations;
create policy "nocturne: org members manage own support conversations" on public.support_conversations
  for all using (
    exists (
      select 1 from public.support_tickets
      where support_tickets.id = support_conversations.support_ticket_id
        and support_tickets.organization_id is not null
        and (
          public.is_org_member(support_tickets.organization_id)
          or public.is_org_owner(support_tickets.organization_id)
        )
    )
  ) with check (
    exists (
      select 1 from public.support_tickets
      where support_tickets.id = support_conversations.support_ticket_id
        and support_tickets.organization_id is not null
        and (
          public.is_org_member(support_tickets.organization_id)
          or public.is_org_owner(support_tickets.organization_id)
        )
    )
  );
