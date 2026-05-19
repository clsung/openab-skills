# Vault Policy

Use this reference when deciding where a note belongs or how to shape a new shared Obsidian note.

## Folder Selection

- `AI/`: synthesized AI knowledge, model or vendor analysis, agent architecture, evaluation methods, AI governance, AI industry and investment analysis.
- `Notes/`: general reusable knowledge, personal knowledge management, meetings, ideas, learning notes, and cross-domain concepts.
- `Raw/`: minimally processed source material, transcripts, article captures, copied outlines, or material that still needs synthesis.
- `Prompts/`: prompts, reusable role instructions, analysis templates, and Copilot/Claude/OpenAI prompt assets.
- `Assets/`: images and binary files. Use subfolders named after the note slug when a note has multiple assets.
- `CTBC/`: organization-specific material that clearly belongs to that domain.

If two folders fit, choose the folder where future readers would search first. Add links from related notes instead of duplicating the content.

## Note Shapes

### Synthesized knowledge note

Use for finished or near-finished knowledge:

```markdown
---
title: Short Human Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - ai/agents
source:
aliases:
  - Alternate Name
---

# Short Human Title

## Summary

## Key Points

## Implications

## Related
```

### Source capture

Use for source-first material:

```markdown
---
title: Source Title
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - raw
source: https://example.com
aliases: []
---

# Source Title

## Source

## Extracted Notes

## Open Questions
```

### Prompt

Use for reusable prompt templates:

```markdown
---
title: Prompt Name
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - prompt
aliases: []
---

# Prompt Name

## Use When

## Prompt
```

## Naming

- Filenames should be readable in Traditional Chinese or English.
- Remove Markdown syntax, quotes, slashes, control characters, and excessive punctuation from filenames.
- Keep the basename short enough for cross-platform Git checkout.
- Prefer `Topic-YYYY-MM-DD.md` for time-sensitive analysis.
- Prefer stable evergreen names without dates for concepts that will be updated over time.

## Linking

- Link related vault notes with `[[Wiki Links]]`.
- Add a short `## Related` section when the note connects to existing concepts.
- Do not force backlinks into unrelated notes unless the user asks for graph maintenance.

## Collaboration

- Preserve existing voice unless the task is explicit rewriting.
- Avoid large formatting churn.
- Keep imported raw text separate from agent-written synthesis.
- If unsure about facts, mark them as assumptions or open questions.
