# OpenAB Skills

Reusable Codex skills for OpenAB and Discord workflows.

## Available skills

- `discord-img`: generate raster images with Codex image generation and upload them back to the current Discord/OpenAB channel or thread.
- `text-card`: turn plain text, notes, transcripts, URLs, or articles into a readable infographic card.
- `article-share-pack`: turn articles, reports, webpages, or podcast pages into a Traditional Chinese summary, key bullets, takeaway, and mobile vertical card for sharing.
- `photo-story-video`: create short vertical videos from photos with reusable no-text video bases and deterministic text overlays.

## Install

Copy a skill directory into your Codex skills directory:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R discord-img "${CODEX_HOME:-$HOME/.codex}/skills/discord-img"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/discord-img/scripts/"*.sh
cp -R text-card "${CODEX_HOME:-$HOME/.codex}/skills/text-card"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/text-card/scripts/"*.sh
cp -R article-share-pack "${CODEX_HOME:-$HOME/.codex}/skills/article-share-pack"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/article-share-pack/scripts/"*.sh
cp -R photo-story-video "${CODEX_HOME:-$HOME/.codex}/skills/photo-story-video"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/photo-story-video/scripts/"*.mjs
```

For Discord uploads, configure a bot token in the runtime environment:

```bash
export DISCORD_FILE_BOT_TOKEN="..."
```

`DISCORD_BOT_TOKEN` is also accepted as a fallback.

For `photo-story-video`, AI motion generation requires `FAL_KEY`. Text rendering uses `ffmpeg`; set `PHOTO_STORY_FONT` when the default CJK font path is not available.
