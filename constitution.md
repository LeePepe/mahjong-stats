# Constitution

1. The shared query key and plaintext write token are never committed or logged by application code.
2. The write token is fine-grained to the data repository only and is encrypted at rest with the shared query key.
3. Rankings are derived from match results, never edited as duplicated totals.
4. Every mutation names an actor, appends an audit record, and creates a Git commit. Deletion is soft and restorable.
5. Historical source images and uncertain transcriptions stay distinguishable from verified structured data.
6. Every dispatchable path resolves to exactly one leaf layer; required CI audits the whole routing tree.
