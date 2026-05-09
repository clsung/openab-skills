---
name: article-share-pack
description: Use when the user provides an article, report, webpage, podcast page, news URL, or long-form source and asks for a shareable package with a Traditional Chinese summary, key bullet points, takeaway, and a mobile-friendly vertical infographic card, especially for Discord/OpenAB sharing.
---

# Article Share Pack

Create a complete share package from a source article: readable Traditional Chinese summary, key bullet points, a concise takeaway, and a mobile-first vertical image card.

Use this skill for requests like:
- "做中文摘要、重點條列再變圖卡"
- "整理成可以分享出去"
- "做文章分享包"
- "附摘要、重點條列、手機直式圖卡"
- "幫我把這篇文章做成 Discord/LINE/LinkedIn 分享素材"

If the user only asks for a plain image card from text, use `text-card` instead. If the user asks only for a text summary, summarize directly without forcing an image.

## Workflow

1. Resolve the source.
   - If a URL is provided, browse/fetch it and verify the content is readable.
   - Capture title, source, date, author/speaker, and URL when available.
   - Do not invent details. If the page is inaccessible, say so and use only supplied text.
   - For copyrighted sources, paraphrase and avoid long verbatim passages.

2. Produce the share text in Traditional Chinese by default.
   - `中文摘要`: 2-3 short paragraphs.
   - `重點條列`: 5-8 bullets, each with a bold short heading and one clear explanation.
   - `一句話 takeaway`: one concise sentence.
   - Keep the writing suitable for direct sharing in Discord, LINE, LinkedIn, Threads, or similar mobile feeds.

3. Prepare mobile card copy.
   - Use much less text than the full summary.
   - Target visible card text:
     - 1 headline
     - 1 short subtitle
     - 3-5 short points
     - 1 bottom takeaway
   - Prefer punchy nouns and verbs. Avoid paragraphs on the image.

4. Generate a mobile vertical card.
   - Default format: 4:5 vertical, approximately 1080x1350.
   - Use 9:16 only when the user asks for story/reel/shorts format.
   - Use 16:9 only when the user asks for slides, desktop presentation, or wide card.
   - Prefer `scripts/make-mobile-card.sh` for the default 4:5 card.

5. Verify the image.
   - Check PNG header, dimensions, and byte size.
   - Visually inspect when possible. If text is too dense or illegible, regenerate with fewer words.

6. Publish in Discord/OpenAB when context exists.
   - If `sender_context.thread_id` exists, upload to the thread; otherwise use `channel_id`.
   - Use a brief caption, then provide the share text in the conversation.
   - Upload with the peer `discord-img/scripts/send-discord-image.sh` script when available.

## Commands

Create the mobile image card:

```bash
/path/to/article-share-pack/scripts/make-mobile-card.sh \
  /path/to/card-input.txt \
  /home/node/article-share-card.png
```

The input should already be condensed for the card, not the full article.

Example card input:

```text
標題：AI 轉型：從雄心到優勢
副標：差距不在點子，而在規模化落地

1. 聚焦高槓桿戰場
2. 重塑工作流
3. 建立能力引擎
4. CEO 與團隊共責

Takeaway：AI 優勢來自組織肌肉。
```

Upload the resulting image to Discord:

```bash
/path/to/discord-img/scripts/send-discord-image.sh \
  "$THREAD_OR_CHANNEL_ID" \
  /home/node/article-share-card.png \
  "已整理成中文文章分享包。"
```

## Output Template

Use this structure in the final response or Discord message:

```markdown
**中文摘要**

...

**重點條列**

1. **...**
   ...

**一句話 takeaway**

...
```

Also report the local image path, dimensions/size, and upload status.
