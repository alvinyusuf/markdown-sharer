# Markdown encryption rollout and recovery

This is an operator/reviewer checklist for the schema introduced by
`supabase/migrations/20261103000000_encrypt_document_content.sql`. It does not
execute or authorize migration, secret provisioning, data deletion, or deployment.
Record actual results before accepting a rollout; a checklist is not a restore
receipt or proof of production readiness.

## Choose the data path before any migration

| Target | Required decision |
| --- | --- |
| Fresh, isolated, explicitly disposable database | Review the entire timestamp-ordered migration sequence, configure dedicated test credentials/keyring, and verify using synthetic fixtures. Confirm there is no customer or production data before applying it. |
| Existing database with documents that must be retained | **Stop.** The supplied encryption migration is destructive, not a preserving conversion. Design, review, and test a separate preservation migration before changing this database. |
| Existing database where deletion is explicitly authorized | Obtain a recorded data disposition and maintenance decision from the database owner. Require backup/restore evidence and coordinated application/schema cutover before executing the reviewed change. |

The migration locks `public.documents`, executes `DELETE FROM public.documents`,
drops `content`, and adds `content_encrypted` and `content_size_bytes`. Drafts,
published documents, and guest documents are deleted; it does not delete Auth
users. Old application builds using `content` are incompatible with the new
schema. Do not treat the migration as a backfill, run it against an unknown
project, or use a generic `supabase db push` as a safe existing-database upgrade.

## Record the change and recovery point

Before staging or cutover, record these nonsecret references with the accountable
operator and a separate reviewer:

- Target environment/project identifier, application source SHA, current migration
  history, intended schema version, and whether data must be retained.
- Approval scope, maintenance window, affected users/links, stop criteria, and
  exact rollback point. Identify all old app deployments and direct REST writers.
- Backup location/reference, timestamp, owner, retention, restore permissions, and
  compatible application/configuration version. Keep database contents and secret
  values out of issue reports, screenshots, shell history, and repository files.
- Protected keyring backup reference and the key IDs required by stored data and
  retained backups. Database backup alone cannot recover missing encryption keys.
- Who will verify and reopen traffic, and how users will be informed through an
  authorized communication path.

Perform a restore drill in an isolated environment before accepting the backup.
Verify document counts, status, ownership relationships, and content reads with
its compatible application and keyring. For a plaintext pre-cutover backup, use
the compatible pre-cutover app; for an encrypted backup, restore its matching
keyring. A successful backup command without a successful restore is insufficient.

## Configure staging without disclosing secrets

Use a dedicated nonproduction project and separate keys from other databases.
Redeployments sharing the same database need the same retained keyring.

The application reads `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL`. Its document keyring is
server-only: `DOCUMENT_ENCRYPTION_ACTIVE_KEY_ID` selects `v1` or `v2`, backed by
`DOCUMENT_ENCRYPTION_KEY_V1` or `DOCUMENT_ENCRYPTION_KEY_V2`. Each configured key is
a canonical base64 encoding of 32 bytes. Never put document keys in `NEXT_PUBLIC_`
variables, client bundles, logs, or this runbook. Do not configure a service-role
key in the application.

For a newly authorized local test database, `scripts/generate-document-key.mjs`
can provision `v1` into ignored `.env.local`. It refuses an existing assignment to
`DOCUMENT_ENCRYPTION_ACTIVE_KEY_ID` or `DOCUMENT_ENCRYPTION_KEY_V1`; this guard does
not check every possible key variable (for example, `DOCUMENT_ENCRYPTION_KEY_V2`).
Only run it as a separate authorized secret-provisioning action, not during a
build or as a checklist shortcut. Hosted secrets use the platform's protected
server-side secret settings. Retain every key referenced by live envelopes or
recoverable backups; changing the active ID does not re-encrypt old rows.

## Verify on the disposable staging target

1. Confirm the selected project and data disposition again, then apply the
   reviewed migrations in timestamp order through the authorized database
   workflow. Review the guest migration's `pg_cron` requirement as well as the
   encryption migration. No production command is implied by this step.
2. Run `supabase/tests/document-encryption.sql` through the authorized SQL test
   workflow on that isolated migrated database. It uses a transaction and
   rollback to check envelope shape and absence of the plaintext column. These
   checks cannot authenticate ciphertext or replace app decryption tests.
