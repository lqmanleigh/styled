import json
import os
import subprocess
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
try:
    from zoneinfo import ZoneInfo
except ImportError:  # pragma: no cover
    ZoneInfo = None

# Project root where scrapy.cfg lives
BASE_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BASE_DIR.parent
FEED_DIR = BASE_DIR  # feeds are written in the scrapy project root
SUMMARY_FILE = ROOT_DIR / "last-scrape.json"
ENV_FILE = ROOT_DIR / ".env"


def load_env_file(path: Path):
    """Load key=value pairs from a .env file into os.environ (if not already set)."""
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        os.environ.setdefault(key, val)


def load_feed_count(spider_name: str) -> int:
    feed_path = FEED_DIR / f"{spider_name}.json"
    try:
        with open(feed_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return len(data) if isinstance(data, list) else 0
    except Exception:
        return 0


def write_summary(spider_statuses: dict, source: str = "run_all_spiders"):
    total_count = sum(load_feed_count(name) for name in spider_statuses.keys())
    overall_ok = all(status == "success" for status in spider_statuses.values())
    # Prefer tz database; fallback to UTC+8 if tzdata is missing
    if ZoneInfo:
        try:
            now_kl = datetime.now(ZoneInfo("Asia/Kuala_Lumpur"))
        except Exception:
            now_kl = datetime.now(timezone(timedelta(hours=8)))
    else:
        now_kl = datetime.now(timezone(timedelta(hours=8)))

    ts_display = now_kl.strftime("%d/%m/%Y %H:%M:%S %Z")
    ts_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    payload = {
        "status": "success" if overall_ok else "partial",
        "timestamp": ts_display,
        "timestamp_utc": ts_utc,
        "source": source,
        "spiders": spider_statuses,
        "count": total_count,
    }
    SUMMARY_FILE.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def main():
    load_env_file(ENV_FILE)

    now = datetime.now()
    scrape_time = now.isoformat()
    scrape_run_id = now.strftime("%Y%m%d_%H%M%S")

    print("======================================")
    print("ADMIN SCRAPE STARTED")
    print(f"Scrape Run ID : {scrape_run_id}")
    print(f"Scrape Time   : {scrape_time}")
    print("======================================")

    spiders = [
        "products",      # Aegis / LocalLab
        "tomaz",         # Tomaz
        "smart_master",  # SmartMaster
    ]

    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONPATH"] = os.pathsep.join([str(BASE_DIR), env.get("PYTHONPATH", "")]).strip(os.pathsep)

    statuses = {}
    had_failure = False

    for spider in spiders:
        print(f"\nRunning spider: {spider}")
        try:
            subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "scrapy",
                    "crawl",
                    spider,
                    "-a",
                    f"scrape_time={scrape_time}",
                ],
                check=True,
                cwd=str(BASE_DIR),
                env=env,
            )
            statuses[spider] = "success"
        except subprocess.CalledProcessError as exc:
            had_failure = True
            statuses[spider] = f"failed (exit {exc.returncode})"
            print(f"[ERROR] Spider {spider} failed with exit code {exc.returncode}")
        except Exception as exc:  # pragma: no cover - defensive
            had_failure = True
            statuses[spider] = f"failed ({exc})"
            print(f"[ERROR] Spider {spider} failed: {exc}")

    write_summary(statuses)

    print("\nALL SPIDERS COMPLETED")
    print(f"Final Scrape Run ID: {scrape_run_id}")
    if had_failure:
        print("One or more spiders failed. See last-scrape.json for details.")
        sys.exit(1)


if __name__ == "__main__":
    main()
