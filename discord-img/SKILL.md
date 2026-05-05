---
name: discord-img
description: Generate raster images with Codex imagegen and upload them to a Discord/OpenAB channel or thread. Use when the user asks to create, generate, draw, or make an image and expects it returned in Discord; also use when uploading an existing local image to the current Discord context. Preserves the generated image size by default.
---

# Discord Img

Generate an image with Codex imagegen, keep the generated size as-is, verify basic metadata, and upload it to the Discord channel from OpenAB sender context.

## Workflow

1. Generate the image.
   - Use `scripts/generate-codex-image.sh` before considering any fallback.
   - The helper calls `codex exec --enable image_generation`, waits for a new file under `$CODEX_HOME/generated_images` or `$HOME/.codex/generated_images`, and copies it to the requested workspace path.
   - It has timeout/retry controls: `IMGGEN_TIMEOUT_SEC` defaults to `150`; `IMGGEN_RETRIES` defaults to `2`.
   - Do not require an `imagegen` or `image_gen` shell command. Missing `.codex/skills/.system/imagegen/SKILL.md` does not mean imagegen is unavailable.
   - If the helper fails after retries, report that imagegen failed before using any fallback.
   - Avoid direct imitation of living artists or specific studios; rephrase style requests into broader visual traits.

2. Keep original size.
   - Do not resize or crop by default.
   - If the user requests a precise size, ask whether resizing is acceptable or resize only after generation if clearly requested.

3. Verify before upload.
   - Confirm the generated source is under `generated_images` when handling a new generation request.
   - Read PNG headers when possible and report width, height, and byte size.
   - If the selected image was not produced by Codex imagegen, say so explicitly.

4. Upload to Discord.
   - Use `thread_id` from `sender_context` when present; otherwise use `channel_id`.
   - Use `DISCORD_FILE_BOT_TOKEN` first, otherwise `DISCORD_BOT_TOKEN`.
   - Never print token values.
   - Use `scripts/send-discord-image.sh`.

## Imagegen Command

```bash
${CODEX_HOME:-$HOME/.codex}/skills/discord-img/scripts/generate-codex-image.sh \
  "prompt text" \
  ./generated-image.png
```

## Upload Command

```bash
${CODEX_HOME:-$HOME/.codex}/skills/discord-img/scripts/send-discord-image.sh \
  <channel_or_thread_id> \
  ./generated-image.png \
  "Here is the generated image"
```

## PNG Header Check

```bash
node - <<'JS' /path/to/image.png
const fs = require("fs");
const p = process.argv[2];
const b = fs.readFileSync(p);
console.log({ path: p, signature: b.subarray(0,8).toString("hex"), width: b.readUInt32BE(16), height: b.readUInt32BE(20), bytes: b.length });
JS
```

## Final Response

State the local path, whether the image was uploaded to Discord, and the observed dimensions/size. Keep the response brief.
