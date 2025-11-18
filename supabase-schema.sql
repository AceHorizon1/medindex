-- MedIndex Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MD', 'DO')),
  location TEXT NOT NULL,
  tuition INTEGER,
  avg_gpa NUMERIC(3,2),
  avg_mcat INTEGER,
  required_courses TEXT[],
  mission TEXT,
  deadlines JSONB,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

-- Enable Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies for schools (public read, authenticated write)
CREATE POLICY "Schools are viewable by everyone" ON schools
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert schools" ON schools
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update schools" ON schools
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(type);
CREATE INDEX IF NOT EXISTS idx_schools_location ON schools(location);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_school_id ON favorites(school_id);

