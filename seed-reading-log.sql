-- Create reading_log table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS reading_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  date_read DATE,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'completed' CHECK (status IN ('reading', 'completed', 'want_to_read')),
  notes TEXT,
  cover_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reading_log ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (visible books only)
CREATE POLICY "Public can view visible books" ON reading_log
  FOR SELECT USING (is_visible = true);

-- Create policy for authenticated users to manage all books
CREATE POLICY "Authenticated users can manage books" ON reading_log
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX idx_reading_log_status ON reading_log(status);
CREATE INDEX idx_reading_log_date ON reading_log(date_read DESC);

-- Sample data (optional)
INSERT INTO reading_log (title, author, date_read, rating, status, notes, is_visible) VALUES
  ('Zero to One', 'Peter Thiel', '2024-01-15', 5, 'completed', 'Essential reading for founders. The contrarian thinking framework changed how I evaluate opportunities.', true),
  ('The Hard Thing About Hard Things', 'Ben Horowitz', '2024-02-20', 5, 'completed', 'Raw, honest advice about the struggles of building a company.', true),
  ('Shoe Dog', 'Phil Knight', '2024-03-10', 4, 'completed', 'Inspiring story of Nike''s founding. Great lessons on persistence.', true),
  ('The Lean Startup', 'Eric Ries', NULL, 4, 'reading', 'Currently applying these principles to EvolveX.', true),
  ('Thinking, Fast and Slow', 'Daniel Kahneman', NULL, 0, 'want_to_read', NULL, true);
