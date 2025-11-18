# Scraping Medical School Websites Guide

## Step 1: Prepare Your CSV File

Create a CSV file named `school_urls.csv` in the `scraper` directory with the following format:

```csv
name,website,type,location,city,state
Harvard Medical School,https://hms.harvard.edu,MD,Boston MA,Boston,MA
Johns Hopkins School of Medicine,https://www.hopkinsmedicine.org/som,MD,Baltimore MD,Baltimore,MD
```

**Required columns:**
- `name` - School name (optional, will be extracted if missing)
- `website` or `url` or `link` - The school's website URL
- `type` - MD or DO (optional, will be detected if missing)
- `location` - Full location string (optional)
- `city` - City name (optional)
- `state` - State abbreviation (optional)

**Minimum required:** Just the `website` column - the scraper will try to extract everything else!

## Step 2: Place Your CSV File

Put your CSV file in the `scraper` directory:
```
scraper/
  ├── school_urls.csv  ← Your file here
  ├── scraper/
  └── ...
```

## Step 3: Run the Scraper

```bash
cd scraper
scrapy crawl school_websites -o scraped_schools.csv
```

Or specify a custom CSV file:
```bash
scrapy crawl school_websites -a csv_file=my_schools.csv -o scraped_schools.csv
```

## Step 4: Review the Results

The scraper will create `scraped_schools.csv` with all extracted data. Review it and:
- Check for missing data
- Verify accuracy
- Manually fix any incorrect extractions

## Step 5: Import to Supabase

```bash
# First, copy the scraped CSV to the scraper directory
cp scraped_schools.csv medical_schools.csv

# Then import
python import_to_supabase.py
```

## How the Scraper Works

The scraper:
1. Reads URLs from your CSV file
2. Visits each school's website
3. Uses flexible extraction to find:
   - School name (from title, headers, etc.)
   - Location (from address fields)
   - Mission statement
   - Tuition (searches for dollar amounts)
   - GPA/MCAT (searches for numbers)
   - Required courses (searches for common course names)
   - Deadlines (searches for date patterns)
   - Class size and acceptance rate

## Limitations

Since each school's website is different:
- **Not all data will be found** - Some schools may not publish certain stats
- **Extraction may not be perfect** - Review and manually correct as needed
- **Some sites may block scrapers** - You may need to adjust settings

## Improving Results

If extraction isn't working well for specific schools:

1. **Inspect the website** - Open the school's website in a browser
2. **Find the data** - Locate where the information is displayed
3. **Update the spider** - Modify `school_websites.py` with better selectors

Example: If a school has tuition in a specific div:
```python
# In _extract_tuition method, add:
tuition = response.css('div.tuition-info::text').get()
if tuition:
    # parse and return
```

## Rate Limiting

The scraper is configured to:
- Wait 2 seconds between requests (respectful)
- Process one school at a time
- Respect robots.txt

For 200+ schools, this will take about 7-10 minutes.

## Troubleshooting

**"CSV file not found"**
- Make sure `school_urls.csv` is in the `scraper` directory
- Check the filename matches exactly

**"No data extracted"**
- The website structure may be different
- Check if the site requires JavaScript (Scrapy doesn't run JS)
- Try visiting the URL manually to see if it loads

**"Connection errors"**
- Some sites may block scrapers
- Try increasing DOWNLOAD_DELAY in settings
- Check your internet connection

## Next Steps

After scraping:
1. Review `scraped_schools.csv`
2. Clean up any incorrect data
3. Fill in missing information manually if needed
4. Import to Supabase using `import_to_supabase.py`

