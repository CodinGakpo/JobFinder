# Job Portal — SQL Injection Case Study (BCSE320L)

A full-stack Job Portal used to demonstrate SQL injection in a controlled
"vulnerable" build, and the fix in a "secure" build. Both builds share the
same UI and API route; the only difference is how the search endpoint
constructs its SQL query, controlled by the `APP_MODE` environment variable.

> **This app is intentionally vulnerable in one mode, for educational
> purposes only.** Never deploy it publicly, and never point it at a
> database containing real user data.

## Stack

- Next.js (App Router, TypeScript), Tailwind CSS
- Supabase Postgres, accessed directly via `pg` (node-postgres) — not
  `supabase-js`/PostgREST, which parameterizes everything and therefore
  cannot demonstrate injection.

## Prerequisites

- Node.js 18+
- A Supabase project (free tier is fine)
- [sqlmap](https://sqlmap.org/) if you want to reproduce the automated
  exploitation in `docs/EXPLOITS.md`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase connection
   details. **Never commit `.env`** — it's already gitignored.

   Use the **Session Pooler** connection string from Supabase dashboard
   → Project Settings → Database → Connection String. The direct
   `db.<project-ref>.supabase.co` host is IPv6-only on free-tier projects;
   if your network has no IPv6 route (common on many home/CI networks),
   the direct host will fail with `ENETUNREACH` and you must use the
   pooler host instead, which supports IPv4.

3. Run the database migration: open your Supabase project's SQL Editor,
   paste the full contents of `migrations/001_init.sql`, and run it. This
   creates the `jobs` and `users` tables, seeds ~20 jobs and 5 fake users
   (including one admin), and creates a least-privilege
   `readonly_search_role` used by the secure build.

   Sanity check (optional, at the bottom of the migration file, commented
   out): run `SELECT count(*) FROM jobs;` (expect 20) and
   `SELECT count(*) FROM users;` (expect 5).

## Running the app

```bash
npm run dev
```

Visit [http://localhost:3000/jobs](http://localhost:3000/jobs).

## Toggling modes

Set `APP_MODE` in `.env` to either:

- `vulnerable` — the search endpoint builds SQL via raw string
  concatenation, with no escaping.
- `secure` — the same endpoint uses parameterized queries, input length
  limits, and connects as a least-privilege read-only role.

**You must restart the dev server after changing `APP_MODE`** — Next.js
reads environment variables once at process startup, so a running server
will not pick up the change.

Both modes behave identically for normal searches; the current mode is
shown as a badge on the `/jobs` page.

## Exploit documentation

See [`docs/EXPLOITS.md`](docs/EXPLOITS.md) for the exact payloads used for
UNION-based, boolean-blind, and time-based blind SQL injection — including
the raw SQL each payload produces, example requests/responses, impact, the
parameterized-query fix, and confirmation that each payload fails against
the secure build. It also documents an automated `sqlmap` run against both
builds.
