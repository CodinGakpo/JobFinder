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
    // rejectUnauthorized: false — Supabase's pooler presents a cert chain
    // rooted at a CA not in Node's default trust store ("self-signed
    // certificate in certificate chain" with rejectUnauthorized: true,
    // verified during deployment prep). Connection is still TLS-encrypted
    // in transit; it's just not certificate-pinned.
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

// Vulnerable-mode helper: acquire a client and downgrade its privileges via
// SET ROLE before handing it to the intentionally-unsafe query path. This
// does not fix the SQL injection or block stacked-query execution — it
// bounds the blast radius so a stacked DROP/DELETE/UPDATE fails with a
// Postgres permission error instead of destroying data. Caller MUST
// client.release(true) for the same reason as getReadOnlyClient().
export async function getVulnDemoClient(): Promise<PoolClient> {
  const client = await getPool().connect();
  await client.query("SET ROLE vuln_demo_role");
  return client;
}

// Fail-safe: only the exact string "vulnerable" enables the exploit path;
// anything else (unset, typo, empty) is secure.
export function isSecureMode(): boolean {
  return process.env.APP_MODE !== "vulnerable";
}
