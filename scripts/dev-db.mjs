/**
 * Local development database — an embedded PostgreSQL (no Docker required).
 *
 *   npm run db:dev          start it (keeps running; Ctrl+C to stop)
 *
 * Data lives in .data/pg (git-ignored). Production uses a managed Postgres
 * (Railway) through DATABASE_URL; this file is never used there.
 */
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(".data/pg");
const port = Number(process.env.DEV_DB_PORT ?? 5433);
const fresh = !fs.existsSync(path.join(dir, "PG_VERSION"));

const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "postgres",
  password: "postgres",
  port,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase("triobuiltgulf");

console.log(`Dev Postgres ready: postgresql://postgres:postgres@localhost:${port}/triobuiltgulf`);

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
