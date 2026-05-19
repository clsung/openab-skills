---
name: photo-story-video
description: "Two-stage workflow for creating short vertical videos from one or more photos: (1) generate reusable no-text video segments from images with fal.ai or deterministic slideshow rendering, including segmented editing and concatenation, and (2) add or revise readable Chinese/English text overlays on existing videos without regenerating video. Use when the user provides photos, image URLs, captions, notes, long text, anniversary copy, greetings, event memories, product photos, travel photos, or asks to turn images into a video/story/reel with editable text."
---

# Photo Story Video

## Overview

Use a two-stage pipeline:

1. **Image-to-video base layer**: generate or assemble reusable no-text video segments from one or more photos.
2. **Text overlay layer**: add, revise, summarize, or re-time captions on top of an existing video.

This separation avoids regenerating expensive AI video when only the wording changes. Never ask AI video models to render text; render text deterministically afterward.

## Stage 1: Image-To-Video Base

Use this stage when the user gives photos and wants motion, atmosphere, or a video base.

Options:

- AI motion per image: use `scripts/fal_image_to_video.mjs` for a single image.
- Multi-segment AI motion: use `scripts/fal_segmented_image_to_video.mjs` to generate one no-text clip per image and concatenate them.
- Fast deterministic slideshow: use `scripts/render_photo_story_video.mjs` with no/empty captions, or use it when AI motion is unnecessary.

Guidelines:

- Keep base videos text-free: no titles, no captions, no generated letters.
- Save segment outputs when useful; they are reusable editing assets.
- Name outputs clearly, e.g. `story-base.mp4`, `segments/001.mp4`, `segments/002.mp4`.
- If a public URL fails in fal, download locally first and upload through fal storage.

Segmented fal example:

```bash
FAL_KEY="$FAL_KEY" node ${CODEX_HOME:-$HOME/.codex}/skills/photo-story-video/scripts/fal_segmented_image_to_video.mjs \
  --image ./photo1.jpg --prompt "slow cinematic push-in, warm light, no text" \
  --image ./photo2.jpg --prompt "gentle camera movement, subtle particles, no text" \
  --output ./story-base.mp4 \
  --segments-dir ./segments
```

Single image fal example:

```bash
FAL_KEY="$FAL_KEY" node ${CODEX_HOME:-$HOME/.codex}/skills/photo-story-video/scripts/fal_image_to_video.mjs \
  --image ./building.jpg \
  --output ./animated-bg.mp4
```

## Stage 2: Add Or Revise Text

Use this stage whenever the video already exists and the user wants wording changes, additional captions, timing changes, anniversary copy, subtitles, title cards, or shorter text.

Use `scripts/overlay_timed_text.mjs` for a time-coded caption layer:

```bash
node ${CODEX_HOME:-$HOME/.codex}/skills/photo-story-video/scripts/overlay_timed_text.mjs \
  --input ./story-base.mp4 \
  --output ./story-final.mp4 \
  --caption "0:1.8:回望 2025" \
  --caption "1.8:3.5:60 週年感謝" \
  --caption "3.5:5.2:邁向 2026\n繼續前行"
```

Captions are `start:end:text`, with seconds as numbers. Use `\n` inside text for line breaks.

The script automatically wraps/shortens overlong captions as a fallback. Before rendering, summarize long user text semantically and preserve exact names, dates, years, prices, and milestone numbers.

## Caption Rules

Prefer compact captions:

```text
回望 2025
60 週年感謝
邁向 2026
繼續前行
```

For multi-photo stories:

```text
一路同行
重要時刻
感謝每一份信任
繼續前行
```

Long text should become short captions before rendering:

```text
Raw: 今年是公司成立六十週年，感謝客戶、夥伴與同仁一路支持，讓我們能在挑戰中持續前進，邁向新的年度。
Caption: 60 週年感謝同行
Caption: 邁向新歲繼續前行
```

## Editing Principle

If the user changes only text, timing, font, color, or captions, do **not** rerun fal. Reuse the existing base MP4 and rerun only `overlay_timed_text.mjs`.

If the user changes the photo motion, visual style, fireworks, camera movement, or generated background itself, rerun Stage 1 only for affected segments, then concatenate and rerun Stage 2.

## References

- Read `references/prompts-and-layouts.md` for prompt, segmentation, and caption examples.
- Read `references/openab-discord-upload.md` for Discord/OpenAB upload.
