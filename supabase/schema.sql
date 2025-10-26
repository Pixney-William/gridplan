-- Create drawings table
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/editor

CREATE TABLE IF NOT EXISTS drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_sqm NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_drawings_created_at ON drawings(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (no auth required)
-- WARNING: This allows anyone to read/write/delete.
-- In production, you should implement proper authentication and policies.
CREATE POLICY "Allow all operations on drawings"
  ON drawings
  FOR ALL
  USING (true)
  WITH CHECK (true);
