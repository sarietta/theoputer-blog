# Project Overview

This is a Hugo-based blog that documents the process of building an 8-bit computer from scratch, named "Theoputer". The blog serves as a journal, educational resource, and personal project log. The content is written in Markdown and includes detailed explanations, diagrams, and personal anecdotes.

The blog uses the `hugo-theme-stack` theme and is configured with features like a table of contents, math rendering, and a comment system using Giscus.

The project also includes a set of custom web components built with Lit and TypeScript. These components provide interactive features for viewing content, such as an SVG viewer with panning and zooming capabilities.

## Development Conventions

### Content

*   Blog posts are located in the `content/posts` directory.
*   Each post is a Markdown file with a TOML front matter section for metadata (title, description, date, etc.).
*   Images and other static assets are stored in the `static` directory.

### Components

*   Custom web components are written in TypeScript using the Lit library.
*   The source code for the components is in the `components` directory.
*   The components are bundled using Rollup and the output is placed in the `static/js/components` directory.
*   The Rollup configuration is in `components/rollup.config.js`.
*   The TypeScript configuration is in `components/tsconfig.json`.

## Providing Feedback

If the users asks you to provide grammatical or spelling feedback on a
particular blog post, follow this procedure:

1. Read the contents of the relevant .md Markdown file
2. Read through the prose to understand the semantics of the blog post
3. Determine if there are cases where the user has used improper grammar, inconsistent narrative style, or made spelling mistakes
4. Propose all of the noted issues from (3), in batches that make sense for the user to read through and accept or reject
