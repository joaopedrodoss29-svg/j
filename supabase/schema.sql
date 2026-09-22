-- AD X-RAY · schema inicial (PostgreSQL / Supabase)
-- Regra de ouro: nenhuma coluna de métrica de campanha (CTR, CPC, CPA, ROAS)
-- é preenchida por inferência. Se o dado não veio de fonte oficial, fica NULL.

create extension if not exists pgcrypto;

create type finding_src as enum ('observed', 'inferred', 'suggested');

create table users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  created_at  timestamptz not null default now()
);

create table projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create table competitors (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name       text not null,
  page_url   text
);

create table ads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  project_id    uuid references projects(id) on delete set null,
  competitor_id uuid references competitors(id) on delete set null,
  url           text,
  name          text,
  product       text,
  niche         text,
  copy_text     text,
  data_source   text not null,
  created_at    timestamptz not null default now()
);

create table creatives (
  id           uuid primary key default gen_random_uuid(),
  ad_id        uuid not null references ads(id) on delete cascade,
  kind         text not null check (kind in ('image','video','print')),
  storage_path text not null,
  transcript   text
);

create table hooks (
  id       uuid primary key default gen_random_uuid(),
  ad_id    uuid not null references ads(id) on delete cascade,
  text     text not null,
  hook_type text,
  strength int check (strength between 0 and 100)
);

create table angles (
  id       uuid primary key default gen_random_uuid(),
  ad_id    uuid not null references ads(id) on delete cascade,
  name     text not null,
  tags     text[]
);

create table offers (
  id                        uuid primary key default gen_random_uuid(),
  ad_id                     uuid not null references ads(id) on delete cascade,
  sold                      text,
  main_benefit              text,
  promised_transformation   text,
  presentation              text
);

create table audiences (
  id          uuid primary key default gen_random_uuid(),
  ad_id       uuid not null references ads(id) on delete cascade,
  description text not null,
  src         finding_src not null default 'inferred'
);

create table ctas (
  id       uuid primary key default gen_random_uuid(),
  ad_id    uuid not null references ads(id) on delete cascade,
  action   text,
  text     text
);

create table analyses (
  id            uuid primary key default gen_random_uuid(),
  ad_id         uuid not null references ads(id) on delete cascade,
  heuristic_score int check (heuristic_score between 0 and 100),
  result        jsonb not null,
  data_notice   text,
  model         text,
  analyzed_at   timestamptz not null default now()
);

create table variations (
  id          uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  kind        text not null check (kind in ('hook','angle','copy','script','cta')),
  payload     jsonb not null,
  src         finding_src not null default 'suggested'
);

create index on ads (user_id, created_at desc);
create index on ads (user_id, niche);
create index on analyses (ad_id);
create index on variations (analysis_id, kind);

alter table ads enable row level security;
alter table projects enable row level security;
alter table competitors enable row level security;
alter table creatives enable row level security;
alter table hooks enable row level security;
alter table angles enable row level security;
alter table offers enable row level security;
alter table audiences enable row level security;
alter table ctas enable row level security;
alter table analyses enable row level security;
alter table variations enable row level security;

create policy ads_owner on ads
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy projects_owner on projects
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy competitors_owner on competitors
  for all using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  )
  with check (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

create policy creatives_owner on creatives
  for all using (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  )
  with check (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  );

create policy hooks_owner on hooks
  for all using (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  )
  with check (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  );

create policy angles_owner on angles
  for all using (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  )
  with check (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  );

create policy offers_owner on offers
  for all using (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  )
  with check (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  );

create policy audiences_owner on audiences
  for all using (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  )
  with check (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  );

create policy ctas_owner on ctas
  for all using (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  )
  with check (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  );

create policy analyses_owner on analyses
  for all using (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  )
  with check (
    ad_id in (
      select id from ads where user_id = auth.uid()
    )
  );

create policy variations_owner on variations
  for all using (
    analysis_id in (
      select id from analyses a
      join ads ad on ad.id = a.ad_id
      where ad.user_id = auth.uid()
    )
  )
  with check (
    analysis_id in (
      select id from analyses a
      join ads ad on ad.id = a.ad_id
      where ad.user_id = auth.uid()
    )
  );
