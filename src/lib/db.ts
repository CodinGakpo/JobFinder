import { Pool, type PoolClient } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function buildPoolConfig() {
  return {
    host: process.env.host,
    port: Number(process.env.port ?? 5432),
    database: process.env.database,
    user: process.env.user,
    password: process.env.password,
    ssl: { rejectUnauthorized: false },
  };
}

export function getPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({ ...buildPoolConfig(), max: 5 });
  }
  return global.__pgPool;
}

// Secure-mode helper: acquire a client and downgrade its privileges via SET ROLE.
// Caller MUST client.release(true) — force-destroying the connection instead of
// returning it to the pool — so the restricted role never leaks onto a later request.
export async function getReadOnlyClient(): Promise<PoolClient> {
  const client = await getPool().connect();
  await client.query("SET ROLE readonly_search_role");
  return client;
}

export function isSecureMode(): boolean {
  return process.env.APP_MODE === "secure";
}
