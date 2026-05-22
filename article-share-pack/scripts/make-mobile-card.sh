#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <input-text-file-or-> <output-png>" >&2
  exit 2
fi

input="$1"
output="$2"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_dir="$(cd "$script_dir/.." && pwd)"

if [ "$input" = "-" ]; then
  text="$(cat)"
else
  text="$(sed -n '1,220p' "$input")"
fi

if [ -z "${text//[[:space:]]/}" ]; then
  echo "Input text is empty" >&2
  exit 2
fi

generate_script=""
for candidate in \
  "$skill_dir/../discord-img/scripts/generate-codex-image.sh" \
  "$HOME/.codex/skills/discord-img/scripts/generate-codex-image.sh" \
  "/home/node/.codex/skills/discord-img/scripts/generate-codex-image.sh"; do
  if [ -x "$candidate" ]; then
    generate_script="$candidate"
    break
  fi
done

if [ -z "$generate_script" ]; then
  echo "Could not find discord-img/scripts/generate-codex-image.sh" >&2
  exit 1
fi

prompt=$(
  TEXT="$text" node <<'JS'
const text = process.env.TEXT.replace(/\s+/g, " ").trim();
const clipped = text.length > 1800 ? text.slice(0, 1800) + "..." : text;
console.log(`Create a polished mobile-first vertical infographic card from the content below.
Use Traditional Chinese for all visible text.
Aspect ratio 4:5 vertical, approximately 1080x1350 raster image.
Professional editorial social card for mobile sharing, high contrast, crisp large typography, spacious layout, no watermark, no logo.
Use a font with complete Traditional Chinese glyph coverage, such as Noto Sans CJK TC or an equivalent CJK font. Do not render missing-glyph boxes/tofu.
Make the exact visible text short and readable on a phone:
- one large headline
- one short subtitle
- 3 to 5 concise key points
- one bottom takeaway banner
Do not use paragraphs or tiny labels. Use a clear visual metaphor related to the topic.

CONTENT:
${clipped}`);
JS
)

if [ "${ARTICLE_SHARE_PACK_DRY_RUN:-0}" = "1" ]; then
  printf '%s\n' "$prompt"
  exit 0
fi

"$generate_script" "$prompt" "$output"
