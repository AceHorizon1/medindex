import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getSchools } from '../lib/turso/queries';

async function main() {
  console.log('Testing Turso queries...');
  const allSchools = await getSchools();
  console.log(`Found ${allSchools.length} schools in Turso.`);

  const mdSchools = await getSchools({ type: 'MD', minGpa: 3.9 });
  console.log(`Found ${mdSchools.length} MD schools with GPA >= 3.9:`);
  for (const s of mdSchools) {
    console.log(` - ${s.name} (${s.location}) | GPA: ${s.avg_gpa} | MCAT: ${s.avg_mcat}`);
  }
}

main().catch(console.error);
