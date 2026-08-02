-- Run in Supabase SQL Editor.
-- Supports the offline QR scanner: makes sure 'scanned' is an allowed
-- tickets.status value (idempotent — safe if a constraint already
-- covers it), adds an index for the by-QR lookup the scan endpoint
-- does on every scan, and an index for the per-event "give me every
-- valid ticket to cache offline" sync query.

alter table public.tickets
  drop constraint if exists tickets_status_check;

alter table public.tickets
  add constraint tickets_status_check
  check (status in ('valid', 'scanned', 'refunded', 'cancelled'));

create index if not exists tickets_qr_code_idx on public.tickets (qr_code);
create index if not exists tickets_event_id_status_idx on public.tickets (event_id, status);

-- Lets the scan endpoint (service-role client — RLS is bypassed there
-- by design, see app/api/scanner/scan/route.ts) attribute a scan to the
-- staff member who made it.
alter table public.tickets
  add column if not exists scanned_by_id uuid references auth.users (id);
