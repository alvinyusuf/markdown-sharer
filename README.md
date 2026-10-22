# MarkdownShare

Upload a Markdown file, preview the rendered document, and share it with a link.
This repository currently implements **Phase 1–4** of
[`specification.md`](./specification.md): foundation, authentication, Markdown upload,
persistent drafts, preview, publishing, the public viewer at `/p/[slug]`, document
management, and presentation mode.

Hardening and deployment are the next milestones. The app never makes a document
public on upload — publishing is always an explicit action.

## Stack

- Next.js 16.4 (App Router, Cache Components, PPR)
- React 19 + TypeScript (strict)
- Tailwind CSS 4 + shadcn/ui (Base UI)
- Supabase Auth + PostgreSQL + Row Level Security
- `unified` / `remark` / `rehype` for Markdown, rendered as React elements
- `mermaid` for diagrams, drawn in the browser on demand
- Vitest for unit and security tests

## Requirements

- Node.js 20.9+ (this repo is developed on Node 24)
- pnpm 12+
- A Supabase project (remote is fine; Docker is not required)

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Fill `.env.local` from **Supabase → Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The anon/publishable key is safe to expose; RLS enforces access. **Never** put a
service-role key in this project — the app does not need one.

### Apply the database migration

Either paste
[`supabase/migrations/20261021000000_create_documents.sql`](./supabase/migrations/20261021000000_create_documents.sql)
into the Supabase SQL Editor, or link the CLI and push:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

The migration creates the `documents` table, constraints, indexes, timestamp and limit
triggers, and RLS policies.

### Auth configuration

In Supabase → Authentication → URL Configuration:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

For local development you can disable email confirmation. If it stays enabled, the
confirmation link returns to `/auth/callback` and then `/dashboard`.

### Run

```bash
pnpm dev
```

Open <http://localhost:3000>. Without Supabase variables the app renders a setup notice
instead of crashing.

## Scripts

| Command             | Purpose                          |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Start the dev server             |
| `pnpm build`        | Production build                 |
| `pnpm start`        | Serve the production build       |
| `pnpm lint`         | ESLint                           |
| `pnpm typecheck`    | `tsc --noEmit`                   |
| `pnpm test`         | Vitest unit and security tests   |
| `pnpm test:watch`   | Vitest in watch mode             |
| `pnpm verify:rls`   | Live RLS checks against Supabase |
| `pnpm format`       | Prettier write                   |
| `pnpm format:check` | Prettier check                   |

## Routes

| Route                            | Access | Purpose                                       |
| -------------------------------- | ------ | --------------------------------------------- |
| `/`                              | Public | Marketing page with a real rendered sample    |
| `/login`, `/signup`              | Public | Email/password auth                           |
| `/auth/callback`                 | Public | Code/token exchange for email links           |
| `/dashboard`                     | Owner  | List documents, publish, unpublish, delete    |
| `/dashboard/new`                 | Owner  | Upload and create a draft                     |
| `/dashboard/documents/[id]`      | Owner  | Preview, edit metadata, publish, copy link    |
| `/dashboard/documents/[id]/edit` | Owner  | Replace or edit Markdown source               |
| `/p/[slug]`                      | Public | Published document, readable without login    |
| `/p/[slug]/sections`             | Public | Presentation sections of a published document |
| `/p/[slug]/opengraph-image`      | Public | Social preview image for a document           |

## Security model

- Raw HTML in Markdown is **never parsed** (`remark-rehype` runs without
  `allowDangerousHtml`). The tree is also passed through `rehype-sanitize`.
- The app renders React elements with `hast-util-to-jsx-runtime`. The single
  place that uses `dangerouslySetInnerHTML` is the Mermaid diagram: the SVG is
  built by Mermaid itself from a source that the pipeline keeps as plain text,
  and Mermaid runs that SVG through DOMPurify (`securityLevel: "strict"`) before
  returning it.
- `javascript:`, `data:`, and `file:` URLs are removed by the sanitizer. External links
  get `rel="noopener noreferrer nofollow"`.
- Uploads are validated twice: extension/size/UTF-8 in the browser, then size, title,
  description, and content again in the Server Action.
- Every query and mutation scopes by `owner_id`; RLS is the second boundary.
- Deleting a document is a hard delete: the row and its content are removed for good.
  It needs an explicit confirmation, and only the owner can trigger it. The public link
  stops working immediately because the proxy looks the slug up in the database.
- Public rendering uses a cookieless Supabase client so it can never see a draft
  belonging to a signed-in visitor. The public response never selects `owner_id`.
- The proxy rejects `/p/{slug}` for documents that are not published, so a missing or
  unpublished link answers with a real `404` instead of a streamed `200`.
- The presentation endpoint only serves published documents, and the sections are cut
  from the sanitized tree, so a presentation shows exactly what the normal view shows.
- No external URL is fetched server-side, so Markdown images cannot become an SSRF
  vector.

## Database notes

- Content is stored as text (no Supabase Storage bucket).
- Maximum document size is 2 MiB measured as UTF-8 bytes.
- Maximum 100 documents per user, enforced in the server action **and** by a trigger.
- Slug format: `title-slug-<8 hex chars>`, unique with retry on collision. Updates keep
  the same slug.
