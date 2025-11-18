"""
Script to import scraped CSV data into Supabase
Run this after scraping: python import_to_supabase.py
"""
import csv
import json
import os
from supabase import create_client, Client

# Load environment variables
from dotenv import load_dotenv
load_dotenv('../.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env.local")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def parse_value(value, field_type):
    """Parse CSV value based on field type"""
    if not value or value == '':
        return None
    
    if field_type == 'int':
        try:
            return int(value)
        except:
            return None
    elif field_type == 'float':
        try:
            return float(value)
        except:
            return None
    elif field_type == 'list':
        try:
            return json.loads(value) if value else []
        except:
            return []
    elif field_type == 'dict':
        try:
            return json.loads(value) if value else None
        except:
            return None
    return value.strip() if value else None


def import_csv_to_supabase(csv_file='medical_schools.csv'):
    """Import CSV data into Supabase schools table"""
    
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found. Run the scraper first.")
        return
    
    schools_imported = 0
    schools_skipped = 0
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            # Prepare data for Supabase
            school_data = {
                'name': parse_value(row.get('name'), 'str'),
                'type': parse_value(row.get('type'), 'str'),
                'location': parse_value(row.get('location'), 'str'),
                'tuition': parse_value(row.get('tuition'), 'int'),
                'avg_gpa': parse_value(row.get('avg_gpa'), 'float'),
                'avg_mcat': parse_value(row.get('avg_mcat'), 'int'),
                'required_courses': parse_value(row.get('required_courses'), 'list'),
                'mission': parse_value(row.get('mission'), 'str'),
                'deadlines': parse_value(row.get('deadlines'), 'dict'),
                'link': parse_value(row.get('link') or row.get('website'), 'str'),
            }
            
            # Skip if missing required fields
            if not school_data['name'] or not school_data['type'] or not school_data['location']:
                print(f"Skipping {row.get('name', 'Unknown')}: Missing required fields")
                schools_skipped += 1
                continue
            
            try:
                # Upsert (insert or update if exists)
                result = supabase.table('schools').upsert(
                    school_data,
                    on_conflict='name'
                ).execute()
                
                print(f"✓ Imported: {school_data['name']}")
                schools_imported += 1
                
            except Exception as e:
                print(f"✗ Error importing {school_data['name']}: {e}")
                schools_skipped += 1
    
    print(f"\n✅ Import complete!")
    print(f"   Imported: {schools_imported}")
    print(f"   Skipped: {schools_skipped}")


if __name__ == '__main__':
    import_csv_to_supabase()

