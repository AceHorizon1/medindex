"""
MedIndex Scraper using CyberScraper-2077
This script uses AI-powered web scraping to extract medical school data.
"""
import asyncio
import csv
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging

# Add CyberScraper-2077 to path
cyberscraper_path = Path(__file__).parent / "CyberScraper-2077"
if not cyberscraper_path.exists():
    cyberscraper_path = Path(__file__).parent.parent.parent / "CyberScraper-2077"
if cyberscraper_path.exists():
    sys.path.insert(0, str(cyberscraper_path))

# Monkey patch to force Chromium instead of Chrome
import src.scrapers.playwright_scraper as playwright_scraper_module
original_get_channel = playwright_scraper_module._get_browser_channel
def _force_chromium():
    """Force use of Chromium instead of Chrome"""
    return None  # None means use default Chromium
playwright_scraper_module._get_browser_channel = _force_chromium

from src.web_extractor import WebExtractor
from src.scrapers.playwright_scraper import ScraperConfig
from langchain_openai import ChatOpenAI
from langchain_core.language_models.base import BaseLanguageModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Medical school data extraction prompt
MEDICAL_SCHOOL_EXTRACTION_PROMPT = """Extract all medical school information from this webpage and return it as a JSON object with the following fields:

{
  "name": "School name",
  "type": "MD or DO",
  "location": "Full location (city, state)",
  "city": "City name",
  "state": "State abbreviation (2 letters)",
  "tuition": 0,
  "avg_gpa": 0.0,
  "avg_mcat": 0,
  "required_courses": ["Biology", "Chemistry", "Physics", "English"],
  "mission": "Mission statement or description",
  "deadlines": {
    "primary": "Primary application deadline",
    "secondary": "Secondary application deadline"
  },
  "link": "School website URL",
  "class_size": 0,
  "acceptance_rate": 0.0
}

IMPORTANT:
- Return ONLY valid JSON, no additional text
- Use null for missing values (not empty strings)
- For numbers, use actual numbers (not strings)
- Extract tuition as integer (remove $ and commas)
- Extract GPA as float (e.g., 3.75)
- Extract MCAT as integer (e.g., 515)
- Extract acceptance_rate as float between 0 and 1 (e.g., 0.05 for 5%)
- For required_courses, extract all mentioned prerequisite courses
- For deadlines, extract dates in any format found
- If type (MD/DO) is not clear, infer from context or use "MD" as default
- Extract the full location string and parse city/state if possible

Return the JSON now:"""


class WebExtractorWithCustomModel(WebExtractor):
    """
    Custom WebExtractor that accepts a pre-instantiated model (for OpenRouter support)
    """
    def __init__(
        self,
        custom_model: BaseLanguageModel,
        model_name: str,
        scraper_config: ScraperConfig = None,
        **kwargs
    ):
        """Initialize with a custom model instance - bypass parent's model initialization"""
        # Store the custom model FIRST before calling any parent methods
        self.model = custom_model
        self.model_name = model_name
        
        # Initialize the rest using parent's __init__ logic
        # We need to bypass the model initialization in parent
        from src.scrapers.playwright_scraper import ScraperConfig as ScraperConfigType
        from src.scrapers.tor.tor_config import TorConfig
        from src.scrapers.tor.tor_scraper import TorScraper
        from src.scrapers.playwright_scraper import PlaywrightScraper
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        import tiktoken
        
        self.scraper_config = scraper_config or ScraperConfigType()
        self.playwright_scraper = PlaywrightScraper(config=self.scraper_config)
        self.current_url: str | None = None
        self.current_content: str | None = None
        self.preprocessed_content: str | None = None
        self.conversation_history: list[str] = []
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=32000,
            chunk_overlap=200,
            length_function=self.num_tokens_from_string,
        )
        self.max_tokens = 128000 if "gpt-4" in model_name.lower() else 16385
        self.query_cache: dict[tuple, str] = {}
        self.content_hash: str | None = None
        
        self.tor_config = kwargs.get('tor_config') or TorConfig()
        self.tor_scraper = TorScraper(self.tor_config)
        
        # Initialize tiktoken encoding cache (needed for num_tokens_from_string)
        try:
            import tiktoken
            self._tiktoken_encoding = tiktoken.encoding_for_model("gpt-4o-mini")
        except:
            self._tiktoken_encoding = None
    
    async def _call_model(self, query: str, conversation_history: list[dict] | None = None) -> str:
        """Override to use custom model directly"""
        from src.prompts import get_prompt_for_model
        
        # Use a generic prompt template for OpenRouter models
        # Since we have a custom model, we'll use a simple prompt format
        prompt_template = get_prompt_for_model("gpt-4o-mini")  # Use GPT prompt as template
        
        # Format conversation history
        history_text = self._format_conversation_history(conversation_history)
        
        # Format the prompt as a string (ChatOpenAI expects string or BaseMessages)
        formatted_prompt = prompt_template.format(
            conversation_history=history_text,
            webpage_content=self.preprocessed_content,
            query=query
        )
        
        # Invoke the custom model with the formatted prompt string
        response = await self.model.ainvoke(formatted_prompt)
        return response.content if hasattr(response, 'content') else str(response)


