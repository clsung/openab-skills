#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <input-text-file-or-> <output-png>" >&2
  exit 2
fi

input="$1"
output="$2"

if [ "$input" = "-" ]; then
  text="$(cat)"
else
  text="$(sed -n '1,240p' "$input")"
fi

if [ -z "${text//[[:space:]]/}" ]; then
  echo "Input text is empty" >&2
  exit 2
fi

prompt=$(
  TEXT="$text" node <<'JS'
const text = process.env.TEXT.replace(/\s+/g, " ").trim();
const clipped = text.length > 2200 ? text.slice(0, 2200) + "..." : text;
console.log(`Create a polished readable infographic card from the content below.
Use the same language as the content unless the user explicitly requested another language.
If the content is Chinese, use Traditional Chinese.
16:9 landscape raster image, professional editorial infographic, high contrast, spacious layout, crisp typography, no watermark, no logo unless present as a topic, no tiny text.
First infer the main message, then design the card with: one large headline, one short subtitle, 3 to 5 concise key points, and one bottom takeaway banner.
Make all visible text short and exact, not paragraphs. Use a visual metaphor that matches the topic.

CONTENT:
${clipped}`);
JS
)

if [ "${TEXT_CARD_DRY_RUN:-0}" = "1" ]; then
  printf '%s\n' "$prompt"
  exit 0
fi

/home/node/.codex/skills/discord-img/scripts/generate-codex-image.sh "$prompt" "$output"
