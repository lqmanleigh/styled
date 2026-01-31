# Scrapy settings for my_scraper project
#
# For simplicity, this file contains only settings considered important or
# commonly used. You can find more settings consulting the documentation:
#
#     https://docs.scrapy.org/en/latest/topics/settings.html
#     https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#     https://docs.scrapy.org/en/latest/topics/spider-middleware.html

BOT_NAME = "my_scraper"

SPIDER_MODULES = ["my_scraper.spiders"]
NEWSPIDER_MODULE = "my_scraper.spiders"

ADDONS = {}


# Crawl responsibly by identifying yourself (and your website) on the user-agent
#USER_AGENT = "my_scraper (+http://www.yourdomain.com)"

# Obey robots.txt rules
ROBOTSTXT_OBEY = True

# ============================================
# CONCURRENCY SETTINGS - SERVER OPTIMIZED
# ============================================
# Limit concurrent requests to prevent memory overload
CONCURRENT_REQUESTS = 4                     # Default is 16 - too high for Playwright!
CONCURRENT_REQUESTS_PER_DOMAIN = 1          # Keep at 1 for politeness
DOWNLOAD_DELAY = 1                          # 1 second delay between requests

# Disable cookies (enabled by default)
#COOKIES_ENABLED = False

# Disable Telnet Console (enabled by default)
#TELNETCONSOLE_ENABLED = False

# Override the default request headers:
#DEFAULT_REQUEST_HEADERS = {
#    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8",
#    "Accept-Language": "en",
#}

# Enable or disable spider middlewares
# See https://docs.scrapy.org/en/latest/topics/spider-middleware.html
#SPIDER_MIDDLEWARES = {
#    "my_scraper.middlewares.MyScraperSpiderMiddleware": 543,
#}

# Enable or disable downloader middlewares
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#DOWNLOADER_MIDDLEWARES = {
#    "my_scraper.middlewares.MyScraperDownloaderMiddleware": 543,
#}

# Enable or disable extensions
# See https://docs.scrapy.org/en/latest/topics/extensions.html
#EXTENSIONS = {
#    "scrapy.extensions.telnet.TelnetConsole": None,
#}

# Configure item pipelines
# See https://docs.scrapy.org/en/latest/topics/item-pipeline.html
ITEM_PIPELINES = {
    "my_scraper.pipelines.DbStorePipeline": 400,
}

# Enable and configure the AutoThrottle extension (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/autothrottle.html
#AUTOTHROTTLE_ENABLED = True
# The initial download delay
#AUTOTHROTTLE_START_DELAY = 5
# The maximum download delay to be set in case of high latencies
#AUTOTHROTTLE_MAX_DELAY = 60
# The average number of requests Scrapy should be sending in parallel to
# each remote server
#AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
# Enable showing throttling stats for every response received:
#AUTOTHROTTLE_DEBUG = False

# Enable and configure HTTP caching (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html#httpcache-middleware-settings
#HTTPCACHE_ENABLED = True
#HTTPCACHE_EXPIRATION_SECS = 0
#HTTPCACHE_DIR = "httpcache"
#HTTPCACHE_IGNORE_HTTP_CODES = []
#HTTPCACHE_STORAGE = "scrapy.extensions.httpcache.FilesystemCacheStorage"

# Set settings whose default value is deprecated to a future-proof value
FEED_EXPORT_ENCODING = "utf-8"

# ============================================
# PLAYWRIGHT SETTINGS - SERVER OPTIMIZED
# ============================================
# Enable Playwright
DOWNLOAD_HANDLERS = {
    "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
}

TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"

# Playwright tuning
PLAYWRIGHT_DEFAULT_NAVIGATION_TIMEOUT = 30000  # 30s

# CRITICAL: These launch options prevent server crashes on Linux VPS
PLAYWRIGHT_LAUNCH_OPTIONS = {
    "headless": True,
    "args": [
        # CRITICAL: Prevents /dev/shm crashes on Linux servers
        "--disable-dev-shm-usage",
        
        # Required for running as root user
        "--no-sandbox",
        "--disable-setuid-sandbox",
        
        # Memory optimization flags
        "--single-process",
        "--no-zygote",
        "--disable-gpu",
        
        # Disable unnecessary features to save memory
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-default-apps",
        "--disable-sync",
        "--disable-translate",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        
        # Additional performance flags
        "--mute-audio",
        "--hide-scrollbars",
        "--metrics-recording-only",
        "--no-first-run",
        
        # Limit memory usage
        "--js-flags=--max-old-space-size=512",
    ],
}

# Limit the number of browser contexts (tabs) to prevent memory overload
PLAYWRIGHT_MAX_CONTEXTS = 2

# Browser context settings
PLAYWRIGHT_CONTEXTS = {
    "default": {
        "ignore_https_errors": True,
        "java_script_enabled": True,
    }
}

# Abort unnecessary resource types to save memory and bandwidth
PLAYWRIGHT_ABORT_REQUEST = lambda req: req.resource_type in [
    "image",
    "media", 
    "font",
    "stylesheet",
]

# Per-spider JSON feeds so admin can download brand files directly
FEEDS = {
    "%(name)s.json": {
        "format": "json",
        "encoding": "utf8",
        "indent": 2,
        "overwrite": True,
    },
}