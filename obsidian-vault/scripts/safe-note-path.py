#!/usr/bin/env python3
"""Propose a safe Obsidian Markdown path."""

from __future__ import annotations

import argparse
import re
import unicodedata


MAX_BASENAME_BYTES = 96
MAX_REL_PATH_BYTES = 180
MIN_SLUG_BYTES = 16


def byte_len(value: str) -> int:
    return len(value.encode("utf-8"))


def truncate_utf8(value: str, max_bytes: int) -> str:
    if byte_len(value) <= max_bytes:
        return value
    out = []
    used = 0
    for char in value:
        char_len = byte_len(char)
        if used + char_len > max_bytes:
            break
        out.append(char)
        used += char_len
    return "".join(out).rstrip("-_. ")


def clean_title(title: str) -> str:
    normalized = unicodedata.normalize("NFKC", title).strip()
    normalized = re.sub(r"[\x00-\x1f\x7f]", "", normalized)
    normalized = re.sub(r"[\\/:*?\"<>|#\[\]`]", " ", normalized)
    normalized = re.sub(r"[，,：:；;。！？!？、()（）{}]+", " ", normalized)
    normalized = re.sub(r"\s+", "-", normalized)
    normalized = re.sub(r"-{2,}", "-", normalized)
    normalized = normalized.strip(" .-_")
    return normalized or "Untitled"


def truncate_slug(slug: str, max_bytes: int) -> str:
    slug = truncate_utf8(slug, max_bytes)
    if byte_len(slug) <= max_bytes:
        return slug or "Untitled"
    return truncate_utf8(slug, max_bytes) or "Untitled"


def build_path(folder: str, title: str, date: str | None) -> str:
    folder = folder.strip("/ ")
    slug = clean_title(title)
    suffix = f"-{date}" if date else ""
    basename_budget = MAX_BASENAME_BYTES - byte_len(suffix) - byte_len(".md")
    slug = truncate_slug(slug, basename_budget)
    basename = f"{slug}{suffix}.md"
    rel_path = f"{folder}/{basename}" if folder else basename

    if byte_len(rel_path) > MAX_REL_PATH_BYTES:
        overhead = byte_len(folder) + (1 if folder else 0) + byte_len(suffix) + byte_len(".md")
        path_budget = max(MIN_SLUG_BYTES, MAX_REL_PATH_BYTES - overhead)
        slug = truncate_slug(slug, path_budget)
        basename = f"{slug}{suffix}.md"
        rel_path = f"{folder}/{basename}" if folder else basename
    return rel_path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--folder", default="Notes", help="Vault folder, e.g. AI, Notes, Raw, Prompts")
    parser.add_argument("--title", required=True, help="Human note title")
    parser.add_argument("--date", help="Optional YYYY-MM-DD suffix")
    args = parser.parse_args()
    print(build_path(args.folder, args.title, args.date))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
