import scrapy

class ProductsSpider(scrapy.Spider):
    name = "products"
    start_urls = ["https://locallab.com.my/collections/aegis"]

    async def parse(self, response):
        # Enable Playwright for this request
        yield scrapy.Request(
            url=self.start_urls[0],
            callback=self.parse_products,
            meta={"playwright": True},
        )

    def parse_products(self, response):
        # Select all product items (adjust selector if needed)
        for product in response.css("div.product-card__figure"):
            yield {
                "name": product.css("img::attr(alt)").get(),
                "image": response.urljoin(product.css("img::attr(src)").get()),
                "url": response.urljoin(product.css("a::attr(href)").get()),
            }


