-- Run on an isolated migrated test database. No persistent changes.
begin;
do $$
declare
  envelope jsonb := jsonb_build_object(
    'version', 1, 'key_id', 'v1',
    'iv', replace(encode(decode(repeat('00', 12), 'hex'), 'base64'), E'\n', ''),
    'tag', replace(encode(decode(repeat('00', 16), 'hex'), 'base64'), E'\n', ''),
    'ciphertext', 'YQ=='
  );
  largest jsonb;
begin
  assert public.valid_document_envelope(envelope, 1);
  assert not public.valid_document_envelope('"plaintext"'::jsonb, 1);
  assert not public.valid_document_envelope('{}'::jsonb, 1);
  assert not public.valid_document_envelope(envelope - 'tag', 1);
  assert not public.valid_document_envelope(envelope || '{"version":2}', 1);
  assert not public.valid_document_envelope(envelope || '{"key_id":"../SECRET"}', 1);
  assert not public.valid_document_envelope(envelope || '{"iv":"AA=="}', 1);
  assert not public.valid_document_envelope(envelope || '{"tag":null}', 1);
  assert not public.valid_document_envelope(envelope || '{"ciphertext":"YR=="}', 1);
  assert not public.valid_document_envelope(envelope, 2);
  largest := jsonb_set(envelope, '{ciphertext}', to_jsonb(replace(encode(decode(repeat('00', 2097152), 'hex'), 'base64'), E'\n', '')));
  assert public.valid_document_envelope(largest, 2097152);
  assert not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'documents' and column_name = 'content');
end;
$$;
rollback;
