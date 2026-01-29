#!/usr/bin/env bash
# Import scraped schools into Supabase
# Run from MedIndex/scraper with: ./import_to_supabase.sh
# Requires: MedIndex/.env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)

set -e
cd "$(dirname "$0")"

# Use cleaned CSV if present, else cyberscraper output
CSV="scraped_schools_cyberscraper_cleaned.csv"
if [ ! -f "$CSV" ]; then
  CSV="scraped_schools_cyberscraper.csv"
fi
if [ ! -f "$CSV" ]; then
  echo "No CSV found. Run the scraper first."
  exit 1
fi

if [ ! -f "../.env.local" ]; then
  echo "Missing MedIndex/.env.local. Add Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY)."
  exit 1
fi

source venv/bin/activate 2>/dev/null || true
python import_to_supabase.py "$CSV"
