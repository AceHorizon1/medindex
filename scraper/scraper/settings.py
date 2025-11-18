# Scrapy settings for scraper project
BOT_NAME = 'scraper'

SPIDER_MODULES = ['scraper.spiders']
NEWSPIDER_MODULE = 'scraper.spiders'

# Obey robots.txt rules
ROBOTSTXT_OBEY = True

# Configure delays for requests
DOWNLOAD_DELAY = 1
RANDOMIZE_DOWNLOAD_DELAY = 0.5

# User agent
USER_AGENT = 'MedIndex Scraper (+http://www.medindex.com)'

# Enable pipelines
ITEM_PIPELINES = {
    'scraper.pipelines.CsvExportPipeline': 300,
    'scraper.pipelines.JsonExportPipeline': 301,
}

# Enable and configure the AutoThrottle extension
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
AUTOTHROTTLE_DEBUG = False

# Enable and configure HTTP caching
HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 3600

