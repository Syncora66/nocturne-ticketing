-- Nocturne Ticketing — Database schema
-- Paste into Supabase SQL Editor (project: nocturne-ticketing, region: EU West)

-- ============================================================
-- USERS (organizer profiles, extends auth.users)
-- ============================================================
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email varchar(255) unique not null,
  workspace_name varchar(255),
  avatar_url varchar(500),
  subscription_tier varchar(50) not null default 'free', -- free, pro, enterprise
  stripe_customer_id varchar(255),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users can read own profile" on public.users
  for select using (auth.uid() = id);

create policy "users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- workspace_name comes from the signup form (passed as auth metadata).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, workspace_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'workspace_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- EVENTS
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.users (id) on delete cascade,
  name varchar(255) not null,
  description text,
  date timestamptz not null,
  location varchar(500),
  image_url varchar(500),
  max_capacity integer check (max_capacity is null or max_capacity > 0),
  status varchar(50) not null default 'draft', -- draft, published, ended
  language varchar(10) not null default 'fr', -- fr, en, es
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "organizers manage own events" on public.events
  for all using (organizer_id = auth.uid()) with check (organizer_id = auth.uid());

create policy "anyone can read published events" on public.events
  for select using (status = 'published');

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on public.events
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- TICKET TIERS
-- ============================================================
create table public.ticket_tiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  tier_name varchar(100) not null, -- Early bird, Normal, VIP
  price_cents integer not null check (price_cents >= 0),
  max_quantity integer, -- null = unlimited
  sold_quantity integer not null default 0,
  presale_start timestamptz,
  presale_end timestamptz,
  tier_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ticket_tiers enable row level security;

create policy "organizers manage own ticket tiers" on public.ticket_tiers
  for all using (
    exists (
      select 1 from public.events
      where events.id = ticket_tiers.event_id
        and events.organizer_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events
      where events.id = ticket_tiers.event_id
        and events.organizer_id = auth.uid()
    )
  );

create policy "anyone can read tiers of published events" on public.ticket_tiers
  for select using (
    exists (
      select 1 from public.events
      where events.id = ticket_tiers.event_id
        and events.status = 'published'
    )
  );

-- ============================================================
-- TICKETS SOLD
-- Client-side access is intentionally locked down: purchases and
-- lookups go through server API routes using the service role key
-- (bypasses RLS), never directly from the browser. Only organizers
-- get direct read access here, for their dashboard.
-- ============================================================
create table public.tickets_sold (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid not null references public.ticket_tiers (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  buyer_email varchar(255) not null,
  buyer_name varchar(255),
  qr_code varchar(500) unique not null,
  status varchar(50) not null default 'valid'
    check (status in ('valid', 'scanned', 'refunded', 'cancelled')),
  amount_cents integer not null,
  payment_intent_id varchar(255),
  purchased_at timestamptz not null default now()
);

alter table public.tickets_sold enable row level security;

create policy "organizers read own event tickets" on public.tickets_sold
  for select using (
    exists (
      select 1 from public.events
      where events.id = tickets_sold.event_id
        and events.organizer_id = auth.uid()
    )
  );

-- ============================================================
-- CHECK-INS
-- ============================================================
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets_sold (id) on delete cascade,
  staff_id uuid references public.users (id),
  qr_version int not null default 1,
  checked_in_at timestamptz not null default now()
);

alter table public.check_ins enable row level security;

create policy "organizers read own event check-ins" on public.check_ins
  for select using (
    exists (
      select 1 from public.tickets_sold
      join public.events on events.id = tickets_sold.event_id
      where tickets_sold.id = check_ins.ticket_id
        and events.organizer_id = auth.uid()
    )
  );

create policy "authenticated staff can record check-ins" on public.check_ins
  for insert to authenticated with check (true);

-- ============================================================
-- INDEXES
-- ============================================================
create index events_organizer_id_idx on public.events (organizer_id);
create index ticket_tiers_event_id_idx on public.ticket_tiers (event_id);
create index tickets_sold_event_id_idx on public.tickets_sold (event_id);
create index tickets_sold_tier_id_idx on public.tickets_sold (tier_id);
create index check_ins_ticket_id_idx on public.check_ins (ticket_id);
