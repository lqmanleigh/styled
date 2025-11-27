import scrapy
from scrapy_playwright.page import PageMethod


class ProductsSpider(scrapy.Spider):
    name = "products"
    start_urls = ["https://locallab.com.my/collections/aegis"]

    def start_requests(self):
        for url in self.start_urls:
            yield scrapy.Request(
                url=url,
                callback=self.parse_products,
                meta={
                    "playwright": True,
                    # Ensure content is loaded before parsing
                    "playwright_page_methods": [
                        PageMethod("wait_for_selector", "div.product-card__figure", timeout=30000)
                    ],
                },
            )

    def parse_products(self, response):
        # Extract product cards (adjust selectors as needed)
        cards = response.css("div.product-card__figure, div.product-card, div.grid-product")
        for product in cards:
            name = (
                product.css("img::attr(alt)").get()
                or product.css("a::attr(title)").get()
            )
            img = (
                product.css("img::attr(src)").get()
                or product.css("img::attr(data-src)").get()
                or product.css("source::attr(srcset)").get()
            )
            href = product.css("a::attr(href)").get()

            yield {
                "name": (name or "").strip() or None,
                "image": response.urljoin(img) if img else None,
                "url": response.urljoin(href) if href else None,
            }

        # Follow pagination if present
        next_url = (
            response.css("link[rel='next']::attr(href)").get()
            or response.css("a[rel='next']::attr(href)").get()
            or response.css("a.pagination__item--next::attr(href)").get()
        )
        if next_url:
            yield response.follow(
                next_url,
                callback=self.parse_products,
                meta={
                    "playwright": True,
                    "playwright_page_methods": [
                        PageMethod("wait_for_selector", "div.product-card__figure", timeout=30000)
                    ],
                },
            )


