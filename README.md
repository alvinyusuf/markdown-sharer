# MarkdownShare

Upload a Markdown file, preview the rendered document, and share it with a link.
This repository currently implements **Phase 1–3** of
[`specification.md`](./specification.md): foundation, authentication, Markdown upload,
persistent drafts, preview, publishing, and the public viewer at `/p/[slug]`.

Presentation mode and document deletion are the next milestones. The app never makes a
document public on upload — publishing is always an explicit action.

## Stack

- Next.js 16.4 (App Router, Cache Components, PPR)
- React 19 + TypeScript (strict)
- Tailwind CSS 4 + shadcn/ui (Base UI)
- Supabase Auth + PostgreSQL + Row Level Security
- `unified` / `remark` / `rehype` for Markdown, rendered as React elements
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

| Route                            | Access | Purpose                                    |
| -------------------------------- | ------ | ------------------------------------------ |
| `/`                              | Public | Marketing page with a real rendered sample |
| `/login`, `/signup`              | Public | Email/password auth                        |
| `/auth/callback`                 | Public | Code/token exchange for email links        |
| `/dashboard`                     | Owner  | List documents, publish and unpublish      |
| `/dashboard/new`                 | Owner  | Upload and create a draft                  |
| `/dashboard/documents/[id]`      | Owner  | Preview, edit metadata, publish, copy link |
| `/dashboard/documents/[id]/edit` | Owner  | Replace or edit Markdown source            |
| `/p/[slug]`                      | Public | Published document, readable without login |
| `/p/[slug]/opengraph-image`      | Public | Social preview image for a document        |

## Security model

- Raw HTML in Markdown is **never parsed** (`remark-rehype` runs without
  `allowDangerousHtml`). The tree is also passed through `rehype-sanitize`.
- The app renders React elements with `hast-util-to-jsx-runtime`; it does not use
  `dangerouslySetInnerHTML`.
- `javascript:`, `data:`, and `file:` URLs are removed by the sanitizer. External links
  get `rel="noopener noreferrer nofollow"`.
- Uploads are validated twice: extension/size/UTF-8 in the browser, then size, title,
  description, and content again in the Server Action.
- Every query and mutation scopes by `owner_id`; RLS is the second boundary.
- Public rendering uses a cookieless Supabase client so it can never see a draft
  belonging to a signed-in visitor. The public response never selects `owner_id`.
- The proxy rejects `/p/{slug}` for documents that are not published, so a missing or
  unpublished link answers with a real `404` instead of a streamed `200`.
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

## Publishing and caching

- `publishDocumentAction` / `unpublishDocumentAction` are Server Actions. They verify
  the session, the ownership, and the current status before touching the row, and they
  set `published_at` together with the status so the database check constraint holds.
- The public document and its rendered Markdown tree are cached with `"use cache"` and
  a `document:{slug}` tag. Every mutation that changes what a reader sees
  (publish, unpublish, content, metadata) calls `updateTag()` for that tag, so the next
  reader gets the new content — or a 404 after an unpublish.
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
descriptions, Open Graph metadata, and cache tags.

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
the public viewer looks a document up.

## Project structure

```text
src/
  app/
    (marketing)/            landing page
    (auth)/                 login, signup
    auth/callback/          Supabase email link exchange
    dashboard/              owner-only pages
    p/[slug]/               public document viewer + Open Graph image
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

1. **Presentation mode** — split by H1/H2 with fallback, keyboard navigation, fullscreen.
2. **Dashboard management** — delete with confirmation, pagination, status filters.
3. **Hardening** — Playwright E2E in CI, rate limiting upgrade, deployment checklist.

## Deployment

Set the same three environment variables in Vercel, update the Supabase Site URL and
redirect URLs to the production domain, and run `supabase db push` against the
production project before the first deploy.
