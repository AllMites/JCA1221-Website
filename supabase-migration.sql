-- ═══ Run this in Supabase SQL Editor ═══
-- Create contact submissions table

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT NOT NULL,
  message TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  project_type TEXT,
  estimated_timeline TEXT,
  source_ip_hash TEXT,
  user_agent TEXT,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Index for rate limiting queries (by IP hash)
CREATE INDEX idx_submissions_ip_time ON submissions (source_ip_hash, created_at);

-- Index for admin listing (newest first)
CREATE INDEX idx_submissions_created ON submissions (created_at DESC);

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- No public access — service_role key used server-side only
-- (Rows are never fetched from the browser directly)

-- Optional: add admin_actions audit log
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('viewed', 'acknowledged', 'deleted', 'undeleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_actions_submission ON admin_actions (submission_id, created_at DESC);
