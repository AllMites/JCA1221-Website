-- Add title and description columns to tech_widgets
alter table tech_widgets add column if not exists title text;
alter table tech_widgets add column if not exists description text;
