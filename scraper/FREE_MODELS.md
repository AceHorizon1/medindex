# Free Models on OpenRouter

This guide lists free models available on OpenRouter that you can use with the MedIndex scraper.

## Free Models (No Credit Card Required)

### Recommended Free Models

1. **Meta Llama 3.2 3B Instruct** (Recommended)
   - Model ID: `meta-llama/llama-3.2-3b-instruct:free`
   - Fast, good quality for structured data extraction
   - Best for: Medical school data extraction
   - Usage:
     ```bash
     python cyberscraper_scraper.py --openrouter --model meta-llama/llama-3.2-3b-instruct:free
     ```

2. **Google Gemini Flash 1.5**
   - Model ID: `google/gemini-flash-1.5:free`
   - Fast and capable
   - Good for: General web scraping
   - Usage:
     ```bash
     python cyberscraper_scraper.py --openrouter --model google/gemini-flash-1.5:free
     ```

3. **Meta Llama 3.1 8B Instruct**
   - Model ID: `meta-llama/llama-3.1-8b-instruct:free`
   - More capable than 3B, slightly slower
   - Good for: Complex data extraction
   - Usage:
     ```bash
     python cyberscraper_scraper.py --openrouter --model meta-llama/llama-3.1-8b-instruct:free
     ```

4. **Mistral 7B Instruct**
   - Model ID: `mistralai/mistral-7b-instruct:free`
   - Good quality, reliable
   - Usage:
     ```bash
     python cyberscraper_scraper.py --openrouter --model mistralai/mistral-7b-instruct:free
     ```

## How to Use Free Models

### Method 1: Command Line Flag
```bash
python cyberscraper_scraper.py \
  --openrouter \
  --model meta-llama/llama-3.2-3b-instruct:free
```

### Method 2: Set Default in Code
The scraper now defaults to `meta-llama/llama-3.2-3b-instruct:free` when using OpenRouter.

### Method 3: Environment Variable
You can set a default model:
```bash
export OPENROUTER_DEFAULT_MODEL="meta-llama/llama-3.2-3b-instruct:free"
```

## Model Comparison

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| llama-3.2-3b-instruct | ⚡⚡⚡ Fast | ⭐⭐⭐ Good | Structured data extraction |
| gemini-flash-1.5 | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ Very Good | General purpose |
| llama-3.1-8b-instruct | ⚡⚡ Medium | ⭐⭐⭐⭐ Very Good | Complex tasks |
| mistral-7b-instruct | ⚡⚡ Medium | ⭐⭐⭐ Good | Reliable extraction |

## Finding More Free Models

1. Go to https://openrouter.ai/models
2. Filter by "Free" or look for models with `:free` suffix
3. Check the model card for usage limits

## Rate Limits

Free models typically have:
- **Rate limits**: Varies by model (usually 5-10 requests/minute)
- **Daily limits**: Some models have daily request limits
- **No credit card required**: Truly free to use

## Tips for Using Free Models

1. **Add delays**: Use `--delay 3.0` or higher to respect rate limits
   ```bash
   python cyberscraper_scraper.py --openrouter --model meta-llama/llama-3.2-3b-instruct:free --delay 3.0
   ```

2. **Start small**: Test with `--max 5` first
   ```bash
   python cyberscraper_scraper.py --openrouter --model meta-llama/llama-3.2-3b-instruct:free --max 5
   ```

3. **Handle errors**: Free models may have more rate limiting, so be patient

4. **Best model for medical school scraping**: 
   - **Recommended**: `meta-llama/llama-3.2-3b-instruct:free`
   - Good balance of speed and quality
   - Handles structured JSON extraction well

## Example: Full Scraping Session with Free Model

```bash
# Set your API key
export OPENROUTER_API_KEY="your-api-key-here"

# Run scraper with free model
python cyberscraper_scraper.py \
  --openrouter \
  --model meta-llama/llama-3.2-3b-instruct:free \
  --input schools_urls.csv \
  --output scraped_schools.csv \
  --delay 3.0 \
  --max 10
```

## Troubleshooting Free Models

### "Rate limit exceeded"
- Increase delay: `--delay 5.0`
- Wait a few minutes and try again
- Free models have stricter rate limits

### "Model not available"
- Check https://openrouter.ai/models for current availability
- Try a different free model
- Some free models may be temporarily unavailable

### "Model not found"
- Make sure you're using the exact model ID with `:free` suffix
- Check spelling: `meta-llama/llama-3.2-3b-instruct:free` (not `llama-3.2`)

## Cost

**Free models are completely free!** No credits, no charges, no credit card needed.

Just make sure:
- You're using a model with `:free` suffix
- Or using one of the confirmed free models listed above
- Check model page on OpenRouter to confirm it's free

