# ADR 001: one service, one durable investigation

Status: accepted for the local C8 build, 2026-10-05.

The allocated Fly machine has 256 MB RAM and one volume at /data. The app needs
small shared records, not a large backend. React is built to static assets with
Vite; Node serves those assets, README HTML and JSON routes. Node's built-in SQLite
driver avoids a separate database service and native addon compilation.

Alternatives: a full Next server adds runtime/build machinery without a needed
SSR product flow; the existing Astro/Drizzle C7 project has useful lessons but
different domain assumptions. A separate managed database does not match the
allocated course infrastructure. localStorage cannot own shared durable state.

Trade-offs: this is deliberately single-process and single-machine. Synchronous
small transactions are acceptable for a classroom prototype but long database
work would block requests. High availability and global scaling are not claimed.
Data lives in DATA_DIR; production uses /data. Schema creation is idempotent and
versioned at user_version=1; later changes require explicit migrations.

SSE sends only invalidation notices; clients fetch an authorised snapshot. HTTP
writes are transactional. Timeline writes include the current room version and
stale updates return 409. This avoids silent last-writer-wins behaviour. The cost
is that a concurrent participant may need to repeat a move after seeing new state.

Thirty-day HttpOnly cookies provide pseudonymous identity, with hashes stored
server-side. An unguessable invitation lets one partner claim the second role.
No cross-device account recovery is promised. Anyone clearing cookies loses
membership, and this limitation is explained before they start.
