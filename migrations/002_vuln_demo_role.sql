-- Job Portal SQLi case study — least-privilege role for the vulnerable demo path.
-- Run this manually in the Supabase SQL Editor after 001_init.sql.
--
-- Purpose: the vulnerable branch of /api/search intentionally allows SQL
-- injection (including Postgres stacked queries via the simple query
-- protocol) so injection techniques can be demonstrated live, including
-- against a public Vercel deployment. Running that branch as the
-- full-privilege connection role would let a stacked destructive statement
-- (DROP TABLE, DELETE, UPDATE, TRUNCATE) actually damage the real Supabase
-- project. vuln_demo_role grants SELECT only on both jobs and users, so
-- every read-based exploit (UNION, boolean-blind, time-based) still works
-- exactly as documented, but any injected write/DDL statement fails with a
-- Postgres permission error instead of executing.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vuln_demo_role') THEN
    CREATE ROLE vuln_demo_role NOLOGIN;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO vuln_demo_role;
GRANT SELECT ON jobs TO vuln_demo_role;
GRANT SELECT ON users TO vuln_demo_role;

-- Explicitly confirm no write/DDL capability (defensive; the SELECT-only
-- GRANTs above never included these, but this documents intent and
-- protects against a future GRANT ALL elsewhere touching this role).
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON jobs FROM vuln_demo_role;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON users FROM vuln_demo_role;

-- Required, same reasoning as readonly_search_role in 001_init.sql: the
-- connecting role (postgres, via Supabase's pooler) must be a member of
-- vuln_demo_role for SET ROLE to succeed.
GRANT vuln_demo_role TO postgres;

-- ============================================================
-- Sanity checks (uncomment to run manually after migration)
-- ============================================================

-- SET ROLE vuln_demo_role;
-- SELECT * FROM jobs LIMIT 1;    -- should succeed
-- SELECT * FROM users LIMIT 1;  -- should succeed (this role CAN read users — required for the UNION demo)
-- DELETE FROM jobs WHERE id = 1; -- should fail: permission denied for table jobs
-- DROP TABLE jobs;               -- should fail: permission denied for table jobs
-- RESET ROLE;
