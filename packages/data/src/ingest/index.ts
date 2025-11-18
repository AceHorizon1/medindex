import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '@medindex/config';
import { prisma } from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runScrapy() {
  if (!env.SCRAPY_PROJECT_ROOT) {
    console.warn('Set SCRAPY_PROJECT_ROOT to run official Scrapy spiders. Skipping.');
    return [];
  }

  const crawlCmd = `cd ${env.SCRAPY_PROJECT_ROOT} && poetry run scrapy crawl med_schools -O schools.json`;
  execSync(crawlCmd, { stdio: 'inherit', shell: '/bin/bash' });
  const scrapedPath = path.join(env.SCRAPY_PROJECT_ROOT, 'schools.json');
  const records = (await import(scrapedPath, { assert: { type: 'json' } })).default as Array<
    Record<string, unknown>
  >;
  return records;
}

async function main() {
  const scraped = await runScrapy();
  for (const record of scraped) {
    const name = String(record.name ?? record.school ?? '');
    if (!name) continue;
    await prisma.medicalSchool.upsert({
      where: { name },
      update: {
        city: String(record.city ?? 'Unknown'),
        state: String(record.state ?? 'NA'),
        designation: (record.designation as 'MD' | 'DO') ?? 'MD',
        mission: (record.mission as string) ?? undefined
      },
      create: {
        name,
        city: String(record.city ?? 'Unknown'),
        state: String(record.state ?? 'NA'),
        designation: (record.designation as 'MD' | 'DO') ?? 'MD'
      }
    });
  }

  console.log(`Ingested ${scraped.length} records`);
}

main().finally(() => prisma.$disconnect());