3. After the pinned toolchain/dependencies are available, run `pnpm lint`,
   `pnpm typecheck`, `pnpm test`, and `pnpm build` at one source SHA. Record actual
   pass/fail separately from database and browser evidence.
4. Run the live RLS script only with a confirmed isolated test URL and permitted
   test accounts. It requires `RLS_TEST_CONFIRM_NON_PRODUCTION=yes` in addition
   to the Supabase variables and valid document keyring. The acknowledgment is
   not an automated proof that the target is safe. With dedicated accounts,
   configure `RLS_TEST_EMAIL_A`, `RLS_TEST_PASSWORD_A`, `RLS_TEST_EMAIL_B`, and
   `RLS_TEST_PASSWORD_B` through the protected test environment. Otherwise the
   script attempts to create users and requires compatible email confirmation
   settings. The script mutates documents and may leave users or fixtures after
   failure; inspect and clean up test resources through the authorized workflow.
5. Use synthetic documents to exercise draft creation, publishing, signed-out
   reading, editing with a stable slug, and unpublish/delete. Check a second
   account and anonymous access cannot read or mutate private drafts. Verify
   both ordinary public pages and presentation/preview endpoints after revoking
   access, including a URL accessed before the change.
6. Verify missing/wrong key and invalid authentication-tag cases fail without a
   plaintext fallback in an isolated test configuration. Restore the valid
   configuration before continuing. Do not rotate or remove a live key to test
   failure handling.
7. For guest documents, test request-time expiry and observe the
   `delete-expired-demo-documents` Cron job separately. A configured once-per-minute
   schedule does not prove cleanup actually ran. Record actual removal and issues.
8. Check old public content in application/hosting caches, public page HTML,
   presentation sections, social previews, and any configured CDN. Invalidate or
   purge affected cached responses using that platform's authorized procedure,
   then verify fresh responses. Browser/reader copies, historical exports,
   backups, and logs require their own retention decisions; encryption cannot
   retract them.

## Existing-database cutover gate

Proceed only after the database owner approves the data disposition, the reviewer
accepts staging and restore evidence, and production execution is explicitly
in scope. If preservation is required and the preserving conversion is absent,
stop regardless of schedule pressure.

During the approved maintenance window, block all old application traffic and
writers, establish the final agreed backup/recovery point, and confirm the target
again. Execute only the reviewed database change and compatible deployment with
its matching keyring. Do not leave an old deployment or direct writer operating
against the replacement schema. Keep writes closed while ownership, read/write,
public access/revocation, key handling, and cache checks are repeated. Reopen
traffic only when the designated reviewer accepts the observed results.

Stop and enter recovery if the target, data disposition, backup/keyring,
application/schema compatibility, migration result, or required access checks do
not match the reviewed plan. Do not improvise a data deletion or rerun a failed
migration blindly.

## Recovery

1. Freeze writers and preserve nonsecret failure evidence. Identify whether the
   database change committed and whether writes occurred after the recovery point.
2. Restore or roll back the database/schema and application as a compatible
   pair, using the reviewed recovery procedure and correct keyring. An old app
   alone cannot read the encrypted schema; the dropped plaintext column is not
   recovered by redeploying it. Reconstructing deleted documents requires the
   appropriate backup or a separately validated recovery source.
3. Reconcile any writes since the backup with the data owner before restoring
   traffic. Record potential loss explicitly; do not overwrite newer data as an
   unreviewed shortcut.
4. Revalidate ownership, private/public reads, writes, revocation, and affected
   cache behavior on the restored version. Retain required keys and evidence.
5. The reviewer records the recovery outcome and permission to resume traffic,
   or keeps the service in maintenance with an owner and next action.

## Evidence for acceptance

Keep one packet with source SHA, target identifier, approval scope, migration
history, data disposition, backup and restore references, key IDs (never values),
executed checks and outcomes, unresolved issues, cleanup, reviewer, and timestamps.
Distinguish local tests, live RLS, browser flow, cache checks, restore drill, and
production cutover. None substitutes for another. This runbook supplies no
measured restore time, data-preserving migration, hosted test result, or deployment
receipt until those operations are performed and reviewed.
