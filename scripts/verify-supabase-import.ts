/**
 * Verify Supabase import: fetch schools and compare to expected count.
 * Run from MedIndex root: npx tsx scripts/verify-supabase-import.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const EXPECTED_COUNT = 20; // from scraped_schools_cyberscraper_cleaned.csv

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('Fetching schools from Supabase...\n');

  const { data: schools, error } = await supabase
    .from('schools')
    .select('id, name, type, location, link')
    .order('name');

  if (error) {
    console.error('Error fetching schools:', error.message);
    process.exit(1);
  }

  const count = schools?.length ?? 0;
  const ok = count === EXPECTED_COUNT;

  console.log('--- Import verification ---');
  console.log(`Expected count (cleaned CSV): ${EXPECTED_COUNT}`);
  console.log(`Actual count in Supabase:     ${count}`);
  console.log(ok ? '✅ Count matches.\n' : '⚠️  Count mismatch.\n');

  if (count === 0) {
    console.log('No schools found. Run the import script first.');
    return;
  }

  console.log('Schools in database:');
  schools!.forEach((s, i) => {
    const missing: string[] = [];
    if (!s.name) missing.push('name');
    if (!s.type) missing.push('type');
    if (!s.location) missing.push('location');
    const flag = missing.length ? ` ⚠️ missing: ${missing.join(', ')}` : '';
    console.log(`  ${i + 1}. ${s.name} (${s.type}) — ${s.location}${flag}`);
  });

  const missingRequired = schools!.filter((s) => !s.name || !s.type || !s.location);
  if (missingRequired.length > 0) {
    console.log(`\n⚠️  ${missingRequired.length} row(s) missing required fields (name, type, or location).`);
  } else {
    console.log('\n✅ All rows have required fields (name, type, location).');
  }
}

verify();
