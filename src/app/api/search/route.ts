import { NextRequest, NextResponse } from "next/server";
import { getReadOnlyClient, getVulnDemoClient, isSecureMode } from "@/lib/db";

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
    // SQL is still built via raw concatenation and executed as a plain string
    // (simple query protocol, stacked queries possible) — that's the point of
    // this branch. The connection is downgraded to vuln_demo_role so a
    // successful stacked DROP/DELETE/UPDATE fails on permissions instead of
    // actually damaging data; UNION/boolean/time-based reads are unaffected.
    const client = await getVulnDemoClient();
    const sql = `SELECT title, company, location, salary FROM jobs WHERE title ILIKE '%${keywordRaw}%' ${companyRaw ? `AND company ILIKE '%${companyRaw}%'` : ""} ORDER BY posted_at DESC LIMIT 50`;
    try {
      const { rows } = await client.query(sql);
      return NextResponse.json({ mode: "vulnerable", results: rows, sql });
    } catch (err: any) {
      return NextResponse.json({ mode: "vulnerable", error: String(err), sql }, { status: 500 });
    } finally {
      client.release(true);
    }
  }
}
