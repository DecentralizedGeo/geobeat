# GeoBeat Documentation

This directory contains the source files for GeoBeat's documentation site, built with [Docusaurus](https://docusaurus.io/).

## Structure

```
docs/
├── docs/              # Documentation pages (Markdown)
│   ├── intro.md       # Introduction/landing page
│   ├── methodology.md # Index calculation methodology
│   ├── data-sources.md # Data source overview
│   └── api.md         # API reference (to be added)
├── blog/              # Blog posts (optional)
├── static/            # Static assets (images, etc.)
│   └── img/
└── README.md          # This file
```

## Setup (when ready to deploy)

```bash
cd docs
npm install
npm start  # Development server
npm run build  # Production build
```

## Writing Docs

All documentation pages are written in Markdown with frontmatter:

```markdown
---
sidebar_position: 1
title: Page Title
---

# Content here
```

Docusaurus will automatically generate sidebar navigation based on the file structure and `sidebar_position` values.

## Deployment

When ready to deploy, Docusaurus can be hosted on:
- GitHub Pages
- Vercel
- Netlify
- Any static site host
