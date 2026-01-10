import scrapy
from urllib.parse import urlencode, urljoin
from datetime import datetime


class TomazProductsSpider(scrapy.Spider):
    name = "tomaz"
    start_urls = ["https://tomaz.my/collections/blazers"]

    custom_settings = {
        "ROBOTSTXT_OBEY": True,
    }

    page_size = 250

    def __init__(self, scrape_time=None, *args, **kwargs):
        super().__init__(*args, **kwargs)

        now = datetime.now()

        self.scrape_time = scrape_time or now.isoformat()
        self.scrape_date = now.strftime("%Y-%m-%d")
        self.scrape_run_id = now.strftime("%Y%m%d_%H%M%S")

    async def start(self):
        for url in self.start_urls:
            api_url = (
                f"{url}/products.json?"
                f"{urlencode({'limit': self.page_size, 'page': 1})}"
            )

            yield scrapy.Request(
                api_url,
                callback=self.parse_products,
                cb_kwargs={
                    "page": 1,
                    "base_url": url
                },
            )

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
                "category": "formal",

                # 🔥 ADMIN SCRAPE METADATA
                "scraped_at": self.scrape_time,
                "scrape_date": self.scrape_date,
                "scrape_run_id": self.scrape_run_id,
            }

        # Pagination
        if len(products) == self.page_size:
            next_page = page + 1
            next_api = (
                f"{base_url}/products.json?"
                f"{urlencode({'limit': self.page_size, 'page': next_page})}"
            )

            yield scrapy.Request(
                next_api,
                callback=self.parse_products,
                cb_kwargs={
                    "page": next_page,
                    "base_url": base_url
                },
            )
