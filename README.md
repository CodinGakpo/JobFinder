# Job Portal — SQL Injection Case Study (BCSE320L)

A full-stack Job Portal used to demonstrate SQL injection in a controlled
"vulnerable" build, and the fix in a "secure" build. Both builds share the
same UI and API route; the only difference is how the search endpoint
constructs its SQL query, controlled by the `APP_MODE` environment variable.

> **This app is intentionally vulnerable in one mode, for educational
> purposes only.** Never point it at a database containing real user data.
> This project is deployed publicly on Vercel against the team's own
> Supabase project as a deliberate, accepted risk for course demo
> purposes — see "Accepted risk / production deployment" in
> [`docs/EXPLOITS.md`](docs/EXPLOITS.md) before deploying a copy of your
> own.

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

3. Run the database migrations, in order, in your Supabase project's SQL
   Editor:
   - `migrations/001_init.sql` — creates the `jobs` and `users` tables,
     seeds ~20 jobs and 5 fake users (including one admin), and creates a
     least-privilege `readonly_search_role` used by the secure build.
   - `migrations/002_vuln_demo_role.sql` — creates `vuln_demo_role`, a
     SELECT-only (on both `jobs` and `users`) role used by the vulnerable
     build. This bounds the vulnerable build's blast radius: injected reads
     (UNION, boolean-blind, time-based) still work, but any stacked
     destructive statement (`DROP TABLE`, `DELETE`, etc.) fails with a
     Postgres permission error instead of executing.

   Sanity check (optional, at the bottom of each migration file, commented
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

The default is fail-safe: only the exact string `vulnerable` enables the
exploit path. If `APP_MODE` is unset, empty, or misspelled, the app runs
in secure mode.

Both modes behave identically for normal searches; the current mode is
shown as a badge on the `/jobs` page.

## Deploying to Vercel

1. Link the Vercel project to this repository.
2. In Vercel → Project Settings → Environment Variables, set:

   | Key | Value |
   |---|---|
   | `host` | Supabase Session Pooler host, e.g. `aws-0-<region>.pooler.supabase.com` |
   | `port` | `5432` |
   | `database` | `postgres` |
   | `user` | `postgres.<project-ref>` |
   | `password` | your Supabase DB password (mark as "Sensitive") |
   | `APP_MODE` | `secure` (recommended resting state) or `vulnerable` |

   `connection_string` from `.env.example` is unused by the app code and
   can be omitted from Vercel.

3. Deploy. No changes to `next.config.ts` or `package.json` are required
   for a standard Vercel build.

**Changing `APP_MODE` on Vercel requires a redeploy** — unlike local dev,
saving a new value for an environment variable in the Vercel dashboard
does not affect an already-built deployment. After changing `APP_MODE`,
trigger a redeploy (Deployments tab → Redeploy, or push a commit) before
the new mode takes effect.

**After any vulnerable-mode demo/grading window, flip `APP_MODE` back to
`secure` and redeploy immediately.** See "Accepted risk / production
deployment" in `docs/EXPLOITS.md` for the reasoning and mitigations behind
running the vulnerable build publicly at all.

## Testing

The Playwright suite (`tests/jobs-ui.spec.ts`, `tests/injection.spec.ts`)
covers the search UI and all three injection types. The injection spec
detects the server's current `mode` at runtime and asserts the correct
outcome for whichever mode is live, so it's safe to run against either
build without editing anything.

Run locally against `npm run dev` (`http://localhost:3000`):
```bash
npm run test
```

Run against a deployed URL, including production:
```bash
PLAYWRIGHT_TEST_BASE_URL=https://your-deployment.vercel.app npx playwright test
```

Both spec files (8 tests) have been verified passing against
`https://job-finder-zeta-henna.vercel.app` in both `secure` and
`vulnerable` mode, including a manual confirmation that a destructive
stacked-query payload is blocked by `vuln_demo_role` in production (see
`docs/EXPLOITS.md` section 6).

## Exploit documentation

See [`docs/EXPLOITS.md`](docs/EXPLOITS.md) for the exact payloads used for
UNION-based, boolean-blind, and time-based blind SQL injection — including
the raw SQL each payload produces, example requests/responses, impact, the
parameterized-query fix, and confirmation that each payload fails against
the secure build. It also documents an automated `sqlmap` run against both
builds.
