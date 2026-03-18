-- Literature DB Schema for Supabase
-- Run this in the Supabase SQL Editor to set up the database

-- Papers table
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT DEFAULT '',
  year INTEGER,
  abstract TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  doi TEXT DEFAULT '',
  url TEXT DEFAULT '',
  keywords TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  bibtex TEXT DEFAULT '',
  added_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster text search
CREATE INDEX idx_papers_title ON papers USING gin (to_tsvector('simple', title));
CREATE INDEX idx_papers_year ON papers (year);
CREATE INDEX idx_papers_keywords ON papers USING gin (keywords);
CREATE INDEX idx_papers_tags ON papers USING gin (tags);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER papers_updated_at
  BEFORE UPDATE ON papers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS)
-- For personal use: allow all operations with anon key
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON papers
  FOR ALL
  USING (true)
  WITH CHECK (true);
