-- PayMind MVP schema
-- Run against your Supabase Postgres instance (or any Postgres 14+).

create extension if not exists "pgcrypto";

-- =========================
-- customers
-- =========================
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  created_at timestamptz not null default now()
);

create index if not exists idx_customers_email on customers(email);
create index if not exists idx_customers_created_at on customers(created_at);

-- =========================
-- products
-- =========================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category);

-- =========================
-- orders
-- =========================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  razorpay_order_id text unique
);

create index if not exists idx_orders_customer_id on orders(customer_id);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_razorpay_order_id on orders(razorpay_order_id);

-- =========================
-- order_items
-- =========================
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0)
);

create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);

-- =========================
-- payments
-- =========================
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  status text not null default 'created'
    check (status in ('created', 'authorized', 'captured', 'failed', 'refunded')),
  payment_method text,
  razorpay_payment_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_order_id on payments(order_id);
create index if not exists idx_payments_customer_id on payments(customer_id);
create index if not exists idx_payments_razorpay_payment_id on payments(razorpay_payment_id);
create index if not exists idx_payments_status on payments(status);

-- =========================
-- customer_events
-- (generic event log: e.g. "webhook_received", "offer_created", "segment_changed")
-- =========================
create table if not exists customer_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_customer_events_customer_id on customer_events(customer_id);
create index if not exists idx_customer_events_type on customer_events(event_type);
create index if not exists idx_customer_events_created_at on customer_events(created_at);

-- =========================
-- helper view: per-customer purchase stats
-- Only counts *paid* orders. This is the backbone of the
-- deterministic intelligence engine built in Phase 2.
-- =========================
create or replace view customer_purchase_stats as
select
  c.id as customer_id,
  count(o.id) as purchase_count,
  coalesce(sum(o.total_amount), 0) as total_spent,
  coalesce(avg(o.total_amount), 0) as avg_order_value,
  min(o.created_at) as first_purchase_date,
  max(o.created_at) as last_purchase_date
from customers c
left join orders o on o.customer_id = c.id and o.status = 'paid'
group by c.id;

-- =========================
-- Phase 2 additions (additive only — nothing above this line changes)
-- =========================

-- Average gap in days between a customer's consecutive paid orders.
-- Customers with 0 or 1 paid orders have no rows here (no gap to measure);
-- the intelligence engine falls back to a default cycle length for them.
create or replace view customer_order_intervals as
select
  customer_id,
  avg(interval_days) as avg_interval_days,
  count(*) as gap_count
from (
  select
    customer_id,
    extract(epoch from (
      created_at - lag(created_at) over (partition by customer_id order by created_at)
    )) / 86400.0 as interval_days
  from orders
  where status = 'paid'
) gaps
where interval_days is not null
group by customer_id;

-- Total quantity purchased per (customer, product), paid orders only.
-- Backs "favorite product" / "favorite category" lookups without N+1 queries.
create or replace view customer_product_totals as
select
  o.customer_id,
  p.id as product_id,
  p.name as product_name,
  p.category,
  sum(oi.quantity) as qty
from orders o
join order_items oi on oi.order_id = o.id
join products p on p.id = oi.product_id
where o.status = 'paid'
group by o.customer_id, p.id, p.name, p.category;

create or replace view customer_favorite_product as
select distinct on (customer_id)
  customer_id, product_id, product_name, category
from customer_product_totals
order by customer_id, qty desc, product_name asc;

create or replace view customer_category_totals as
select customer_id, category, sum(qty) as qty
from customer_product_totals
group by customer_id, category;

create or replace view customer_favorite_category as
select distinct on (customer_id) customer_id, category
from customer_category_totals
order by customer_id, qty desc, category asc;

-- Master view: one row per customer with everything the intelligence
-- engine needs to compute per-customer metrics and lifecycle segment.
-- Lifecycle segmentation itself stays in application code (lib/intelligence)
-- so the rules are unit-testable and documented in one place, not buried in SQL.
create or replace view customer_intelligence as
select
  c.id as customer_id,
  c.name,
  c.email,
  c.phone,
  c.created_at as customer_since,
  stats.purchase_count,
  stats.total_spent,
  stats.avg_order_value,
  stats.first_purchase_date,
  stats.last_purchase_date,
  intervals.avg_interval_days,
  case
    when stats.last_purchase_date is null then null
    else extract(day from (now() - stats.last_purchase_date))::int
  end as days_since_last_purchase,
  fav_product.product_id as favorite_product_id,
  fav_product.product_name as favorite_product_name,
  fav_category.category as favorite_category
from customers c
left join customer_purchase_stats stats on stats.customer_id = c.id
left join customer_order_intervals intervals on intervals.customer_id = c.id
left join customer_favorite_product fav_product on fav_product.customer_id = c.id
left join customer_favorite_category fav_category on fav_category.customer_id = c.id;
