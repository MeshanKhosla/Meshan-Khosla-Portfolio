---
name: scaffold-blog-post
description: Creates a new Coffee Codex blog post with frontmatter, a Markdown starter, and a Git-tracked image directory. Use when the user wants to scaffold a blog entry or start a new Coffee Codex article.
---

# Scaffold a blog post

Create a new blog post that follows the Coffee Codex format.

## Required input

Determine these values from the user's request:

1. **Name or slug:** The post identifier, such as `transactions-ii` or `broadcast-algorithms`.
2. **Description:** A short description for the frontmatter and introduction.

Infer either value from a supplied source or topic when the user's intent is clear. Ask only when a missing value would materially change the post.

## Workflow

1. Create `src/content/blog/coffee-codex-{name}.md`.
2. Create `public/coffee-codex/{name}/`.
3. Add an empty `public/coffee-codex/{name}/.gitkeep` so Git tracks the image directory.
4. Add frontmatter with:
   - `title`: `Coffee Codex - {Title Case Name}`
   - `description`: The post description
   - `pubDate`: The current date in `MMM DD, YYYY` format
   - `heroImage`: `/coffee-codex/{name}/cover.png`
5. Add an introduction, a coffee image placeholder, and a references section.

## Post template

```markdown
---
title: "Coffee Codex - {Title Case Name}"
description: "{Description}"
pubDate: "{Current date in MMM DD, YYYY format}"
heroImage: "/coffee-codex/{name}/cover.png"
---

## Introduction

{Description or introductory text}

![Coffee](/coffee-codex/{name}/coffee.jpg)

## References

- {Add references as needed}
```

## Output

```text
src/content/blog/coffee-codex-{name}.md
public/coffee-codex/{name}/.gitkeep
```

Keep the slug lowercase and hyphenated. Convert it to title case for the title. For example, `transactions-ii` becomes `Transactions II`.

## Example

For the name `distributed-locks` and description `Learning about distributed locking mechanisms`, create:

```text
src/content/blog/coffee-codex-distributed-locks.md
public/coffee-codex/distributed-locks/.gitkeep
```

Use `Coffee Codex - Distributed Locks` as the title and `/coffee-codex/distributed-locks/cover.png` as the hero image path.
