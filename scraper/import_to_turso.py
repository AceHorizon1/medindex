"""
Import scraped medical school CSV data into Turso (LibSQL)
Run this after scraping: python import_to_turso.py
"""
import os
import sys
import csv
import json
import uuid
import libsql_client
from dotenv import load_dotenv

# Load local environment files if present
from pathlib import Path
script_dir = Path(__file__).parent
load_dotenv(script_dir / '.env')
load_dotenv(script_dir.parent / '.env.local')

TURSO_URL = os.getenv('TURSO_DATABASE_URL')
TURSO_TOKEN = os.getenv('TURSO_AUTH_TOKEN')

if not TURSO_URL or not TURSO_TOKEN:
    raise ValueError("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment.")

client = libsql_client.create_client_sync(url=TURSO_URL, auth_token=TURSO_TOKEN)

def parse_int(val):
    if not val:
        return None
    try:
        clean = str(val).replace('$', '').replace(',', '').strip()
        return int(float(clean))
    except (ValueError, TypeError):
        return None

def parse_float(val):
    if not val:
        return None
    try:
        clean = str(val).replace(',', '').strip()
        return float(clean)
    except (ValueError, TypeError):
        return None

def import_csv(file_path="scraped_schools_cyberscraper.csv"):
    target_path = Path(file_path)
    if not target_path.is_absolute():
        target_path = script_dir / file_path

    if not target_path.exists():
        print(f"Warning: File {target_path} not found. Skipping import.")
        return 0

    print(f"Reading {target_path}...")
    count = 0
    with open(target_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('name', '').strip()
            if not name:
                continue

            school_id = str(uuid.uuid4())
            school_type = row.get('type', 'MD').strip().upper()
            if school_type not in ('MD', 'DO'):
                school_type = 'MD'

            location = row.get('location', '').strip()
            tuition = parse_int(row.get('tuition'))
            avg_gpa = parse_float(row.get('avg_gpa'))
            avg_mcat = parse_int(row.get('avg_mcat'))
            mission = row.get('mission', '').strip()
            link = row.get('link', '').strip()

            courses = row.get('required_courses', '')
            if courses:
                if isinstance(courses, list):
                    courses_list = courses
                else:
                    courses_list = [c.strip() for c in courses.replace(';', ',').split(',') if c.strip()]
                required_courses = json.dumps(courses_list)
            else:
                required_courses = json.dumps([])

            deadlines_raw = row.get('deadlines')
            if isinstance(deadlines_raw, dict):
                deadlines = json.dumps(deadlines_raw)
            elif isinstance(deadlines_raw, str) and deadlines_raw.startswith('{'):
                deadlines = deadlines_raw
            else:
                deadlines = json.dumps({})

            client.execute(
                """
                INSERT INTO schools (
                    id, name, type, location, tuition, avg_gpa, avg_mcat,
                    required_courses, mission, deadlines, link, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(name) DO UPDATE SET
                    type=excluded.type,
                    location=excluded.location,
                    tuition=coalesce(excluded.tuition, schools.tuition),
                    avg_gpa=coalesce(excluded.avg_gpa, schools.avg_gpa),
                    avg_mcat=coalesce(excluded.avg_mcat, schools.avg_mcat),
                    required_courses=coalesce(excluded.required_courses, schools.required_courses),
                    mission=coalesce(excluded.mission, schools.mission),
                    deadlines=coalesce(excluded.deadlines, schools.deadlines),
                    link=coalesce(excluded.link, schools.link),
                    updated_at=CURRENT_TIMESTAMP
                """,
                [school_id, name, school_type, location, tuition, avg_gpa, avg_mcat, required_courses, mission, deadlines, link]
            )
            count += 1

    print(f"Successfully upserted {count} schools into Turso!")
    return count

if __name__ == '__main__':
    target_file = sys.argv[1] if len(sys.argv) > 1 else "scraped_schools_cyberscraper.csv"
    import_csv(target_file)
