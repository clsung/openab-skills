#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "usage: $0 <prompt> [destination_image]" >&2
  exit 2
fi

prompt="$1"
destination="${2:-}"
codex_home="${CODEX_HOME:-${HOME}/.codex}"
generated_dir="${codex_home}/generated_images"
workdir="${CODEX_IMAGEGEN_WORKDIR:-$PWD}"
timeout_sec="${IMGGEN_TIMEOUT_SEC:-150}"
retries="${IMGGEN_RETRIES:-2}"
marker="$(mktemp)"
out_log="$(mktemp)"

cleanup() {
  rm -f "$marker" "$out_log"
}
trap cleanup EXIT

mkdir -p "$generated_dir"

find_newest() {
  find "$generated_dir" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) -newer "$marker" -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -n 1 | cut -d' ' -f2-
}

run_attempt() {
  local attempt="$1"
  local attempt_prompt="$prompt"
  if [ "$attempt" -gt 1 ]; then
    attempt_prompt="Create one high-quality raster image. ${prompt}. Keep the prompt concise, no text, no watermark."
  fi
  : >"$out_log"
  timeout --kill-after=10s "${timeout_sec}s" codex exec \
    --full-auto \
    --skip-git-repo-check \
    --enable image_generation \
    -C "$workdir" \
    "Generate one raster image using the built-in image generation flow. Prompt: ${attempt_prompt}. Save or expose the generated image in ${generated_dir}. Do not create programmatic placeholder art. Do not edit code." \
    >"$out_log" 2>&1
}

newest=""
for attempt in $(seq 1 "$retries"); do
  if run_attempt "$attempt"; then
    newest="$(find_newest)"
    if [ -n "$newest" ]; then
      break
    fi
    echo "codex exec completed but no new generated image was found on attempt $attempt." >&2
  else
    status="$?"
    if [ "$status" -eq 124 ] || [ "$status" -eq 137 ]; then
      echo "codex imagegen timed out after ${timeout_sec}s on attempt $attempt." >&2
    else
      echo "codex imagegen failed with status $status on attempt $attempt." >&2
    fi
  fi
done

if [ -z "$newest" ]; then
  cat "$out_log" >&2
  echo "No generated image file appeared under $generated_dir after $retries attempt(s)." >&2
  exit 1
fi

if [ -n "$destination" ]; then
  cp "$newest" "$destination"
  printf '%s\n' "$destination"
else
  printf '%s\n' "$newest"
fi
