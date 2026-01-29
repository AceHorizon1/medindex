#!/bin/bash
# Quick start script for CyberScraper-2077 integration with MedIndex

echo "🚀 MedIndex CyberScraper Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    echo "Choose your API provider:"
    echo "1) OpenRouter (recommended - access to multiple models)"
    echo "2) OpenAI (direct)"
    echo "3) Skip (set manually later)"
    read -p "Enter choice (1-3): " choice
    
    case $choice in
        1)
            echo "Get your API key from: https://openrouter.ai/keys"
            read -p "Enter your OpenRouter API key: " api_key
            if [ ! -z "$api_key" ]; then
                echo "OPENROUTER_API_KEY=$api_key" > .env
                echo "✓ OpenRouter API key saved to .env"
            fi
            ;;
        2)
            echo "Get your API key from: https://platform.openai.com/api-keys"
            read -p "Enter your OpenAI API key: " api_key
            if [ ! -z "$api_key" ]; then
                echo "OPENAI_API_KEY=$api_key" > .env
                echo "✓ OpenAI API key saved to .env"
            fi
            ;;
        *)
            echo "⚠️  Skipping API key setup. Please create .env file manually with:"
            echo "   OPENROUTER_API_KEY=your-key-here  (for OpenRouter)"
            echo "   or"
            echo "   OPENAI_API_KEY=your-key-here  (for OpenAI)"
            echo ""
            ;;
    esac
else
    echo "✓ .env file already exists"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements_cyberscraper.txt

# Install Playwright browsers
echo ""
echo "🌐 Installing Playwright browsers..."
playwright install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your .env file has OPENROUTER_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY"
echo "2. Ensure schools_urls.csv exists with school URLs"
echo "3. Run the scraper:"
echo "   - With OpenRouter: python cyberscraper_scraper.py --openrouter --model openai/gpt-4o-mini"
echo "   - With OpenAI: python cyberscraper_scraper.py --model gpt-4o-mini"
echo ""
echo "For more options, see CYBERSCRAPER_README.md"

