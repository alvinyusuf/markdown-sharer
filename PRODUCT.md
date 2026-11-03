# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Readmeo serves developers, professionals, teams, educators, and individuals sharing technical documentation, meeting notes, reports, proposals, tutorials, and educational materials. Readers may be technical or non-technical and need only a browser.

## Product Purpose

Turn Markdown content into well-formatted, readable documents that can be shared through accessible public links. Success means authors can preview and share their content easily, and readers can read or follow a presentation without installing an editor or creating an account.

## Operating Context

- Account holders upload `.md` or `.markdown` files, preview the rendered content, and keep private drafts before explicitly publishing.
- Authors manage documents through the dashboard, edit content and metadata, copy links, unpublish, and delete documents.
- Readers open published links in a browser and can switch to presentation mode.
- Guests can upload through `/try` and share public links that expire after 24 hours. Accounts are required for persistent drafts.

## Capabilities and Constraints

- Preserve private account drafts and explicit publishing. Account uploads must not become public automatically; guest links are public and temporary.
- Published document URLs remain stable across updates. Unpublishing or deleting removes public access.
- Markdown remains the source content, with clean rendering of headings, tables, code, task lists, links, images, and Mermaid diagrams.
- Presentation mode uses the same sanitized content as the reading view, with section navigation and keyboard controls.
- Current documented limits are 2 MiB per document and 100 documents per account.
- Treat uploaded Markdown as untrusted input. Preserve sanitization, owner isolation, and database Row Level Security.
- Guest access expires at 24 hours; scheduled physical deletion follows within one minute, as documented in the README.

## Brand Commitments

The product is Readmeo, by Neoprism. Preserve these names unless the user explicitly changes them.

## Evidence on Hand

- `README.md` is the confirmed source of current product truth when it conflicts with the older draft in `specification.md`.
- `src/app/` and `src/components/` contain the existing marketing, authentication, dashboard, upload, public reading, and presentation interfaces.
- `tests/` contains validation, Markdown security, publishing, guest demo, and presentation-section checks.
- Marketing sample documents are demonstrations, not customer evidence. Do not turn them into customer claims.

## Product Principles

1. Keep content Markdown-first and preserve its meaning across preview, reading, and presentation.
2. Make publishing an intentional action and keep private drafts private.
3. Let readers access shared documents with only a browser.
4. Keep authoring and reading simple, fast, and responsive.
5. Preserve secure rendering and clear ownership boundaries.

## Accessibility & Inclusion

Provide an accessible reading experience for technical and non-technical audiences across desktop, tablet, and mobile. Preserve keyboard navigation for presentations. A specific conformance standard has not yet been established.
