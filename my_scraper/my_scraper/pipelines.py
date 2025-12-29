from urllib.parse import urljoin
from scrapy.exceptions import DropItem


class NormalizeAndDedupePipeline:
  def __init__(self):
    self.seen = set()

  def process_item(self, item, spider):
    name = (item.get("name") or "").strip()
    url = item.get("url")
    image = item.get("image")

    # Normalize URLs relative to the spider's first start_url
    base = spider.start_urls[0] if getattr(spider, "start_urls", None) else ""
    if url:
      url = urljoin(base, url)
    if image:
      image = urljoin(base, image)

    # Dedup key: prefer URL, fall back to (name, image)
    key = url or (name, image)
    if key in self.seen:
      raise DropItem("duplicate")
    self.seen.add(key)

    item["name"] = name or None
    item["url"] = url
    item["image"] = image
    return item
