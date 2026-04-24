-- Market Analyses: stores each portfolio market review
create table if not exists public.market_analyses (
  id uuid default gen_random_uuid() primary key,
  org_id uuid not null references public.orgs(id),
  user_id uuid not null references auth.users(id),
  analysis_type text not null default 'portfolio_review'
    check (analysis_type in ('portfolio_review', 'market_update', 'rebalancing')),
  market_region text not null default 'Northeast Florida',
  portfolio_snapshot jsonb not null,
  market_conditions jsonb not null,
  recommendations jsonb not null,
  outlook_summary text not null,
  outlook_horizon text not null default '12-month',
  allocation_context jsonb,
  ai_model text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Knowledge Base: accumulated structured insights (the "second brain")
create table if not exists public.knowledge_entries (
  id uuid default gen_random_uuid() primary key,
  org_id uuid not null references public.orgs(id),
  category text not null
    check (category in ('market_data', 'property_insight', 'portfolio_strategy', 'economic_indicator', 'asset_allocation', 'risk_assessment')),
  asset_class text not null default 'real_estate'
    check (asset_class in ('real_estate', 'equities', 'fixed_income', 'commodities', 'digital_assets', 'private_equity', 'cash', 'mixed')),
  title text not null,
  content text not null,
  tags text[] default '{}',
  property_id uuid references public.properties(id) on delete set null,
  market_analysis_id uuid references public.market_analyses(id) on delete set null,
  source text not null default 'market_analysis',
  confidence text not null default 'medium'
    check (confidence in ('high', 'medium', 'low')),
  valid_from date not null default current_date,
  valid_until date,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_market_analyses_org on public.market_analyses(org_id);
create index idx_market_analyses_created on public.market_analyses(created_at desc);
create index idx_knowledge_entries_org on public.knowledge_entries(org_id);
create index idx_knowledge_entries_category on public.knowledge_entries(category);
create index idx_knowledge_entries_asset_class on public.knowledge_entries(asset_class);
create index idx_knowledge_entries_tags on public.knowledge_entries using gin(tags);
create index idx_knowledge_entries_property on public.knowledge_entries(property_id) where property_id is not null;
create index idx_knowledge_entries_valid on public.knowledge_entries(valid_from, valid_until);

-- RLS
alter table public.market_analyses enable row level security;
alter table public.knowledge_entries enable row level security;

-- Market analyses: org members can read, admins can write
create policy "market_analyses_select" on public.market_analyses
  for select using (
    org_id in (
      select org_id from public.user_org_roles where user_id = auth.uid()
    )
  );

create policy "market_analyses_insert" on public.market_analyses
  for insert with check (
    org_id in (
      select org_id from public.user_org_roles
      where user_id = auth.uid()
        and role in ('family_office_admin', 'org_admin')
    )
  );

create policy "market_analyses_delete" on public.market_analyses
  for delete using (
    org_id in (
      select org_id from public.user_org_roles
      where user_id = auth.uid()
        and role in ('family_office_admin', 'org_admin')
    )
  );

-- Knowledge entries: org members can read, admins can write
create policy "knowledge_entries_select" on public.knowledge_entries
  for select using (
    org_id in (
      select org_id from public.user_org_roles where user_id = auth.uid()
    )
  );

create policy "knowledge_entries_insert" on public.knowledge_entries
  for insert with check (
    org_id in (
      select org_id from public.user_org_roles
      where user_id = auth.uid()
        and role in ('family_office_admin', 'org_admin')
    )
  );

create policy "knowledge_entries_update" on public.knowledge_entries
  for update using (
    org_id in (
      select org_id from public.user_org_roles
      where user_id = auth.uid()
        and role in ('family_office_admin', 'org_admin')
    )
  );

create policy "knowledge_entries_delete" on public.knowledge_entries
  for delete using (
    org_id in (
      select org_id from public.user_org_roles
      where user_id = auth.uid()
        and role in ('family_office_admin', 'org_admin')
    )
  );
