#!/usr/bin/env python3
"""Check the built site's internal links: every absolute-path href
resolves to a built page (or asset), and every fragment resolves to
an anchor in the target page. Run after `npm run build` (expects
dist/). Exit 1 on any broken link — a docs page pointing at a page
that does not exist is a broken manual."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import urlparse

DIST = Path(__file__).resolve().parent.parent / "dist"


def main() -> int:
    if not DIST.is_dir():
        print("check-links: no dist/ — run `npm run build` first")
        return 1
    pages = {p.relative_to(DIST).as_posix() for p in DIST.rglob("index.html")}
    anchors = {
        page: set(re.findall(r'id="([^"]+)"', (DIST / page).read_text()))
        for page in pages
    }
    broken = []
    for page in sorted(pages):
        for href in set(re.findall(r'href="(/[^"]*)"', (DIST / page).read_text())):
            parsed = urlparse(href)
            if parsed.scheme or parsed.netloc:
                continue
            path = parsed.path.rstrip("/")
            target = (path.lstrip("/") + "/index.html") if path else "index.html"
            if target in pages:
                if parsed.fragment and parsed.fragment not in anchors[target]:
                    broken.append(f"{page} -> {href} (missing anchor)")
            elif (DIST / parsed.path.lstrip("/")).is_file():
                continue
            else:
                broken.append(f"{page} -> {href}")
    print(f"check-links: {len(pages)} pages, {len(broken)} broken internal links")
    for link in broken:
        print("  ", link)
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
