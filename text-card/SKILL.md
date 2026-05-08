---
name: text-card
description: Turn plain text, notes, transcripts, URLs with extracted summaries, articles, meeting notes, or pasted content into a polished readable infographic card. Use when the user asks to make a 圖卡, infographic card, summary card, visual explainer, quick understanding image, or wants any provided text converted into an image card, especially in Discord/OpenAB contexts where the image should be uploaded back to the channel.
---

# Text Card

Create one raster infographic card from user-provided text. Favor clarity over decoration: extract the core message, compress supporting points, and generate a card that can be understood at a glance.

## Workflow

1. Resolve the input.
   - If the user pasted text, use it directly.
   - If the user provided a URL, retrieve enough reliable page/video metadata, transcript, or article text to understand it. Browse when the content may have changed or direct source verification matters.
   - If the input is long, summarize into: one headline, one short subtitle, 3-5 key points, and one takeaway.

2. Choose the card structure.
   - Use Traditional Chinese by default when the user writes in Chinese.
   - Use the user's language when clearly different.
   - Prefer these layouts:
     - Concept explainer: title, subtitle, three columns, bottom takeaway.
     - Process: title, 3-5 numbered steps, caution or result banner.
     - Comparison: title, two or three columns, decision rule.
     - Announcement/news: title, date/source, what happened, why it matters, next watch item.

3. Generate the image.
   - Prefer `scripts/make-text-card.sh` in this skill.
   - The script builds a concise image prompt and calls the existing Codex image generator helper from `discord-img`.
   - Keep the card text short. Image generation is less reliable with dense paragraphs or tiny labels.
   - Avoid logos unless the user explicitly requests them and usage is appropriate.
   - Avoid direct imitation of living artists or specific studios; describe visual traits instead.

4. Verify the PNG.
   - Read the PNG header and report width, height, and byte size.
   - If text legibility is visibly poor, regenerate with fewer words and larger type.

5. Upload when in Discord/OpenAB.
   - If `sender_context` has `thread_id`, upload to the thread; otherwise upload to `channel_id`.
   - Use `/home/node/.codex/skills/discord-img/scripts/send-discord-image.sh`.
   - Use a brief caption stating the card was generated from the supplied text.

## Command

```bash
/home/node/.codex/skills/text-card/scripts/make-text-card.sh \
  /path/to/input.txt \
  /home/node/text-card.png
```

To pass text through standard input:

```bash
printf '%s\n' "text to turn into a card" | \
  /home/node/.codex/skills/text-card/scripts/make-text-card.sh - /home/node/text-card.png
```

## Prompting Rules

- Require exact readable text in the image prompt.
- Use 16:9 landscape unless the user asks for another format.
- Keep visible text under about 90 Chinese characters or 130 English words.
- Include a clear visual metaphor related to the subject.
- Use high contrast, spacious layout, stable blocks, and no watermarks.
- Do not invent facts. If the source is uncertain, phrase the card as a high-level summary rather than a precise claim.

## Final Response

State the local image path, upload status, and observed dimensions/size. Keep it brief.
