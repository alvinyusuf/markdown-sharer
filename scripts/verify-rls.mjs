#!/usr/bin/env node
/**
 * Live RLS smoke test for the documents table.
 *
 * Usage:
 *   node scripts/verify-rls.mjs
 *
 * Reads .env.local. If RLS_TEST_EMAIL_A / RLS_TEST_PASSWORD_A /
 * RLS_TEST_EMAIL_B / RLS_TEST_PASSWORD_B are set, those accounts are used.
 * Otherwise the script creates two disposable users; email confirmation must
 * be disabled in Supabase for that to work.
 *
 * This script never uses a service-role key.
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local is optional; variables may already be exported.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
  );
  process.exit(1);
}

let failures = 0;

function check(name, condition) {
  if (condition) {
    console.log(`  ✓ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${name}`);
  }
}

function client() {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getOrCreateUser(label) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email =
    process.env[`RLS_TEST_EMAIL_${label}`] ?? `rls-test-${label}-${suffix}@example.com`;
  const password = process.env[`RLS_TEST_PASSWORD_${label}`] ?? `Test-pass-${suffix}-9x`;

  const supabase = client();

  if (process.env[`RLS_TEST_EMAIL_${label}`]) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(`Could not sign in ${label}: ${error.message}`);
    }
    const { data } = await supabase.auth.getUser();
    return { supabase, userId: data.user.id, email };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw new Error(`Could not create ${label}: ${error.message}`);
  }

  if (!data.session) {
    throw new Error(
      `Sign-up for ${label} did not return a session. Disable email confirmation for the RLS test, or provide RLS_TEST_EMAIL_${label} and RLS_TEST_PASSWORD_${label}.`,
    );
  }

  return { supabase, userId: data.user.id, email };
}

async function main() {
  console.log("Preparing two users…");
  const a = await getOrCreateUser("A");
  const b = await getOrCreateUser("B");
  const anon = client();

  const slug = `rls-test-${randomUUID().slice(0, 8)}`;
  const title = "RLS test draft";

  console.log("\nINSERT");
  const { data: draft, error: insertError } = await a.supabase
    .from("documents")
    .insert({
      owner_id: a.userId,
      title,
      slug,
      content: "# Private draft\n\nOnly the owner should see this.",
      status: "draft",
    })
    .select("id")
    .single();

  check("owner can create a draft", !insertError && Boolean(draft?.id));
  if (!draft?.id) {
    throw new Error(`Insert failed: ${insertError?.message ?? "no row returned"}`);
  }

  const { error: anonInsertError } = await anon.from("documents").insert({
    owner_id: a.userId,
    title: "Anonymous insert",
    slug: `${slug}-anon`,
    content: "nope",
    status: "draft",
  });
  check("anonymous insert is rejected", Boolean(anonInsertError));

  console.log("\nDRAFT VISIBILITY");
  const anonDraft = await anon.from("documents").select("id").eq("id", draft.id);
  check("anonymous cannot read a draft", (anonDraft.data ?? []).length === 0);

  const bDraft = await b.supabase.from("documents").select("id").eq("id", draft.id);
  check("another user cannot read a draft", (bDraft.data ?? []).length === 0);

  const bUpdate = await b.supabase
    .from("documents")
    .update({ title: "Hijacked" })
    .eq("id", draft.id)
    .select("id");
  check("another user cannot update a document", (bUpdate.data ?? []).length === 0);

  const bDelete = await b.supabase
    .from("documents")
    .delete()
    .eq("id", draft.id)
    .select("id");
  check("another user cannot delete a document", (bDelete.data ?? []).length === 0);

  console.log("\nPUBLISH / UNPUBLISH");
  const published = await a.supabase
    .from("documents")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", draft.id)
    .select("id, status")
    .single();
  check("owner can publish", published.data?.status === "published");

  const anonPublished = await anon
    .from("documents")
    .select("id, title")
    .eq("id", draft.id);
  check(
    "anonymous can read a published document",
    (anonPublished.data ?? []).length === 1,
  );

  const anonUpdate = await anon
    .from("documents")
    .update({ title: "Anonymous edit" })
    .eq("id", draft.id)
    .select("id");
  check(
    "anonymous cannot update a published document",
    (anonUpdate.data ?? []).length === 0,
  );

  const unpublished = await a.supabase
    .from("documents")
    .update({ status: "draft", published_at: null })
    .eq("id", draft.id)
    .select("id, status")
    .single();
  check("owner can unpublish", unpublished.data?.status === "draft");

  const anonAfterUnpublish = await anon.from("documents").select("id").eq("id", draft.id);
  check(
    "unpublished document disappears from anonymous reads",
    (anonAfterUnpublish.data ?? []).length === 0,
  );

  console.log("\nDELETE");
  const ownerDelete = await a.supabase
    .from("documents")
    .delete()
    .eq("id", draft.id)
    .select("id");
  check("owner can delete", (ownerDelete.data ?? []).length === 1);

  console.log(
    `\nTest users: ${a.email}, ${b.email}. Delete them from Supabase Auth if they were created by this script.`,
  );

  if (failures > 0) {
    console.error(`\n${failures} check(s) failed.`);
    process.exit(1);
  }

  console.log("\nAll RLS checks passed.");
}

main().catch((error) => {
  console.error(`\nRLS test failed: ${error.message}`);
  process.exit(1);
});
