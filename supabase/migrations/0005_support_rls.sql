-- Run in Supabase SQL Editor.
-- RLS for support_tickets / support_conversations (already existed in
-- the Phase 0 schema, but had no policies applied yet — without RLS
-- enabled, anon-key reads would return everything or nothing
-- depending on Postgres defaults, neither of which is safe).

alter table public.support_tickets enable row level security;
alter table public.support_conversations enable row level security;

drop policy if exists "nocturne: org members manage own support tickets" on public.support_tickets;
create policy "nocturne: org members manage own support tickets" on public.support_tickets
  for all using (
    organization_id is not null
    and (
      exists (
        select 1 from public.organization_members
        where organization_members.organization_id = support_tickets.organization_id
          and organization_members.user_id = auth.uid()
      )
      or exists (
        select 1 from public.organizations
        where organizations.id = support_tickets.organization_id
          and organizations.owner_id = auth.uid()
      )
    )
  ) with check (
    organization_id is not null
    and (
      exists (
        select 1 from public.organization_members
        where organization_members.organization_id = support_tickets.organization_id
          and organization_members.user_id = auth.uid()
      )
      or exists (
        select 1 from public.organizations
        where organizations.id = support_tickets.organization_id
          and organizations.owner_id = auth.uid()
      )
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
          exists (
            select 1 from public.organization_members
            where organization_members.organization_id = support_tickets.organization_id
              and organization_members.user_id = auth.uid()
          )
          or exists (
            select 1 from public.organizations
            where organizations.id = support_tickets.organization_id
              and organizations.owner_id = auth.uid()
          )
        )
    )
  ) with check (
    exists (
      select 1 from public.support_tickets
      where support_tickets.id = support_conversations.support_ticket_id
        and support_tickets.organization_id is not null
        and (
          exists (
            select 1 from public.organization_members
            where organization_members.organization_id = support_tickets.organization_id
              and organization_members.user_id = auth.uid()
          )
          or exists (
            select 1 from public.organizations
            where organizations.id = support_tickets.organization_id
              and organizations.owner_id = auth.uid()
          )
        )
    )
  );
