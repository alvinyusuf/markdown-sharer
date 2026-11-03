import { NextResponse } from "next/server";

import { getPublishedSections } from "@/lib/documents/public-sections";
import { documentSlugSchema } from "@/lib/validation/schemas";

/**
 * The presentation sections of a published document.
 *
 * The public viewer loads this only when a reader starts a presentation, so
 * the normal page stays small. Only published documents are served.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/p/[slug]/sections">,
) {
  const { slug } = await params;
  const parsed = documentSlugSchema.safeParse(slug);

  if (!parsed.success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let sections;
  try {
    sections = await getPublishedSections(parsed.data);
  } catch {
    return NextResponse.json({ error: "Document service unavailable" }, { status: 503 });
  }

  if (!sections) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    { sections },
    {
      headers: {
        "cache-control": "private, no-cache, must-revalidate",
      },
    },
  );
}
