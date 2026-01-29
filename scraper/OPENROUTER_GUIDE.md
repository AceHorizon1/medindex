# OpenRouter Integration Guide

This guide explains how to use OpenRouter with the MedIndex scraper.

## What is OpenRouter?

OpenRouter is a unified API that provides access to multiple AI models from different providers (OpenAI, Anthropic, Google, Meta, etc.) through a single interface. This gives you:

- **Choice**: Access to 100+ models from different providers
- **Flexibility**: Switch models without changing code
- **Cost Comparison**: See pricing for all models in one place
- **Fallback**: Automatic failover if a model is unavailable

## Setup

### 1. Get an OpenRouter API Key

1. Go to https://openrouter.ai
2. Sign up or log in
3. Navigate to https://openrouter.ai/keys
4. Create a new API key
5. Copy the key

### 2. Set Environment Variable

```bash
export OPENROUTER_API_KEY="your-api-key-here"
```

Or add to `.env` file:
```
OPENROUTER_API_KEY=your-api-key-here
```

### 3. Use the Scraper

```bash
python cyberscraper_scraper.py --openrouter --model openai/gpt-4o-mini
```

## Available Models

OpenRouter supports many models. Here are popular choices for web scraping:

### Fast & Cheap (Recommended for Scraping)
- `openai/gpt-4o-mini` - Fast, cheap, good quality
- `google/gemini-pro-1.5` - Google's latest, competitive pricing
- `meta-llama/llama-3.1-70b-instruct` - Open source, free tier available

### High Quality
- `openai/gpt-4o` - More capable than mini
- `anthropic/claude-3.5-sonnet` - Excellent reasoning, follows instructions well
- `anthropic/claude-3-opus` - Most capable, but expensive

### Budget Options
- `openai/gpt-3.5-turbo` - Very cheap, decent quality
- `google/gemini-flash-1.5` - Fast and cheap
- `meta-llama/llama-3.1-8b-instruct` - Free tier available

See all models at: https://openrouter.ai/models

## Usage Examples

### Basic Usage
```bash
# Use GPT-4o Mini via OpenRouter
python cyberscraper_scraper.py --openrouter --model openai/gpt-4o-mini

# Use Claude 3.5 Sonnet
python cyberscraper_scraper.py --openrouter --model anthropic/claude-3.5-sonnet

# Use Gemini Pro
python cyberscraper_scraper.py --openrouter --model google/gemini-pro-1.5
```

### With Options
```bash
python cyberscraper_scraper.py \
  --openrouter \
  --model openai/gpt-4o-mini \
  --input schools_urls.csv \
  --output results.csv \
  --max 10 \
  --delay 2.0
```

### With Custom API Key
```bash
python cyberscraper_scraper.py \
  --openrouter \
  --openrouter-key "sk-or-v1-..." \
  --model openai/gpt-4o-mini
```

## Model Naming Format

OpenRouter uses the format: `provider/model-name`

Examples:
- `openai/gpt-4o-mini`
- `anthropic/claude-3.5-sonnet`
- `google/gemini-pro-1.5`
- `meta-llama/llama-3.1-70b-instruct`

## Pricing

OpenRouter pricing varies by model. Check current pricing at:
https://openrouter.ai/models

**Approximate costs for medical school scraping:**
- `gpt-4o-mini`: ~$0.01-0.05 per school
- `claude-3.5-sonnet`: ~$0.05-0.15 per school
- `gemini-pro-1.5`: ~$0.01-0.05 per school

For 100 schools:
- `gpt-4o-mini`: ~$1-5
- `claude-3.5-sonnet`: ~$5-15
- `gemini-pro-1.5`: ~$1-5

## Advantages Over Direct APIs

1. **Model Comparison**: Easily test different models to find the best one
2. **Unified Interface**: Same code works with all models
3. **Cost Transparency**: See all pricing in one place
4. **Reliability**: Automatic failover if a model is down
5. **No Provider Lock-in**: Switch providers without code changes

## Troubleshooting

### "OpenRouter API key is required"
- Make sure you've set `OPENROUTER_API_KEY` environment variable
- Or use `--openrouter-key` flag

### "Unsupported model"
- Check the model name format: `provider/model-name`
- Verify the model exists at https://openrouter.ai/models
- Some models may require special access

### Rate Limits
- OpenRouter has rate limits based on your account tier
- Free tier: Limited requests
- Paid tier: Higher limits
- Check your limits at https://openrouter.ai/activity

## Best Practices

1. **Start with gpt-4o-mini**: Good balance of cost and quality
2. **Test with --max 5**: Try a few schools first
3. **Compare models**: Test different models to find the best for your use case
4. **Monitor costs**: Check your usage at https://openrouter.ai/activity
5. **Use appropriate models**: Don't use expensive models if cheaper ones work

## Resources

- OpenRouter Website: https://openrouter.ai
- Model List: https://openrouter.ai/models
- API Docs: https://openrouter.ai/docs
- Pricing: https://openrouter.ai/models (pricing shown per model)
- Activity Dashboard: https://openrouter.ai/activity

