-- ── Profiles trigger: auto-create profile on auth signup ──
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'editor'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Audit trigger helper ──
create or replace function audit_trigger_func()
returns trigger as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  insert into audit_log (user_id, table_name, record_id, action, changes)
  values (
    v_user_id,
    tg_table_name,
    case tg_op
      when 'DELETE' then old.id
      else new.id
    end,
    lower(tg_op)::audit_action,
    case
      when tg_op = 'INSERT' then jsonb_build_object('old', null, 'new', row_to_json(new)::jsonb)
      when tg_op = 'DELETE' then jsonb_build_object('old', row_to_json(old)::jsonb, 'new', null)
      else jsonb_build_object('old', row_to_json(old)::jsonb, 'new', row_to_json(new)::jsonb)
    end
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- ── Enable RLS on all content tables ──
alter table projects enable row level security;
alter table project_awards enable row level security;
alter table news_articles enable row level security;
alter table team_members enable row level security;
alter table csr_projects enable row level security;
alter table partners enable row level security;
alter table tech_widgets enable row level security;
alter table page_content enable row level security;
alter table profiles enable row level security;
alter table audit_log enable row level security;

-- ── Helper function: check user role ──
create or replace function user_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- ── Public SELECT policies (published=true only) ──
create policy "Public can read published projects" on projects for select using (published = true);
create policy "Public can read published awards" on project_awards for select using (
  exists (select 1 from projects where id = project_awards.project_id and published = true)
);
create policy "Public can read published news" on news_articles for select using (published = true);
create policy "Public can read published team" on team_members for select using (published = true);
create policy "Public can read published csr" on csr_projects for select using (published = true);
create policy "Public can read published partners" on partners for select using (published = true);
create policy "Public can read published tech widgets" on tech_widgets for select using (published = true);
create policy "Public can read published page content" on page_content for select using (published = true);

-- ── Editor policies (CRUD on content tables) ──
create policy "Editor CRUD projects" on projects for all using (user_role() in ('editor','admin')) with check (user_role() in ('editor','admin'));
create policy "Editor CRUD awards" on project_awards for all using (user_role() in ('editor','admin')) with check (user_role() in ('editor','admin'));
create policy "Editor CRUD news" on news_articles for all using (user_role() in ('editor','admin')) with check (user_role() in ('editor','admin'));
create policy "Editor CRUD team" on team_members for all using (user_role() in ('editor','admin')) with check (user_role() in ('editor','admin'));
create policy "Editor CRUD csr" on csr_projects for all using (user_role() in ('editor','admin')) with check (user_role() in ('editor','admin'));
create policy "Editor CRUD partners" on partners for all using (user_role() in ('editor','admin')) with check (user_role() in ('editor','admin'));
create policy "Editor CRUD tech widgets" on tech_widgets for all using (user_role() in ('editor','admin')) with check (user_role() in ('editor','admin'));
create policy "Editor CRUD page content" on page_content for all using (user_role() in ('editor','admin')) with check (user_role() in ('editor','admin'));

-- ── Admin-only policies ──
create policy "Admin manage profiles" on profiles for all using (user_role() = 'admin') with check (user_role() = 'admin');
create policy "Admin read audit log" on audit_log for select using (user_role() = 'admin');

-- ── Profiles: users can read their own profile ──
create policy "Users read own profile" on profiles for select using (id = auth.uid());

-- ── Storage policies ──
-- Public read on all buckets
-- Auth write on storage buckets for editor+ roles
-- Apply per bucket via Supabase dashboard or SQL:
-- create policy "Public read team images" on storage.objects for select using (bucket_id = 'team');
-- create policy "Auth upload team images" on storage.objects for insert with check (bucket_id = 'team' and user_role() in ('editor','admin'));
-- create policy "Auth update team images" on storage.objects for update using (bucket_id = 'team' and user_role() in ('editor','admin'));
-- create policy "Auth delete team images" on storage.objects for delete using (bucket_id = 'team' and user_role() in ('editor','admin'));
