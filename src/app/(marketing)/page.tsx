import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  FileText,
  Link2,
  LockKeyhole,
  MonitorPlay,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
} from "lucide-react";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth/session";
import { renderMarkdown } from "@/lib/markdown/render";
import { LinkButton } from "@/components/ui/link-button";

const sampleMarkdown = `# Product launch notes

A short brief for the **Atlas** release. Everything below is written in plain Markdown.

> Good documentation should feel like a conversation, not a manual.

## What ships this week

- [x] Upload flow with drag and drop
- [x] Safe Markdown rendering
- [x] Public links
- [x] Presentation mode

## Request example

\`\`\`ts
const response = await fetch("/api/documents", {
  method: "POST",
  body: JSON.stringify({ title, content }),
});

const { slug } = await response.json();
\`\`\`

## Launch checklist

| Area | Owner | Status |
| --- | --- | --- |
| Rendering | Docs team | Ready |
| Security review | Platform | Ready |
| Announcement | Marketing | Draft |

### Notes

Inline code like \`pnpm build\` is easy to scan, and so are [links](https://nextjs.org).
`;

const steps = [
  {
    number: "01",
    title: "Upload your Markdown",
    description:
      "Drop in a .md or .markdown file up to 2 MB. We check the file and its contents before uploading.",
  },
  {
    number: "02",
    title: "Preview the real thing",
    description:
      "See headings, tables, code, task lists, and images rendered exactly as readers will see them.",
  },
  {
    number: "03",
    title: "Share one clean link",
    description:
      "Readers open a focused page in their browser. No account, no editor, no downloads.",
  },
];

const features = [
  {
    icon: FileText,
    title: "Markdown-first",
    description: "Your file stays the source of truth. No proprietary blocks or lock-in.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by default",
    description:
      "Unsafe HTML is removed so your readers can open shared documents safely.",
  },
  {
    icon: Code2,
    title: "Code that reads well",
    description:
      "Syntax highlighting, horizontal scrolling, and a copy button for every block.",
  },
  {
    icon: Link2,
    title: "Stable public links",
    description: "Your published link stays the same when you update the document.",
  },
  {
    icon: MonitorPlay,
    title: "Presentation ready",
    description:
      "Turn a document into browser-based slides split by headings. No extra software.",
  },
  {
    icon: Smartphone,
    title: "Reads on any screen",
    description:
      "A single-column layout, scrollable tables, and controls that work without hover.",
  },
];

async function HomeActions() {
  const user = await getCurrentUser();

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <LinkButton
          size="lg"
          className="h-11 w-full px-5 text-sm shadow-sm"
          href="/dashboard/new"
          aria-describedby="private-draft-note"
        >
          <Upload className="size-4" />
          Create a private draft
        </LinkButton>
        <p
          id="private-draft-note"
          className="text-xs leading-relaxed text-muted-foreground"
        >
          {user
            ? "Publish when you're ready."
            : "Account required. Publish when you're ready."}
        </p>
      </div>
      {!user && (
        <div className="space-y-2">
          <LinkButton
            variant="outline"
            size="lg"
            className="h-11 w-full px-4 text-sm"
            href="/try"
            aria-describedby="guest-link-note"
          >
            Try without signing in
            <ArrowRight className="size-4" />
          </LinkButton>
          <p
            id="guest-link-note"
            className="text-xs leading-relaxed text-muted-foreground"
          >
            Creates a public link that expires after 24 hours.
          </p>
        </div>
      )}
    </div>
  );
}

async function HomeClosingContent() {
  const user = await getCurrentUser();

  return (
    <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
      <div className="max-w-2xl">
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Your next document is already written. Make it easy to open.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70 sm:text-base">
          {user
            ? "Upload a file, manage your drafts, and publish when you're ready."
            : "Create an account, upload a file, and keep every draft in one place."}
        </p>
      </div>
      <LinkButton
        size="lg"
        className="h-11 w-full bg-white px-5 text-[15px] text-primary hover:bg-white/90 sm:w-auto"
        href={user ? "/dashboard" : "/signup"}
      >
        {user ? "Go to dashboard" : "Create an account"}
        <ArrowUpRight className="size-4" />
      </LinkButton>
    </div>
  );
}

