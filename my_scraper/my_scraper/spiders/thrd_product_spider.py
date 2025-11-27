import scrapy
from urllib.parse import urlencode, urljoin


class SmartMasterProductsSpider(scrapy.Spider):
    name = "smart_master"
    start_urls = [
        "https://smartmaster.com.my/collections/casual-shirt",
        "https://smartmaster.com.my/collections/formal-trousers",
    ]
    custom_settings = {
        "ROBOTSTXT_OBEY": True,
        # Use plain HTTP handlers (no Playwright)
        "DOWNLOAD_HANDLERS": {
            "http": "scrapy.core.downloader.handlers.http.HTTPDownloadHandler",
            "https": "scrapy.core.downloader.handlers.http.HTTPDownloadHandler",
        },
        # Keep requests reasonably fast
        "DOWNLOAD_TIMEOUT": 30,
        "DEFAULT_REQUEST_HEADERS": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        },
    }
    page_size = 250  # Shopify products.json supports limit

    async def start(self):
        for url in self.start_urls:
            api_url = f"{url}/products.json?{urlencode({'limit': self.page_size, 'page': 1})}"
            yield scrapy.Request(api_url, callback=self.parse_products, cb_kwargs={"page": 1, "base_url": url})

    def parse_products(self, response, page, base_url):
        data = response.json()
        products = data.get("products", [])
        for product in products:
            title = (product.get("title") or "").strip() or None
            handle = product.get("handle") or ""
            images = product.get("images") or []
            first_image = images[0].get("src") if images else None
            yield {
                "name": title,
                "image": first_image,
                "url": urljoin(base_url, f"/products/{handle}") if handle else None,
            }

        if len(products) == self.page_size:
            next_page = page + 1
            next_api = f"{base_url}/products.json?{urlencode({'limit': self.page_size, 'page': next_page})}"
            yield scrapy.Request(next_api, callback=self.parse_products, cb_kwargs={"page": next_page, "base_url": base_url})
