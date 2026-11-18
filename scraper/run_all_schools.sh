#!/usr/bin/env bash
# Run the MedIndex scraper on all schools (OpenRouter free model)
# Run this in your terminal: ./run_all_schools.sh

set -e
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
    echo "Creating venv and installing deps..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -q -r requirements_cyberscraper.txt
    pip install -q playwright
    python -m playwright install chromium
else
    source venv/bin/activate
fi

if [ ! -f ".env" ] || ! grep -q OPENROUTER_API_KEY .env; then
    echo "Add OPENROUTER_API_KEY to .env in this directory"
    exit 1
fi

echo "Scraping all schools (OpenRouter free model)..."
echo "This may take 1–1.5 hours for ~30 schools."
python cyberscraper_scraper.py --openrouter --model liquid/lfm-3-1.7b:free --delay 2.0

echo ""
echo "Output: scraped_schools_cyberscraper.csv"
