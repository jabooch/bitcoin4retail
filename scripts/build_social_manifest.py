#!/usr/bin/env python3
import json, sys, re
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

SITE = "https://www.bitcoin4retail.com"
SITEMAP = f"{SITE}/sitemap.xml"
UA = "Bitcoin4RetailPublisher/1.0 (+https://www.bitcoin4retail.com)"

class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self._in_title = False
        self.description = ""
        self.h1 = ""
        self._in_h1 = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "h1" and not self.h1:
            self._in_h1 = True
        elif tag == "meta":
            name = (attrs.get("name") or attrs.get("property") or "").lower()
            if name in ("description", "og:description") and not self.description:
                self.description = attrs.get("content", "").strip()

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            self._in_h1 = False

    def handle_data(self, data):
        value = " ".join(data.split())
        if self._in_title and value:
            self.title += (" " if self.title else "") + value
        if self._in_h1 and value and not self.h1:
            self.h1 = value

def fetch(url):
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=20) as r:
        return r.read()

def clean(s):
    s = unescape(s or "")
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s*[|–—-]\s*Bitcoin4Retail\s*$", "", s, flags=re.I)
    return s

def shorten(s, limit):
    s = clean(s)
    if len(s) <= limit:
        return s
    cut = s[: limit - 1].rsplit(" ", 1)[0]
    return cut.rstrip(" ,.;:-") + "…"

def slug_label(url):
    path = urlparse(url).path.strip("/")
    if not path:
        return "Bitcoin for retail"
    return path.split("/")[-1].replace(".html", "").replace("-", " ").title()

def candidate_urls():
    root = ET.fromstring(fetch(SITEMAP))
    urls = []
    for loc in root.findall(".//{*}loc"):
        url = (loc.text or "").strip()
        if not url.startswith(SITE):
            continue
        path = urlparse(url).path
        if path in ("", "/"):
            continue
        if any(x in path.lower() for x in ["/privacy", "/terms", "/about", "/contact"]):
            continue
        urls.append(url)
    if not urls:
        raise SystemExit("No eligible URLs found in sitemap")
    return sorted(set(urls))

def page_meta(url):
    parser = MetaParser()
    parser.feed(fetch(url).decode("utf-8", "ignore"))
    headline = clean(parser.h1) or clean(parser.title) or slug_label(url)
    description = clean(parser.description)
    if not description:
        description = f"Practical guidance for retailers evaluating {slug_label(url).lower()}."
    return headline, description

def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/auto-manifest.json")
    now = datetime.now(timezone.utc)
    date = now.date().isoformat()
    urls = candidate_urls()
    index = now.date().toordinal() % len(urls)
    url = urls[index]
    headline, description = page_meta(url)

    headline_short = shorten(headline, 58)
    subheadline = shorten(description, 145)
    footer = "bitcoin4retail.com" + urlparse(url).path
    hook = shorten(description, 180)

    common = f"{headline_short}. {hook} Learn more: {url}"
    x_text = shorten(f"{headline_short}: {hook} {url}", 270)

    manifest = {
        "date": date,
        "approved": True,
        "testOnly": False,
        "sourceUrl": url,
        "render": {
            "date": date,
            "headline": headline_short,
            "subheadline": subheadline,
            "metric": "Practical Bitcoin payments for retail",
            "footer": footer
        },
        "posts": [
            {
                "service": "instagram",
                "text": common + " #Bitcoin #Retail #Payments",
                "mode": "shareNow",
                "source": "bitcoin4retail-auto"
            },
            {
                "service": "tiktok",
                "text": common + " #bitcoin #retail #payments",
                "mode": "shareNow",
                "source": "bitcoin4retail-auto"
            },
            {
                "service": "youtube",
                "youtubeTitle": shorten(headline_short + " | Bitcoin4Retail", 95),
                "text": common + " #Bitcoin #Retail #Shorts",
                "mode": "shareNow",
                "source": "bitcoin4retail-auto"
            },
            {
                "service": "twitter",
                "text": x_text,
                "mode": "shareNow",
                "source": "bitcoin4retail-auto"
            }
        ]
    }

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({"date": date, "url": url, "manifest": str(out), "count": len(urls)}))

if __name__ == "__main__":
    main()
