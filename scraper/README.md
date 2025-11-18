# MedIndex Scraper

Scrapy project for scraping medical school data and exporting to CSV/JSON.

## Setup

1. **Install Scrapy**:
   ```bash
   cd scraper
   pip install -r requirements.txt
   # Or
   pip install scrapy itemadapter
   ```

2. **Run the spider**:
   ```bash
   scrapy crawl med_schools -o medical_schools.csv
   # Or for JSON
   scrapy crawl med_schools -o medical_schools.json
   ```

## Spiders

- **med_schools**: Main spider for scraping medical school data
- **aamc_msar**: Alternative spider for AAMC data (may require authentication)
- **manual_sources**: Template for custom data sources

## Output

The scraper will create:
- `medical_schools.csv` - CSV file with all scraped data
- `medical_schools.json` - JSON file with all scraped data

## Customization

**Important**: The selectors in `med_schools.py` are templates. You'll need to:

1. Inspect the actual HTML of target websites
2. Update CSS selectors to match the real page structure
3. Adjust data extraction logic based on how data is presented

### Example: Scraping a specific website

1. Open the website in your browser
2. Right-click → Inspect Element
3. Find the HTML structure for school data
4. Update selectors in `parse_school()` method

### Example selectors:

```python
# If school name is in an <h1> tag
item['name'] = response.css('h1::text').get()

# If location is in a div with class "location"
item['location'] = response.css('div.location::text').get()

# If there's a table with stats
item['avg_gpa'] = response.css('table tr:contains("GPA") td::text').get()
```

## Importing to Supabase

After scraping:

1. Review the CSV file
2. Clean any missing or incorrect data
3. Use the seed script or import directly to Supabase:

```python
# You can modify scripts/seed.ts to read from CSV instead
import csv
import json

with open('medical_schools.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Process and insert into Supabase
        pass
```

## Notes

- **Rate Limiting**: The scraper includes delays to be respectful
- **Robots.txt**: By default, respects robots.txt (set `ROBOTSTXT_OBEY = False` to ignore)
- **Authentication**: Some sites (like AAMC MSAR) may require login
- **Legal**: Always check website terms of service before scraping

## Alternative: Using Public APIs

Some organizations provide APIs:
- AAMC may have API access (requires registration)
- Consider using official data sources when available

