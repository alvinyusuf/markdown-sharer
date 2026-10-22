import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "@/config/env";
import { isPublishedDocument } from "@/lib/documents/public-lookup";
import { documentSlugSchema } from "@/lib/validation/schemas";
import type { Database } from "@/types/database";

const PROTECTED_PREFIX = "/dashboard";
const AUTH_PATHS = new Set(["/login", "/signup"]);
const PUBLIC_DOCUMENT_PATH = /^\/p\/([^/]+)\/?$/;
const PUBLIC_DOCUMENT_UNAVAILABLE = "/p/unavailable";

export async function proxy(request: NextRequest) {
  const config = getSupabasePublicConfig();
  if (!config) {
    // Render the setup notice instead of crashing during local development.
    return NextResponse.next({ request });
  }

  const { pathname } = request.nextUrl;

  // A public link that is not published has to answer with a real 404 status.
  // The check runs before the page renders, because a streamed response has
  // already committed itself to 200 by the time `notFound()` runs.
  // Only `/p/{slug}` is guarded; the Open Graph image route lives next to it.
  const publicDocument = PUBLIC_DOCUMENT_PATH.exec(pathname);

  if (publicDocument) {
    const parsed = documentSlugSchema.safeParse(publicDocument[1]);

    if (!parsed.success) {
      return rewriteToUnavailable(request);
    }

    const published = await isPublishedDocument(parsed.data);

    if (!published) {
      return rewriteToUnavailable(request);
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Network hiccups should not lock visitors out of the marketing site.
    return response;
  }

  const { search } = request.nextUrl;

  if (!user && pathname.startsWith(PROTECTED_PREFIX)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (user && AUTH_PATHS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

function rewriteToUnavailable(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = PUBLIC_DOCUMENT_UNAVAILABLE;
  url.search = "";

  const response = NextResponse.rewrite(url);
  response.headers.set("x-robots-tag", "noindex");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/p/:path*"],
};
