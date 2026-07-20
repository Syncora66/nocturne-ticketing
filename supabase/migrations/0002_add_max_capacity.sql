-- Run this in Supabase SQL Editor (project already has schema.sql applied).
-- Adds the max_capacity column used by the event creation form.

alter table public.events
  add column if not exists max_capacity integer
  check (max_capacity is null or max_capacity > 0);
