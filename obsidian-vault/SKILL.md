---
name: obsidian-vault
description: Work with a shared Obsidian Markdown vault such as github.com/clsung/obsidian. Use when the user asks to add, organize, summarize, refactor, link, deduplicate, tag, or maintain knowledge notes in an Obsidian vault, especially collaborative AI/notes/prompts repositories.
---

# Obsidian Vault

Maintain a shared Obsidian Markdown vault with conservative edits, stable filenames, useful links, and clear provenance.

## Default Vault

- Default remote: `https://github.com/clsung/obsidian.git`
- Default local path if absent: `/home/node/obsidian`
- If the repo is already checked out elsewhere, use the user's path.
- Before editing, check `git status --short` and preserve unrelated user changes.

## Workflow

1. Resolve the task and vault location.
   - If no path is given, use `/home/node/obsidian` when it exists.
   - If no checkout exists, clone the default remote.
   - If checkout fails because of an overlong filename, use sparse checkout or GitHub API operations for the needed files, and report the blocking path.

2. Inspect before changing.
   - Search existing notes with `rg` for the main title, aliases, source URL, and obvious keywords.
   - Prefer updating or linking an existing note over creating a duplicate.
   - Read nearby notes in the target folder to match style, frontmatter, and naming.

3. Choose the note type.
   - `AI/`: AI systems, agents, model news, architecture, evaluations, investment/industry analysis.
   - `Notes/`: general personal knowledge, meeting notes, evergreen concepts, daily or temporary notes.
   - `Raw/`: source captures, transcripts, long excerpts, imported articles before synthesis.
   - `Prompts/`: reusable prompts and prompt templates.
   - `Assets/`: images and binary assets referenced by notes.
   - For detailed policy, read `references/vault-policy.md`.

4. Create or edit Markdown.
   - Use Traditional Chinese by default when the user writes in Chinese.
   - Add concise frontmatter when creating new synthesized notes:
     `title`, `created`, `updated`, `tags`, `source`, `aliases`.
   - Keep source captures and synthesized conclusions distinct.
   - Use Obsidian wiki links for internal references: `[[Note Title]]`.
   - Use normal Markdown links for external sources.
   - Do not invent bibliographic facts, dates, or source claims.

5. Use safe filenames.
   - Avoid very long names; target <= 96 UTF-8 bytes for the basename and <= 180 UTF-8 bytes for the relative path.
   - Prefer descriptive short slugs plus date when useful.
   - Use `scripts/safe-note-path.py` to propose paths for new notes.

6. Validate.
   - Run `git status --short`.
   - For created notes, verify referenced local assets exist.
   - Search for duplicate title/source.
   - If committing or pushing is requested, do that explicitly; otherwise leave changes uncommitted.

## Commands

Propose a safe path:

```bash
/home/node/.codex/skills/obsidian-vault/scripts/safe-note-path.py \
  --folder AI \
  --title "Title of the note" \
  --date 2026-05-19
```

Search for likely duplicates:

```bash
rg -n "title|source-url|main keyword" /path/to/vault
```

## Final Response

State what files changed, whether validation passed, and any repo-level blockers such as checkout failures or filename issues. Keep it brief.
