-- Run in Supabase SQL Editor.
-- Adds priority to support_tickets, and extends its status check
-- constraint with 'pending_refund_review' — both used by the
-- refund-escalation flow in /api/support/chat and filterable via
-- GET /api/admin/support-tickets. The existing status constraint only
-- allowed ('open', 'closed', 'resolved', 'in_progress'); until this
-- migration runs, /api/support/chat falls back to 'in_progress' for
-- refund requests instead of failing.

alter table public.support_tickets
  add column if not exists priority text not null default 'normal';

alter table public.support_tickets
  drop constraint if exists support_tickets_priority_check;

alter table public.support_tickets
  add constraint support_tickets_priority_check
  check (priority in ('low', 'normal', 'high', 'urgent'));

alter table public.support_tickets
  drop constraint if exists support_tickets_status_check;

alter table public.support_tickets
  add constraint support_tickets_status_check
  check (status in ('open', 'closed', 'resolved', 'in_progress', 'pending_refund_review'));