export default async function HomePage() {
  const sample = await renderMarkdown(sampleMarkdown);

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="landing-grid absolute inset-0 -z-10" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-9 pb-12 sm:gap-14 sm:px-6 sm:pt-16 sm:pb-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-8 lg:pt-24 lg:pb-28">
          <div className="max-w-2xl min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 py-1 pr-3 pl-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-3" />
              </span>
              Markdown → a page worth sharing
            </div>

            <h1 className="mt-5 font-serif text-[clamp(2.25rem,9vw,3rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:mt-6 sm:text-6xl lg:text-[4.2rem]">
              Turn plain Markdown into a page people actually read.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
              Upload a file, check the preview, and send a link. Your reader only needs a
              browser — no editor, no account, no setup.
            </p>

            <Suspense
              fallback={
                <div
                  aria-busy="true"
                  aria-label="Loading actions"
                  className="mt-8 h-20"
                />
              }
            >
              <HomeActions />
            </Suspense>

            <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-blue-700" />
                .md and .markdown
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-blue-700" />
                Up to 2 MB
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-blue-700" />
                No account needed to read
              </li>
            </ul>

            <a
              href="#security"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
              AES-256-GCM encryption at rest
              <ArrowRight aria-hidden="true" className="size-3.5 shrink-0" />
            </a>
          </div>

          <div className="relative min-w-0 lg:pl-4">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-blue-900/[0.04] blur-2xl"
            />
            <div className="paper-shadow min-w-0 overflow-hidden rounded-2xl border bg-card">
              <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400/80" />
                  <span className="size-2.5 rounded-full bg-amber-400/80" />
                  <span className="size-2.5 rounded-full bg-blue-400/80" />
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    Sample document
                  </span>
                </div>
              </div>
              <div
                role="region"
                aria-label="Sample Markdown document"
                aria-describedby="sample-scroll-hint"
                tabIndex={0}
                className="thin-scrollbar max-h-[min(60svh,420px)] overflow-y-auto overscroll-contain focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:max-h-[520px]"
              >
                <div className="prose-doc prose-sample prose max-w-none px-4 py-5 sm:px-9 sm:py-7">
                  {sample}
                </div>
              </div>
              <p
                id="sample-scroll-hint"
                className="border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground"
              >
                Scroll to read the full sample, including code and tables.
              </p>
            </div>
            <div className="absolute -right-3 -bottom-4 hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-100 text-blue-800">
                <Check className="size-3.5" />
              </span>
              Rendered safely
            </div>
          </div>
        </div>
      </section>

      <section
        id="security"
        aria-labelledby="security-heading"
        className="scroll-mt-20 border-t bg-accent/40"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-8">
          <div>
            <LockKeyhole aria-hidden="true" className="mb-5 size-7 text-primary" />
            <h2
              id="security-heading"
              className="max-w-md font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Easy to share. Encrypted when stored.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Your Markdown content is encrypted on our server with AES-256-GCM before it
              reaches the database. Protection is built into every account and guest
              upload, with no extra setup.
            </p>
          </div>
          <div>
            <dl className="divide-y border-y">
              <div className="py-5">
                <dt className="text-sm font-semibold">Encrypted content at rest</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  The database stores encrypted document content. Encryption keys stay on
                  the server, separate from the database.
                </dd>
              </div>
              <div className="py-5">
                <dt className="text-sm font-semibold">
                  Integrity checked before reading
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Authentication checks detect changes to encrypted content. Content that
                  fails verification is never rendered.
                </dd>
              </div>
              <div className="py-5">
                <dt className="text-sm font-semibold">
                  You choose when drafts go public
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Account drafts stay private until you publish. Guest uploads create
                  public links that expire after 24 hours.
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              This is server-side encryption, not end-to-end encryption. Readmeo decrypts
              content to display it. Published documents are readable by anyone with the
              link; titles and other metadata are not encrypted.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-y bg-card/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps from file to readable page.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative border-t pt-6">
                <span className="absolute -top-3 left-0 bg-card px-2 font-mono text-xs text-muted-foreground">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything a document needs. Nothing it doesn&apos;t.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Readmeo is a publisher and viewer, not another editor. Keep writing in the
            tools you already use.
          </p>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="group">
              <div className="flex size-10 items-center justify-center rounded-xl border bg-card shadow-sm transition-colors group-hover:border-blue-700/30 group-hover:bg-blue-50">
                <feature.icon className="size-[18px] text-blue-800" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border bg-primary text-primary-foreground">
          <div className="relative px-5 py-9 sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(70%_120%_at_85%_0%,oklch(0.45_0.08_160/55%),transparent_65%)]"
            />
            <Suspense
              fallback={
                <div
                  aria-busy="true"
                  aria-label="Loading actions"
                  className="min-h-44 sm:min-h-28"
                />
              }
            >
              <HomeClosingContent />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
