# OpenAB Skills

Reusable Codex skills for OpenAB and Discord workflows.

## Available skills

- `discord-img`: generate raster images with Codex image generation and upload them back to the current Discord/OpenAB channel or thread.

## Install

Copy a skill directory into your Codex skills directory:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R discord-img "${CODEX_HOME:-$HOME/.codex}/skills/discord-img"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/discord-img/scripts/"*.sh
```

For Discord uploads, configure a bot token in the runtime environment:

```bash
export DISCORD_FILE_BOT_TOKEN="..."
```

`DISCORD_BOT_TOKEN` is also accepted as a fallback.
