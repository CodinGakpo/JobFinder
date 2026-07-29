import { NextRequest, NextResponse } from "next/server";
import { getPool, getReadOnlyClient, isSecureMode } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keywordRaw = searchParams.get("keyword") ?? "";
  const companyRaw = searchParams.get("company") ?? "";

  if (isSecureMode()) {
    // ---------------- SECURE PATH ----------------
    if (keywordRaw.length > 100 || companyRaw.length > 100) {
      return NextResponse.json({ error: "Query too long" }, { status: 400 });
    }

    const client = await getReadOnlyClient(); // SET ROLE readonly_search_role
    try {
      const sql = `
        SELECT title, company, location, salary
        FROM jobs
        WHERE title ILIKE '%' || $1 || '%'
          AND ($2 = '' OR company ILIKE '%' || $2 || '%')
        ORDER BY posted_at DESC
        LIMIT 50
      `;
      const { rows } = await client.query(sql, [keywordRaw, companyRaw]);
      return NextResponse.json({ mode: "secure", results: rows });
    } catch (err) {
      return NextResponse.json({ mode: "secure", error: "Search failed" }, { status: 500 });
    } finally {
      client.release(true); // destroy connection, drop the SET ROLE state
    }
  } else {
    // ---------------- VULNERABLE PATH (intentionally unsafe, for demo only) ----------------
    const pool = getPool();
    const sql = `SELECT title, company, location, salary FROM jobs WHERE title ILIKE '%${keywordRaw}%' ${companyRaw ? `AND company ILIKE '%${companyRaw}%'` : ""} ORDER BY posted_at DESC LIMIT 50`;
    try {
      const { rows } = await pool.query(sql);
      return NextResponse.json({ mode: "vulnerable", results: rows, sql });
    } catch (err: any) {
      return NextResponse.json({ mode: "vulnerable", error: String(err), sql }, { status: 500 });
    }
  }
}
