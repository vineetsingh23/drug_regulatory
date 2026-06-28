create table if not exists public.service_proposals (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_person text not null,
  email text not null,
  phone text,
  service_required text not null,
  target_market text not null,
  product_name text not null,
  product_category text,
  proposal_notes text,
  accepted_fee_review boolean not null default false,
  document_names text[] not null default '{}',
  status text not null default 'Proposal submitted',
  fee_status text not null default 'Pending review',
  created_at timestamptz not null default now()
);

alter table public.service_proposals enable row level security;

create policy "Allow public proposal submissions"
on public.service_proposals
for insert
to anon
with check (accepted_fee_review = true);

create policy "Allow authenticated users to read proposals"
on public.service_proposals
for select
to authenticated
using (true);
