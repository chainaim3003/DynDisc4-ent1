// ============================ GRAPHQL SERVER BOOTSTRAP ============================
// Audit Framework v6 — Iter 6: graphql-yoga server bootstrap.
//
// Lifecycle:
//   1. Open SQLite sidecar (replays index.jsonl, starts tail loop).
//   2. Build executable schema from typeDefs + resolvers (closing over db).
//   3. Bind graphql-yoga on 127.0.0.1:5000 (per DECISIONS.md Item 5:
//      localhost-only, no auth, no external interfaces).
//   4. On SIGINT/SIGTERM: close HTTP server, stop tail timer, close db.
//
// Run via the new `agents:audit-query` npm script:
//     npm run agents:audit-query
// or directly:
//     npx tsx src/api/graphql/index.ts
//
// GraphQL endpoint defaults to http://127.0.0.1:5000/graphql. graphql-yoga
// serves its built-in GraphiQL UI at the same path for browser-driven
// exploration.
// ============================================================================

import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "http";
import { startSidecar, type SidecarHandle } from "../../shared/sqlite-sidecar.js";
import { typeDefs } from "./schema.js";
import { buildResolvers } from "./resolvers.js";

const HOST = "127.0.0.1";
const PORT = 5000;

async function main() {
  // 1. Start the sidecar (open + WAL + schema + replay + tail).
  let sidecar: SidecarHandle;
  try {
    sidecar = startSidecar();
  } catch (e: any) {
    console.error(`[audit-query] failed to start sqlite sidecar: ${e?.message ?? e}`);
    process.exit(1);
    return; // unreachable, satisfies TS
  }
  console.log(`[audit-query] sqlite sidecar started`);

  // 2. Build the executable schema.
  const schema = createSchema({
    typeDefs,
    resolvers: buildResolvers(sidecar.db),
  });

  // 3. Build yoga + HTTP server. graphql-yoga handles GraphQL POST + GET
  // (GraphiQL UI) on its own endpoint (default /graphql).
  const yoga = createYoga({
    schema,
    // Keep the GraphiQL UI on by default — localhost-only binding makes this safe.
    graphiql: true,
    // Don't log every query body — keep stdout quiet for normal operation.
    logging: "warn",
  });
  const server = createServer(yoga);

  server.listen(PORT, HOST, () => {
    console.log(`[audit-query] GraphQL ready at http://${HOST}:${PORT}${yoga.graphqlEndpoint}`);
  });

  // 4. Clean shutdown.
  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[audit-query] ${signal} received, shutting down...`);
    server.close(() => {
      try { sidecar.stop(); } catch (e: any) {
        console.warn(`[audit-query] sidecar.stop() error: ${e?.message ?? e}`);
      }
      console.log(`[audit-query] shutdown complete`);
      process.exit(0);
    });
    // Hard-kill timer in case server.close() hangs on a lingering connection.
    setTimeout(() => {
      console.warn(`[audit-query] forced exit after 5s`);
      process.exit(1);
    }, 5000).unref();
  };
  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch(e => {
  console.error(`[audit-query] fatal: ${e?.message ?? e}`);
  process.exit(1);
});
