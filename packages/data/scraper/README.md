# Scrapy Integration

We rely on the official [Scrapy](https://github.com/scrapy/scrapy) project for collecting canonical school facts when public CSV feeds are incomplete.

## Bootstrapping
1. Install Python 3.11+, Poetry, and the upstream Scrapy repo: `git clone https://github.com/scrapy/scrapy.git`.
2. Copy `packages/data/scraper/spiders/med_schools.py` into the Scrapy repo and register it in `settings.py`.
3. Expose the checkout path via `SCRAPY_PROJECT_ROOT` so `pnpm --filter @medindex/data ingest` can shell out and save `schools.json`.

This keeps the Node.js ingestion pipeline lean while reusing the battle-tested Scrapy crawler/runtime.