- `updated_at` is maintained by a trigger; `owner_id` is immutable.
- RLS: owners read all their own rows; anonymous users read only `published` rows.

## Presentation mode

A reader can start a presentation from the public viewer. The document is shown one
section at a time, full screen, with previous and next buttons, a progress indicator,
and keyboard navigation (`←` previous, `→` next, `Esc` leaves the presentation).

- **Sections come from the same sanitized tree as the normal view.** The content is
  never re-parsed or changed, only the way it is displayed. A test asserts that
  concatenating every section reproduces the original blocks exactly.
- **Splitting rule:** the document is cut at every `H1` and `H2`. Content before the
  first heading becomes an untitled first section. When a document has no `H1` or `H2`
  at all, the fallback rule cuts after roughly 1500 characters of text or 12 top level
  blocks, whichever comes first.
- **The renderer is loaded on demand.** The viewer is imported when the reader presses
  "Present", so a reader who only wants to read a document never downloads the
  presentation renderer.
- The sections are served by `/p/[slug]/sections`, which only answers for published
  documents.

## Diagrams

A fenced code block with the `mermaid` language is drawn as a diagram instead of
being shown as code.

- **The block is found in the Markdown pipeline.** A `pre > code.language-mermaid`
  block becomes a `mermaid-diagram` element that holds the source as plain text.
  The transform runs after the sanitizer, in the same trusted stage as the
  heading anchors and the syntax highlighting, and before the highlighter, so a
  diagram is never sent to highlight.js.
- **Mermaid is loaded on demand.** The library is imported by the browser only
  when a document actually contains a diagram, so a document without diagrams
  never downloads it. The same component is used by the public viewer, the
  dashboard preview, and the presentation mode.
- **The source stays text.** `%%{ ... }%%` directives are removed, because a
  directive can rewrite the Mermaid configuration. The diagram is drawn with
  `securityLevel: "strict"`, which sanitizes the SVG with DOMPurify and turns off
  scripts, click handlers, and HTML labels.
- **A broken diagram does not lose content.** When Mermaid cannot draw the
  diagram, the reader sees a short error message and the original source.

## Publishing, deleting, and caching

- `publishDocumentAction` / `unpublishDocumentAction` / `deleteDocumentAction` are Server
  Actions. They verify the session, the ownership, and the current status before
  touching the row, and they set `published_at` together with the status so the
  database check constraint holds.
- The public document and its rendered Markdown tree are cached with `"use cache"` and
  a `document:{slug}` tag. Every mutation that changes what a reader sees
  (publish, unpublish, delete, content, metadata) calls `updateTag()` for that tag, so
  the next reader gets the new content — or a 404 after an unpublish or a delete.
- The slug never changes after a document is created, so the public URL stays stable
  across updates.

## Tests

```bash
pnpm test
```

Coverage includes file validation, UTF-8 decoding, slug generation, safe redirects,
auth schema validation, GFM rendering, heading anchors, external link attributes, and
XSS payloads (script tags, event handlers, `javascript:` links, iframes, SVG, data URLs,
oversized documents). It also covers the publishing helpers: public URLs, meta
descriptions, Open Graph metadata, and cache tags, plus the presentation rules: heading
splits, the fallback split, and the guarantee that splitting never changes the content.
Mermaid code blocks are covered too: they become a diagram element, they keep their
source as plain text, their directives are removed, and they do not change how the
document is split into sections.

### Live RLS test

With `.env.local` configured and email confirmation disabled (or two confirmed test
accounts exported as `RLS_TEST_EMAIL_A`, `RLS_TEST_PASSWORD_A`, `RLS_TEST_EMAIL_B`,
`RLS_TEST_PASSWORD_B`):

```bash
pnpm verify:rls
```

The script uses only the anon key. It verifies that drafts are invisible to anonymous
users and other accounts, that cross-user updates/deletes do nothing, and that
publish/unpublish changes anonymous visibility — including reads by slug, which is how
the public viewer looks a document up, and that a deleted document is gone for good.

## Project structure

```text
src/
  app/
    (marketing)/            landing page
    (auth)/                 login, signup
    auth/callback/          Supabase email link exchange
    dashboard/              owner-only pages
    p/[slug]/               public document viewer, presentation sections, Open Graph image
    error.tsx, not-found.tsx, robots.ts
  components/
    auth/  documents/  layout/  markdown/  system/  ui/
  config/env.ts
  lib/
    auth/ documents/ markdown/ slug/ supabase/ utils/ validation/
  proxy.ts                  session refresh, route protection, public link guard
  types/database.ts
supabase/
  config.toml
  migrations/
tests/
```

## Next milestones

1. **Dashboard polish** — pagination, status filters, bulk actions.
2. **Hardening** — Playwright E2E in CI, sitemap, rate limiting upgrade, deployment
   checklist.

## Deployment

Set the same three environment variables in Vercel, update the Supabase Site URL and
redirect URLs to the production domain, and run `supabase db push` against the
production project before the first deploy.
