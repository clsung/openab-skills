# OpenAB Skills

Reusable Codex skills for OpenAB and Discord workflows.

## Available skills

- `discord-img`: generate raster images with Codex image generation and upload them back to the current Discord/OpenAB channel or thread.
- `text-card`: turn plain text, notes, transcripts, URLs, or articles into a readable infographic card.
- `article-share-pack`: turn articles, reports, webpages, or podcast pages into a Traditional Chinese summary, key bullets, takeaway, and mobile vertical card for sharing.
- `obsidian-vault`: maintain shared Obsidian Markdown vaults with safe filenames, tags, links, and provenance.

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
cp -R obsidian-vault "${CODEX_HOME:-$HOME/.codex}/skills/obsidian-vault"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/obsidian-vault/scripts/"*.py
```

For Discord uploads, configure a bot token in the runtime environment:

```bash
export DISCORD_FILE_BOT_TOKEN="..."
```

`DISCORD_BOT_TOKEN` is also accepted as a fallback.
