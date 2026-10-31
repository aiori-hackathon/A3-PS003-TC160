-- Supabase SQL: Create the pinned_runs table
-- Run this in your Supabase SQL Editor (https://app.supabase.com → SQL Editor)

CREATE TABLE IF NOT EXISTS pinned_runs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  timestamp TEXT,
  config JSONB,
  actual_test_mae DOUBLE PRECISION,
  actual_test_rmse DOUBLE PRECISION,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE pinned_runs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all pinned runs
CREATE POLICY "Allow authenticated read" ON pinned_runs
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update their own runs
CREATE POLICY "Allow authenticated insert" ON pinned_runs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON pinned_runs
  FOR UPDATE TO authenticated USING (true);

-- Allow anonymous users to read (for demo/fallback mode)
CREATE POLICY "Allow anon read" ON pinned_runs
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert" ON pinned_runs
  FOR INSERT TO anon WITH CHECK (true);
