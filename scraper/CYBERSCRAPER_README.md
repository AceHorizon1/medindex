# MedIndex Scraper with CyberScraper-2077

This scraper uses [CyberScraper-2077](https://github.com/itsOwen/CyberScraper-2077) - an AI-powered web scraper that uses Large Language Models (LLMs) to intelligently extract data from websites.

## Why CyberScraper-2077?

Unlike traditional scrapers that rely on fixed CSS selectors, CyberScraper-2077 uses AI to:
- **Understand webpage structure** - Automatically finds data even when HTML structure changes
- **Extract complex data** - Handles varied formats, nested data, and unstructured content
- **Adapt to different sites** - Works across different medical school websites without custom code
- **Handle JavaScript** - Uses Playwright to render dynamic content

## Setup

### 1. Install Dependencies

```bash
cd scraper
pip install -r requirements_cyberscraper.txt
```

### 2. Install Playwright Browsers

```bash
playwright install
```

### 3. Set Up API Key

You need an API key for one of these LLM providers:

**Option A: OpenRouter (Recommended - Access to Multiple Models)**
- Get an API key from https://openrouter.ai/keys
- Set environment variable:
  ```bash
  export OPENROUTER_API_KEY="your-api-key-here"
  ```
- Or create a `.env` file in the `scraper` directory:
  ```
  OPENROUTER_API_KEY=your-api-key-here
  ```
- Use with `--openrouter` flag and specify model like `openai/gpt-4o-mini` or `anthropic/claude-3.5-sonnet`
- See available models at https://openrouter.ai/models

**Option B: OpenAI (Direct)**
- Get an API key from https://platform.openai.com/api-keys
- Set environment variable:
  ```bash
  export OPENAI_API_KEY="your-api-key-here"
  ```
- Or create a `.env` file in the `scraper` directory:
  ```
  OPENAI_API_KEY=your-api-key-here
  ```

**Option C: Google Gemini**
- Get an API key from https://makersuite.google.com/app/apikey
- Set environment variable:
  ```bash
  export GOOGLE_API_KEY="your-api-key-here"
  ```

**Option D: Ollama (Local, Free)**
- Install Ollama from https://ollama.com
- Pull a model: `ollama pull llama3.1`
- Use model name: `--model ollama:llama3.1`

### 4. Prepare Your URLs CSV

Make sure you have a CSV file with school URLs. The default is `schools_urls.csv`:

```csv
website
https://www.harvard.edu/medical-school
https://www.hopkinsmedicine.org/som
```

Or with school names:

```csv
name,website
Harvard Medical School,https://www.harvard.edu/medical-school
Johns Hopkins School of Medicine,https://www.hopkinsmedicine.org/som
```

## Usage

### Basic Usage

```bash
python cyberscraper_scraper.py
```

This will:
- Read URLs from `schools_urls.csv`
- Scrape each school's website
- Extract medical school data using AI
- Save results to `scraped_schools_cyberscraper.csv`

### Using OpenRouter

OpenRouter provides access to multiple AI models through a single API:

```bash
# Use OpenRouter with a specific model
python cyberscraper_scraper.py --openrouter --model openai/gpt-4o-mini

# Use Claude via OpenRouter
python cyberscraper_scraper.py --openrouter --model anthropic/claude-3.5-sonnet

# Use a cheaper model via OpenRouter
python cyberscraper_scraper.py --openrouter --model google/gemini-pro-1.5

# With custom API key
python cyberscraper_scraper.py --openrouter --openrouter-key "your-key" --model openai/gpt-4o-mini
```

Popular OpenRouter models:
- `openai/gpt-4o-mini` - Fast and cheap
- `openai/gpt-4o` - More capable
- `anthropic/claude-3.5-sonnet` - Excellent reasoning
- `google/gemini-pro-1.5` - Good balance
- `meta-llama/llama-3.1-70b-instruct` - Open source option

### Advanced Options

```bash
# Use a different input file
python cyberscraper_scraper.py --input my_schools.csv

# Specify output file
python cyberscraper_scraper.py --output results.csv

# Use a different LLM model (direct providers)
python cyberscraper_scraper.py --model gpt-4.1-mini
python cyberscraper_scraper.py --model gemini-1.5-flash

# Use OpenRouter
python cyberscraper_scraper.py --openrouter --model openai/gpt-4o-mini

# Limit number of schools (for testing)
python cyberscraper_scraper.py --max 5

# Adjust delay between requests (default: 2 seconds)
python cyberscraper_scraper.py --delay 3.0

# Run browser in visible mode (for debugging)
python cyberscraper_scraper.py --no-headless
```

### Full Examples

**Using OpenAI directly:**
```bash
python cyberscraper_scraper.py \
  --input schools_urls.csv \
  --output scraped_schools_cyberscraper.csv \
  --model gpt-4o-mini \
  --max 10 \
  --delay 2.0
```

**Using OpenRouter:**
```bash
python cyberscraper_scraper.py \
  --openrouter \
  --input schools_urls.csv \
  --output scraped_schools_cyberscraper.csv \
  --model openai/gpt-4o-mini \
  --max 10 \
  --delay 2.0
```

## What Data is Extracted?

The scraper extracts the following fields for each medical school:

- **name**: School name
- **type**: MD or DO
- **location**: Full location string
- **city**: City name
- **state**: State abbreviation
- **tuition**: Annual tuition (integer)
- **avg_gpa**: Average GPA (float)
- **avg_mcat**: Average MCAT score (integer)
- **required_courses**: List of prerequisite courses
- **mission**: Mission statement
- **deadlines**: Application deadlines (JSON)
- **link**: School website URL
- **class_size**: Class size (integer)
- **acceptance_rate**: Acceptance rate (float, 0-1)

## Importing to Supabase

After scraping, import the data to Supabase:

```bash
# Make sure the output file matches what import script expects
cp scraped_schools_cyberscraper.csv scraped_schools.csv

# Import to Supabase
python import_to_supabase.py
```

Or modify `import_to_supabase.py` to use `scraped_schools_cyberscraper.csv` directly.

## Troubleshooting

### "No API key found"
- Make sure you've set `OPENAI_API_KEY` or `GOOGLE_API_KEY` in your environment
- Or create a `.env` file in the `scraper` directory

### "Failed to fetch" errors
- Some websites may block automated scrapers
- Try using `--no-headless` to see what's happening
- Increase `--delay` to be more respectful
- Some sites may require manual captcha solving (not supported in this script)

### "Could not parse JSON"
- The AI might not have found the data on the page
- Try visiting the URL manually to verify the data exists
- Some pages may require JavaScript to load content (Playwright handles this)

### Slow scraping
- Each school takes 10-30 seconds depending on:
  - Page load time
  - AI processing time
  - API response time
- For 100 schools, expect 15-50 minutes total
- Use `--max` to test with fewer schools first

### Missing data
- Not all schools publish all statistics
- The AI extracts what's available on the page
- You may need to manually fill in missing data

## Cost Considerations

**OpenRouter:**
- Access to multiple models with unified pricing
- `openai/gpt-4o-mini`: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- `anthropic/claude-3.5-sonnet`: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- `google/gemini-pro-1.5`: Often cheaper than direct providers
- Average cost per school: $0.01-0.10 (depends on model)
- 100 schools: ~$1-10
- See pricing at https://openrouter.ai/models

**OpenAI (Direct):**
- `gpt-4o-mini`: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Average cost per school: $0.01-0.05
- 100 schools: ~$1-5

**Gemini (Direct):**
- `gemini-1.5-flash`: Free tier available, then pay-as-you-go
- Generally cheaper than OpenAI

**Ollama:**
- Free (runs locally)
- Requires good hardware (GPU recommended)
- Slower than cloud APIs

## Comparison with Traditional Scraper

| Feature | Traditional Scraper | CyberScraper-2077 |
|---------|-------------------|-------------------|
| Setup | Custom selectors per site | Works across sites |
| Maintenance | Breaks when HTML changes | Adapts automatically |
| Complex data | Hard to extract | AI understands context |
| JavaScript | Requires Selenium/Playwright | Built-in Playwright |
| Cost | Free | API costs apply |
| Speed | Fast | Slower (AI processing) |

## Tips for Best Results

1. **Start small**: Use `--max 5` to test first
2. **Check output**: Review the CSV to ensure data quality
3. **Adjust model**: Try different models if extraction quality is poor
4. **Be respectful**: Use appropriate delays between requests
5. **Verify manually**: Spot-check a few schools to ensure accuracy

## Next Steps

1. Run the scraper on your school URLs
2. Review the output CSV
3. Manually correct any errors
4. Import to Supabase using `import_to_supabase.py`
5. Update your MedIndex app with the new data

## Support

- CyberScraper-2077: https://github.com/itsOwen/CyberScraper-2077
- MedIndex: Check the main README.md

