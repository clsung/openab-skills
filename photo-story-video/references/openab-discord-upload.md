# OpenAB Discord Upload

Use when the user asks to upload the generated MP4 back to a Discord/OpenAB channel or thread.

OpenAB does not proxy attachments. Upload files directly to Discord REST:

```bash
curl -sS -X POST "https://discord.com/api/v10/channels/<channel-or-thread-id>/messages" \
  -H "Authorization: Bot ${DISCORD_BOT_TOKEN}" \
  -F "content=<message>" \
  -F "files[0]=@/absolute/path/to/video.mp4"
```

Rules:

- Use `thread_id` from sender context when present; otherwise use `channel_id`.
- Require `DISCORD_BOT_TOKEN` in the environment; never paste or print it.
- Check file size before upload. Keep MP4 under the guild/account upload limit; for broad compatibility target under 25 MB.
- Upload final MP4, not source images or intermediate fal outputs, unless the user asks.
