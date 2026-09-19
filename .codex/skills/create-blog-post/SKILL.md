---
name: create-blog-post
description: Scaffolds a new blog post with frontmatter, markdown template, and image directory structure. Use when the user wants to create a new blog post, scaffold a blog entry, or set up a new coffee codex article.
---

# Create Blog Post

Scaffolds a new blog post following the Coffee Codex format with proper frontmatter, directory structure, and image folder.

## Usage

When the user requests to create a blog post, gather:
1. **Name/Slug**: The blog post identifier (e.g., "transactions-ii", "broadcast-algorithms")
2. **Description**: The blog post description for the frontmatter

## Workflow

1. **Generate the blog post file** at `src/content/blog/coffee-codex-{name}.md`
2. **Create the image directory** at `public/coffee-codex/{name}/`
3. **Set up frontmatter** with:
   - `title`: "Coffee Codex - {Title Case Name}"
   - `description`: User-provided description
   - `pubDate`: Current date in format "MMM DD, YYYY" (e.g., "Jan 24, 2026")
   - `heroImage`: "/coffee-codex/{name}/cover.png"
4. **Include template structure** with Introduction section

## Frontmatter Template

```yaml
---
title: "Coffee Codex - {Title Case Name}"
description: "{User-provided description}"
pubDate: "{Current date in 'MMM DD, YYYY' format}"
heroImage: "/coffee-codex/{name}/cover.png"
---
```

## Blog Post Template

```markdown
---
title: "Coffee Codex - {Title Case Name}"
description: "{User-provided description}"
pubDate: "{Current date in 'MMM DD, YYYY' format}"
heroImage: "/coffee-codex/{name}/cover.png"
---

## Introduction

{User-provided description or placeholder text}

![Coffee](/coffee-codex/{name}/coffee.jpg)

## References

- {Add references as needed}
```

## File Structure

After scaffolding, the following should exist:

```
src/content/blog/coffee-codex-{name}.md
public/coffee-codex/{name}/
```

## Name Formatting

- Convert the name to title case for the title (e.g., "transactions-ii" → "Transactions II")
- Keep the slug lowercase with hyphens for file and directory names
- Use the slug as-is for paths in frontmatter

## Date Format

Use the current date in format: "MMM DD, YYYY" (e.g., "Jan 24, 2026", "Mar 8, 2025")

## Example

**Input:**
- Name: "distributed-locks"
- Description: "Learning about distributed locking mechanisms"

**Output:**
- File: `src/content/blog/coffee-codex-distributed-locks.md`
- Directory: `public/coffee-codex/distributed-locks/`
- Frontmatter includes title "Coffee Codex - Distributed Locks"
- Hero image path: "/coffee-codex/distributed-locks/cover.png"
