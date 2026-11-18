-- MedIndex Database Schema for Turso (LibSQL / SQLite)
-- Run this in your Turso CLI (turso db shell <db-name>) or Turso Web Console

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MD', 'DO')),
  location TEXT NOT NULL,
  tuition INTEGER,
  avg_gpa REAL,
  avg_mcat INTEGER,
  required_courses TEXT, -- JSON array e.g. '["Biology", "Chemistry"]'
  mission TEXT,
  deadlines TEXT,        -- JSON object e.g. '{"primary": "Oct 15"}'
  link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, school_id)
);

-- Indices for fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(type);
CREATE INDEX IF NOT EXISTS idx_schools_avg_gpa ON schools(avg_gpa);
CREATE INDEX IF NOT EXISTS idx_schools_avg_mcat ON schools(avg_mcat);
