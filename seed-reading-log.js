// Run this script to create the reading_log table and seed sample data
// Usage: node seed-reading-log.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleBooks = [
  {
    title: 'Zero to One',
    author: 'Peter Thiel',
    date_read: '2024-01-15',
    rating: 5,
    status: 'completed',
    notes: 'Essential reading for founders. The contrarian thinking framework changed how I evaluate opportunities.',
    is_visible: true,
    display_order: 0,
  },
  {
    title: 'The Hard Thing About Hard Things',
    author: 'Ben Horowitz',
    date_read: '2024-02-20',
    rating: 5,
    status: 'completed',
    notes: 'Raw, honest advice about the struggles of building a company.',
    is_visible: true,
    display_order: 1,
  },
  {
    title: 'Shoe Dog',
    author: 'Phil Knight',
    date_read: '2024-03-10',
    rating: 4,
    status: 'completed',
    notes: "Inspiring story of Nike's founding. Great lessons on persistence.",
    is_visible: true,
    display_order: 2,
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    date_read: null,
    rating: 4,
    status: 'reading',
    notes: 'Currently applying these principles to EvolveX.',
    is_visible: true,
    display_order: 3,
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    date_read: null,
    rating: 5,
    status: 'want_to_read',
    notes: null,
    is_visible: true,
    display_order: 4,
  },
];

async function seedReadingLog() {
  console.log('Seeding reading_log table...');

  // First, try to insert - if table doesn't exist, it will fail
  const { data, error } = await supabase
    .from('reading_log')
    .upsert(sampleBooks, { onConflict: 'title' })
    .select();

  if (error) {
    console.error('Error seeding reading_log:', error.message);
    console.log('\n⚠️  The reading_log table may not exist yet.');
    console.log('Please run this SQL in your Supabase SQL Editor:\n');
    console.log(`
CREATE TABLE IF NOT EXISTS reading_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
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

-- Enable RLS
ALTER TABLE reading_log ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Public read" ON reading_log FOR SELECT USING (true);

-- Allow all operations (for admin)
CREATE POLICY "Allow all" ON reading_log FOR ALL USING (true);
    `);
    return;
  }

  console.log(`✅ Successfully seeded ${data.length} books!`);
  data.forEach((book) => {
    console.log(`   - ${book.title} by ${book.author}`);
  });
}

seedReadingLog();