class MedIndexScraper:
    def __init__(
        self,
        model_name: str = "gpt-4o-mini",
        headless: bool = True,
        delay_after_load: int = 3,
        use_openrouter: bool = False,
        openrouter_api_key: Optional[str] = None
    ):
        """
        Initialize the MedIndex scraper with CyberScraper-2077
        
        Args:
            model_name: LLM model to use (gpt-4o-mini, gpt-4.1-mini, gemini-1.5-flash, etc.)
                       For OpenRouter, use format like "openai/gpt-4o-mini" or "anthropic/claude-3.5-sonnet"
            headless: Run browser in headless mode
            delay_after_load: Seconds to wait after page load
            use_openrouter: Use OpenRouter API instead of direct provider APIs
            openrouter_api_key: OpenRouter API key (if None, reads from OPENROUTER_API_KEY env var)
        """
        self.model_name = model_name
        self.use_openrouter = use_openrouter
        
        # Configure scraper with stealth settings
        # Note: We'll use Chromium instead of Chrome to avoid installation issues
        scraper_config = ScraperConfig(
            use_stealth=True,
            simulate_human=False,
            use_custom_headers=True,
            hide_webdriver=True,
            bypass_cloudflare=True,
            headless=headless,
            max_retries=3,
            delay_after_load=delay_after_load,
            debug=False,
            use_current_browser=False  # Use Chromium instead of system Chrome
        )
        
        # If using OpenRouter, create a custom model instance
        if use_openrouter:
            openrouter_key = openrouter_api_key or os.getenv('OPENROUTER_API_KEY')
            if not openrouter_key:
                raise ValueError(
                    "OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable "
                    "or pass openrouter_api_key parameter."
                )
            
            # Create OpenRouter-compatible ChatOpenAI instance
            # OpenRouter uses OpenAI-compatible API with custom base URL
            # Model name format: "openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", etc.
            openrouter_model = ChatOpenAI(
                model=model_name,
                openai_api_key=openrouter_key,
                openai_api_base='https://openrouter.ai/api/v1',
                default_headers={
                    'HTTP-Referer': 'https://github.com/medindex',  # Optional: for tracking
                    'X-Title': 'MedIndex Scraper'  # Optional: for tracking
                }
            )
            
            # Create WebExtractor with custom model
            # We need to bypass the normal model initialization
            self.web_extractor = WebExtractorWithCustomModel(
                custom_model=openrouter_model,
                model_name=model_name,
                scraper_config=scraper_config
            )
        else:
            # For non-OpenRouter models, use standard initialization
            self.web_extractor = WebExtractor(
                model_name=model_name,
                scraper_config=scraper_config
            )
        
        self.scraped_data: List[Dict[str, Any]] = []
    
    async def scrape_school(self, url: str, school_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Scrape a single medical school website
        
        Args:
            url: School website URL
            school_name: Optional school name (for logging)
        
        Returns:
            Dictionary with school data or None if failed
        """
        name = school_name or url
        logger.info(f"Scraping {name}...")
        
        try:
            # Fetch the webpage
            fetch_response = await self.web_extractor.process_query(url)
            
            if "Error" in fetch_response or "Failed" in fetch_response:
                logger.error(f"Failed to fetch {name}: {fetch_response}")
                return None
            
            # Extract medical school data using AI
            logger.info(f"Extracting data from {name}...")
            extraction_response = await self.web_extractor.process_query(
                MEDICAL_SCHOOL_EXTRACTION_PROMPT
            )
            
            # Parse JSON from response
            school_data = self._parse_extraction_response(extraction_response, url)
            
            if school_data:
                logger.info(f"✓ Successfully scraped {school_data.get('name', name)}")
                return school_data
            else:
                logger.warning(f"✗ Failed to extract data from {name}")
                return None
                
        except Exception as e:
            logger.error(f"Error scraping {name}: {str(e)}")
            return None
    
    def _parse_extraction_response(self, response: str, url: str) -> Optional[Dict[str, Any]]:
        """Parse the AI extraction response into a dictionary"""
        try:
            # Try to extract JSON from the response
            json_data = self.web_extractor._extract_json_data(response)
            
            if json_data:
                # If it's a list, take the first item
                if isinstance(json_data, list):
                    if len(json_data) > 0:
                        json_data = json_data[0]
                    else:
                        return None
                
                # Ensure it's a dict
                if not isinstance(json_data, dict):
                    return None
                
                # Ensure URL is set
                if not json_data.get('link'):
                    json_data['link'] = url
                
                # Normalize the data
                return self._normalize_school_data(json_data)
            
            # If JSON extraction failed, try to find JSON in markdown code blocks
            import re
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
            if json_match:
                try:
                    json_data = json.loads(json_match.group(1))
                    if isinstance(json_data, dict):
                        if not json_data.get('link'):
                            json_data['link'] = url
                        return self._normalize_school_data(json_data)
                except:
                    pass
            
            logger.warning(f"Could not parse JSON from response: {response[:200]}...")
            return None
            
        except Exception as e:
            logger.error(f"Error parsing extraction response: {str(e)}")
            return None
    
    def _normalize_school_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize school data to match MedIndex schema"""
        normalized = {
            'name': data.get('name', '').strip(),
            'type': (data.get('type', 'MD') or 'MD').strip().upper(),
            'location': data.get('location', '').strip(),
            'city': data.get('city', '').strip(),
            'state': data.get('state', '').strip().upper()[:2] if data.get('state') else '',
            'tuition': self._parse_int(data.get('tuition')),
            'avg_gpa': self._parse_float(data.get('avg_gpa')),
            'avg_mcat': self._parse_int(data.get('avg_mcat')),
            'required_courses': self._parse_courses(data.get('required_courses')),
            'mission': str(data.get('mission', '')).strip() if data.get('mission') else '',
            'deadlines': self._parse_deadlines(data.get('deadlines')),
            'link': data.get('link', '').strip(),
            'website': data.get('link', '').strip(),
            'class_size': self._parse_int(data.get('class_size')),
            'acceptance_rate': self._parse_float(data.get('acceptance_rate'))
        }
        
        # Construct location if missing
        if not normalized['location']:
            parts = []
            if normalized['city']:
                parts.append(normalized['city'])
            if normalized['state']:
                parts.append(normalized['state'])
            if parts:
                normalized['location'] = ', '.join(parts)
        
        return normalized
    
    def _parse_int(self, value) -> Optional[int]:
        """Parse integer value"""
        if value is None:
            return None
        if isinstance(value, int):
            return value
        if isinstance(value, str):
            # Remove $, commas, and whitespace
            cleaned = value.replace('$', '').replace(',', '').strip()
            try:
                return int(float(cleaned))
            except:
                return None
        if isinstance(value, float):
            return int(value)
        return None
    
    def _parse_float(self, value) -> Optional[float]:
        """Parse float value"""
        if value is None:
            return None
        if isinstance(value, float):
            return value
        if isinstance(value, int):
            return float(value)
        if isinstance(value, str):
            cleaned = value.replace('%', '').replace(',', '').strip()
            try:
                return float(cleaned)
            except:
                return None
        return None
    
    def _parse_courses(self, value) -> List[str]:
        """Parse required courses"""
        if not value:
            return []
        if isinstance(value, list):
            return [str(c).strip() for c in value if c]
        if isinstance(value, str):
            # Try JSON first
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [str(c).strip() for c in parsed if c]
            except:
                pass
            # Try comma-separated
            return [c.strip() for c in value.split(',') if c.strip()]
        return []
    
    def _parse_deadlines(self, value) -> Optional[Dict]:
        """Parse deadlines"""
        if not value:
            return None
        if isinstance(value, dict):
            return value
        if isinstance(value, str):
            try:
                return json.loads(value)
            except:
                return None
        return None
    
    async def scrape_from_csv(
        self,
        csv_file: str = "schools_urls.csv",
        output_file: str = "scraped_schools_cyberscraper.csv",
        max_schools: Optional[int] = None,
        delay_between: float = 2.0
    ):
        """
        Scrape medical schools from a CSV file with URLs
        
        Args:
            csv_file: Input CSV file with school URLs
            output_file: Output CSV file for scraped data
            max_schools: Maximum number of schools to scrape (None for all)
            delay_between: Seconds to wait between requests
        """
        # Read URLs from CSV
        urls = []
        csv_path = Path(__file__).parent / csv_file
        
        if not csv_path.exists():
            logger.error(f"CSV file not found: {csv_path}")
            return
        
        logger.info(f"Reading URLs from {csv_path}...")
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                url = row.get('website') or row.get('url') or row.get('link')
                if url:
                    urls.append({
                        'url': url.strip(),
                        'name': row.get('name', '').strip()
                    })
        
        if not urls:
            logger.error("No URLs found in CSV file")
            return
        
        if max_schools:
            urls = urls[:max_schools]
        
        logger.info(f"Found {len(urls)} schools to scrape")
        
        # Scrape each school
        successful = 0
        failed = 0
        
        for i, school_info in enumerate(urls, 1):
            logger.info(f"\n[{i}/{len(urls)}] Processing {school_info['name'] or school_info['url']}")
            
            school_data = await self.scrape_school(
                school_info['url'],
                school_info['name']
            )
            
            if school_data:
                self.scraped_data.append(school_data)
                successful += 1
            else:
                failed += 1
            
            # Delay between requests to be respectful
            if i < len(urls):
                await asyncio.sleep(delay_between)
        
        # Save to CSV
        self._save_to_csv(output_file)
        
        logger.info(f"\n✅ Scraping complete!")
        logger.info(f"   Successful: {successful}")
        logger.info(f"   Failed: {failed}")
        logger.info(f"   Output saved to: {output_file}")
    
    def _save_to_csv(self, output_file: str):
        """Save scraped data to CSV"""
        if not self.scraped_data:
            logger.warning("No data to save")
            return
        
        output_path = Path(__file__).parent / output_file
        
        # Define CSV columns
        fieldnames = [
            'name', 'type', 'location', 'city', 'state',
            'tuition', 'avg_gpa', 'avg_mcat', 'required_courses',
            'mission', 'deadlines', 'link', 'website',
            'class_size', 'acceptance_rate'
        ]
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for school in self.scraped_data:
                # Convert lists and dicts to JSON strings for CSV
                row = school.copy()
                if isinstance(row.get('required_courses'), list):
                    row['required_courses'] = json.dumps(row['required_courses'])
                if isinstance(row.get('deadlines'), dict):
                    row['deadlines'] = json.dumps(row['deadlines'])
                
                # Convert None to empty string for CSV
                for key, value in row.items():
                    if value is None:
                        row[key] = ''
                
                writer.writerow(row)
        
        logger.info(f"Saved {len(self.scraped_data)} schools to {output_path}")


async def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Scrape medical school data using CyberScraper-2077')
    parser.add_argument(
        '--input',
        default='schools_urls.csv',
        help='Input CSV file with school URLs (default: schools_urls.csv)'
    )
    parser.add_argument(
        '--output',
        default='scraped_schools_cyberscraper.csv',
        help='Output CSV file (default: scraped_schools_cyberscraper.csv)'
    )
    parser.add_argument(
        '--model',
        default=None,
        help='LLM model to use. For OpenRouter free models, use: meta-llama/llama-3.2-3b-instruct:free, google/gemini-flash-1.5:free, etc. Defaults to free model when using --openrouter'
    )
    parser.add_argument(
        '--openrouter',
        action='store_true',
        help='Use OpenRouter API instead of direct provider APIs'
    )
    parser.add_argument(
        '--openrouter-key',
        help='OpenRouter API key (or set OPENROUTER_API_KEY env var)'
    )
    parser.add_argument(
        '--max',
        type=int,
        help='Maximum number of schools to scrape'
    )
    parser.add_argument(
        '--delay',
        type=float,
        default=2.0,
        help='Delay between requests in seconds (default: 2.0)'
    )
    parser.add_argument(
        '--no-headless',
        action='store_true',
        help='Run browser in non-headless mode (for debugging)'
    )
    
    args = parser.parse_args()
    
    # Check for API key and set default free model
    if args.openrouter:
        api_key = args.openrouter_key or os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            logger.error("Error: OpenRouter API key required. Set OPENROUTER_API_KEY or use --openrouter-key")
            return
        
        # Default to free model if not specified
        if not args.model:
            args.model = 'liquid/lfm-3-1.7b:free'
            logger.info(f"Using default free model: {args.model}")
        
        # Warn if using non-free model
        if ':free' not in args.model.lower():
            logger.warning(f"⚠️  Model '{args.model}' may not be free.")
            logger.warning("   Free models include: liquid/lfm-3-1.7b:free, google/gemma-4-31b-it:free")
            logger.warning("   See FREE_MODELS.md for complete list of free models")
    else:
        api_key = os.getenv('OPENAI_API_KEY') or os.getenv('GOOGLE_API_KEY')
        if not api_key:
            logger.error("Error: No API key found. Set OPENAI_API_KEY or GOOGLE_API_KEY in environment.")
            logger.info("You can create a .env file in the scraper directory with your API key.")
            logger.info("Or use --openrouter flag with OPENROUTER_API_KEY for OpenRouter.")
            return
    
    # Set default model if not specified and not using OpenRouter
    if not args.model and not args.openrouter:
        args.model = 'gpt-4o-mini'
    
    # Initialize scraper
    scraper = MedIndexScraper(
        model_name=args.model or 'liquid/lfm-3-1.7b:free',
        headless=not args.no_headless,
        use_openrouter=args.openrouter,
        openrouter_api_key=args.openrouter_key
    )
    
    # Run scraping
    await scraper.scrape_from_csv(
        csv_file=args.input,
        output_file=args.output,
        max_schools=args.max,
        delay_between=args.delay
    )


if __name__ == '__main__':
    asyncio.run(main())

