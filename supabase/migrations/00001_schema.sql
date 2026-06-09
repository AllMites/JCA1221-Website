-- ── Extensions ──
create extension if not exists "uuid-ossp";

-- ── Enums ──
create type project_status as enum ('operational', 'development', 'planning');
create type partner_type as enum ('LGU', 'national_agency', 'private_sector', 'community', 'regulatory');
create type news_category as enum ('awards', 'projects', 'policy', 'expansion', 'media');
create type news_type as enum ('media-coverage', 'award', 'feature');
create type widget_type as enum ('process_flow', 'comparison_table', 'video_carousel', 'monitoring');
create type audit_action as enum ('create', 'update', 'delete');
create type user_role as enum ('admin', 'editor');

-- ── Profiles (extends auth.users) ──
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role user_role not null default 'editor',
  created_at timestamptz not null default now()
);

-- ── Projects ──
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  location text not null,
  status project_status not null default 'planning',
  hero_image text,
  hero_description text not null default '',
  short_description text not null default '',
  description text,
  stats jsonb not null default '[]',
  technology jsonb default '{"description":"","tags":[]}',
  impact_metrics jsonb not null default '[]',
  year_started int,
  year_completed int,
  gallery_images text[] not null default '{}',
  "order" int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Project Awards ──
create table project_awards (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  organization text not null,
  year int not null,
  description text not null default ''
);

-- ── News Articles ──
create table news_articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  source text not null,
  date date not null,
  excerpt text not null default '',
  url text not null default '',
  category news_category not null default 'media',
  tags text[] not null default '{}',
  type news_type not null default 'media-coverage',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Team Members ──
create table team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  credentials text,
  photo text,
  bio text not null default '',
  quote text,
  expertise text[] not null default '{}',
  links jsonb not null default '[]',
  "order" int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── CSR Projects ──
create table csr_projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  category text not null default '',
  description text not null default '',
  story text,
  location text not null default '',
  hero_image text,
  stats jsonb not null default '[]',
  timeline jsonb not null default '[]',
  sdg_tags text[] not null default '{}',
  gallery text[] not null default '{}',
  linked_project_id uuid references projects(id) on delete set null,
  "order" int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Partners ──
create table partners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type partner_type not null default 'LGU',
  logo text,
  website_url text,
  project_ids uuid[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Tech Widgets ──
create table tech_widgets (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  widget_type widget_type not null,
  config jsonb not null default '{}',
  "order" int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Page Content ──
create table page_content (
  id uuid primary key default uuid_generate_v4(),
  page text not null,
  section text not null,
  key text not null,
  value jsonb not null default 'null',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(page, section, key)
);

-- ── Audit Log ──
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  table_name text not null,
  record_id uuid not null,
  action audit_action not null,
  changes jsonb not null default '{}',
  "timestamp" timestamptz not null default now()
);

-- ── Indexes ──
create index idx_projects_slug on projects(slug);
create index idx_projects_published on projects(published);
create index idx_news_published on news_articles(published);
create index idx_news_category on news_articles(category);
create index idx_team_published on team_members(published);
create index idx_csr_published on csr_projects(published);
create index idx_csr_slug on csr_projects(slug);
create index idx_partners_published on partners(published);
create index idx_tech_widgets_project on tech_widgets(project_id);
create index idx_page_content_lookup on page_content(page, section);
create index idx_audit_log_table on audit_log(table_name);
create index idx_audit_log_user on audit_log(user_id);

-- ── Storage Buckets ──
-- Run these via Supabase dashboard SQL editor, or they're created via API:
-- insert into storage.buckets (id, name, public) values ('team', 'team', true);
-- insert into storage.buckets (id, name, public) values ('projects', 'projects', true);
-- insert into storage.buckets (id, name, public) values ('partners', 'partners', true);
-- insert into storage.buckets (id, name, public) values ('csr', 'csr', true);
-- insert into storage.buckets (id, name, public) values ('general', 'general', true);
