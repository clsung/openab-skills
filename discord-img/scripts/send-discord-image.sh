#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "usage: $0 <channel_or_thread_id> <image_path> [message]" >&2
  exit 2
fi

channel_id="$1"
image_path="$2"
message="${3:-Here is the generated image}"
token="${DISCORD_FILE_BOT_TOKEN:-${DISCORD_BOT_TOKEN:-}}"

if [ -z "$token" ]; then
  echo "DISCORD_FILE_BOT_TOKEN or DISCORD_BOT_TOKEN is required" >&2
  exit 1
fi

if [ ! -f "$image_path" ]; then
  echo "image not found: $image_path" >&2
  exit 1
fi

curl -sS -X POST "https://discord.com/api/v10/channels/${channel_id}/messages" \
  -H "Authorization: Bot ${token}" \
  -F "content=${message}" \
  -F "files[0]=@${image_path}"
