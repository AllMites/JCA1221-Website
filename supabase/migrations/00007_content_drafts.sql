-- ── content_drafts: generic draft storage for the in-page CMS ──
-- See docs/cms-inline-editor-plan.md §2. One row per (table_name, record_id)
-- in-progress edit; record_id is null for a not-yet-created row.
create table content_drafts (
  id            uuid primary key default gen_random_uuid(),
  -- Restricted to the actual CMS content tables so publish_draft's dynamic
  -- SQL (security definer, below) can never be pointed at an arbitrary
  -- table (e.g. profiles, audit_log) by a crafted draft row.
  table_name    text not null check (table_name in (
    'projects', 'project_awards', 'news_articles', 'team_members',
    'csr_projects', 'partners', 'tech_widgets', 'page_content'
  )),
  record_id     uuid,
  draft_data    jsonb not null,
  edited_by     uuid references profiles(id) not null,
  updated_at    timestamptz not null default now(),
  unique (table_name, record_id)
);

alter table content_drafts enable row level security;

-- ── Editor policy — same predicate pattern as 00002_rls_policies.sql ──
create policy "Editor CRUD content drafts" on content_drafts for all
  using (user_role() in ('editor', 'admin'))
  with check (user_role() in ('editor', 'admin'));

-- ── publish_draft: apply draft_data onto the real row, then delete the draft ──
-- Update when record_id is set, insert when null. Runs as one transaction
-- (a Postgres function body is already atomic) so there is no client-visible
-- "applied but draft not cleared" state.
create or replace function publish_draft(draft_id uuid)
returns void as $$
declare
  d content_drafts%rowtype;
  cols text;
  -- security definer bypasses RLS on the target table below, so this
  -- function must re-check the caller's role and the target table itself —
  -- without both guards an editor could draft {table_name: 'profiles',
  -- draft_data: {role: 'admin', ...}} and self-escalate on publish.
  allowed_tables text[] := array['projects', 'project_awards', 'news_articles',
    'team_members', 'csr_projects', 'partners', 'tech_widgets', 'page_content'];
begin
  if user_role() not in ('editor', 'admin') then
    raise exception 'insufficient privilege to publish drafts';
  end if;

  select * into d from content_drafts where id = draft_id;
  if not found then
    raise exception 'draft % not found', draft_id;
  end if;

  if not (d.table_name = any(allowed_tables)) then
    raise exception 'table % is not a publishable content table', d.table_name;
  end if;

  -- jsonb_populate_record casts each key against the target table's real
  -- column types, so this needs no manual type-guessing per field.
  select string_agg(quote_ident(key), ', ') into cols
  from jsonb_object_keys(d.draft_data) as key;

  if d.record_id is not null then
    execute format(
      'update %I set (%s) = (select %s from jsonb_populate_record(null::%I, $1)) where id = $2',
      d.table_name, cols, cols, d.table_name
    ) using d.draft_data, d.record_id;
  else
    execute format(
      'insert into %I select * from jsonb_populate_record(null::%I, $1)',
      d.table_name, d.table_name
    ) using d.draft_data;
  end if;

  delete from content_drafts where id = draft_id;
end;
$$ language plpgsql security definer;
