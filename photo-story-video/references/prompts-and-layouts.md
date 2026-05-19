# Prompts And Layouts

## Stage 1: No-Text Video Prompts

Generic image-to-video prompt:

```text
Animate this photo into a clean vertical video background with gentle cinematic motion.
Keep the original subject recognizable and stable. Add subtle light and atmospheric motion if appropriate.
No text, no letters, no captions, no watermark.
```

Corporate or anniversary visual prompt:

```text
Animate this corporate building photo into an elegant vertical greeting video background.
Keep the original building recognizable and stable. Use a slow cinematic camera push-in.
Add refined golden festive particles and very subtle fireworks in the upper sky.
No text, no letters, no captions, no watermark, no logo changes.
```

## Segment Planning

Plan each image as one segment. Keep visual generation separate from captions:

```text
Segment 1 image: opening building photo
Segment 1 prompt: slow push-in, warm evening light, no text
Segment 2 image: group/event photo
Segment 2 prompt: gentle parallax, soft celebratory light, no text
Segment 3 image: closing brand/product photo
Segment 3 prompt: elegant stable shot, refined particles, no text
```

## Stage 2: Caption Timeline

Add or revise text with time-coded captions:

```bash
--caption "0:1.8:回望 2025"
--caption "1.8:3.5:60 週年感謝"
--caption "3.5:5.2:邁向 2026\n繼續前行"
```

## Caption Patterns

For multiple photos:

```text
一路同行
重要時刻
感謝每一份信任
繼續前行
```

For anniversary or greeting videos:

```text
回望 2025
60 週年感謝
邁向 2026
繼續前行
```

## Long Text Summarization

Summarize semantically before rendering. Preserve exact names, dates, numbers, and claims.

```text
Raw: 今年是公司成立六十週年，感謝客戶、夥伴與同仁一路支持，讓我們能在挑戰中持續前進，邁向新的年度。
Caption 1: 60 週年感謝同行
Caption 2: 邁向新歲繼續前行
```
