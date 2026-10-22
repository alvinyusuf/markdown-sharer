import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  FileText,
  Link2,
  MonitorPlay,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
} from "lucide-react";

import { renderMarkdown } from "@/lib/markdown/render";
import { LinkButton } from "@/components/ui/link-button";

const sampleMarkdown = `# Product launch notes

A short brief for the **Atlas** release. Everything below is written in plain Markdown.

> Good documentation should feel like a conversation, not a manual.

## What ships this week

- [x] Upload flow with drag and drop
- [x] Safe Markdown rendering
- [ ] Public links and presentation mode

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
      "Drop in a .md or .markdown file up to 2 MB. We validate the bytes, not the file extension alone.",
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
      "Raw HTML is discarded and every tree is sanitized before it reaches the page.",
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
    description:
      "Every published document gets a unique slug that survives content updates.",
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

export default async function HomePage() {
  const sample = await renderMarkdown(sampleMarkdown);

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="landing-grid absolute inset-0 -z-10" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-8 lg:pt-24 lg:pb-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 py-1 pr-3 pl-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-3" />
              </span>
              Markdown → a page worth sharing
            </div>

            <h1 className="mt-6 font-serif text-5xl leading-[1.04] font-semibold tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.2rem]">
              Turn plain Markdown into a page people actually read.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Upload a file, check the preview, and send a link. Your reader only needs a
              browser — no editor, no account, no setup.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LinkButton
                size="lg"
                className="h-11 px-5 text-[15px] shadow-sm"
                href="/dashboard/new"
              >
                <Upload className="size-4" />
                Upload Markdown
              </LinkButton>
              <LinkButton
                variant="ghost"
                size="lg"
                className="h-11 px-4 text-[15px]"
                href="#how-it-works"
              >
                See how it works
                <ArrowRight className="size-4" />
              </LinkButton>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-700" />
                .md and .markdown
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-700" />
                Up to 2 MB
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-700" />
                Private until published
              </li>
            </ul>
          </div>

          <div className="relative lg:pl-4">
            <div
              aria-hidden="true"
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-emerald-900/[0.04] blur-2xl"
            />
            <div className="paper-shadow overflow-hidden rounded-2xl border bg-card">
              <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400/80" />
                  <span className="size-2.5 rounded-full bg-amber-400/80" />
                  <span className="size-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <span className="rounded-md border bg-background px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    markdownshare.app/p/product-launch-notes
                  </span>
                </div>
              </div>
              <div className="relative max-h-[520px] overflow-hidden">
                <div className="prose-doc prose-sample prose max-w-none px-6 py-7 sm:px-9">
                  {sample}
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent"
                />
              </div>
            </div>
            <div className="absolute -right-3 -bottom-4 hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <Check className="size-3.5" />
              </span>
              Rendered safely
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y bg-card/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              How it works
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
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
        className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Built for reading
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything a document needs. Nothing it doesn&apos;t.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            MarkdownShare is a publisher and viewer, not another editor. Keep writing in
            the tools you already use.
          </p>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="group">
              <div className="flex size-10 items-center justify-center rounded-xl border bg-card shadow-sm transition-colors group-hover:border-emerald-700/30 group-hover:bg-emerald-50">
                <feature.icon className="size-[18px] text-emerald-800" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border bg-primary text-primary-foreground">
          <div className="relative px-6 py-14 sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(70%_120%_at_85%_0%,oklch(0.45_0.08_160/55%),transparent_65%)]"
            />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <h2 className="font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Your next document is already written. Make it easy to open.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70 sm:text-base">
                  Create an account, upload a file, and keep every draft in one place.
                </p>
              </div>
              <LinkButton
                size="lg"
                className="h-11 bg-white px-5 text-[15px] text-primary hover:bg-white/90"
                href="/signup"
              >
                Get started free
                <ArrowUpRight className="size-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
