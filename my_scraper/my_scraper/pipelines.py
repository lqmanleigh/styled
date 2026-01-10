import os
import uuid
from datetime import datetime
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import psycopg2
from psycopg2.extras import execute_values


def _normalize_db_url(db_url: str) -> str:
    """
    Strip unsupported ?schema=... from URLs to keep psycopg2 happy.
    """
    if not db_url or "schema=" not in db_url:
        return db_url
    parts = urlsplit(db_url)
    qs = parse_qsl(parts.query, keep_blank_values=True)
    new_qs = []
    for key, val in qs:
        if key.lower() == "schema":
            continue
        new_qs.append((key, val))
    new_query = urlencode(new_qs)
    return urlunsplit(parts._replace(query=new_query))


class DbStorePipeline:
    def open_spider(self, spider):
        self.batch = []
        self.enabled = True
        db_url = _normalize_db_url(os.getenv("DATABASE_URL"))
        if not db_url:
            self.enabled = False
            spider.logger.warning("DbStorePipeline disabled: DATABASE_URL not set")
            return
        try:
            self.conn = psycopg2.connect(db_url)
            self.cur = self.conn.cursor()
        except Exception as exc:
            self.enabled = False
            spider.logger.error(f"DbStorePipeline disabled: failed to connect ({exc})")

    def close_spider(self, spider):
        if not self.enabled:
            return
        self._flush()
        self.cur.close()
        self.conn.close()

    def process_item(self, item, spider):
        if not self.enabled:
            return item
        brand = item.get("brand") or {
            "products": "Aegis",
            "tomaz": "Tomaz",
            "smart_master": "Smart Master",
        }.get(spider.name)

        raw_scraped_at = item.get("scraped_at") or item.get("scrape_time")
        try:
            scraped_at = (
                raw_scraped_at
                if isinstance(raw_scraped_at, datetime)
                else datetime.fromisoformat(raw_scraped_at)  # may be a string
            )
        except Exception:
            scraped_at = datetime.utcnow()

        self.batch.append((
            str(uuid.uuid4()),
            item.get("name"),
            item.get("image"),
            item.get("url"),
            brand,
            scraped_at,
        ))
        if len(self.batch) >= 100:
            self._flush()
        return item

    def _flush(self):
        if not self.enabled or not self.batch:
            return
        sql = """
        INSERT INTO "Product" (id, name, image, url, brand, "scrapedAt")
        VALUES %s
        ON CONFLICT (url) DO UPDATE
          SET name = EXCLUDED.name,
              image = EXCLUDED.image,
              brand = EXCLUDED.brand,
              "scrapedAt" = EXCLUDED."scrapedAt";
        """
        execute_values(self.cur, sql, self.batch)
        self.conn.commit()
        self.batch.clear()
