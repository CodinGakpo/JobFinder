import { createHmac, timingSafeEqual } from "node:crypto";

// Single hardcoded demo account, by design: it lets the login gate work on a
// deployment without adding any env vars in the hosting dashboard. This is a
// gate for a course demo, not real account security — the credentials and the
// signing secret live in the repo.
export const DEMO_USERNAME = "demo";
export const DEMO_PASSWORD = "jobfinder-demo";
const SESSION_SECRET = "jobfinder-demo-session-secret";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_S = 60 * 60 * 8;

function sign(payload: string): string {
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkCredentials(username: unknown, password: unknown): boolean {
  return (
    typeof username === "string" &&
    typeof password === "string" &&
    safeEqual(username, DEMO_USERNAME) &&
    safeEqual(password, DEMO_PASSWORD)
  );
}

// Token format: "<username>.<expiryUnixSeconds>.<hmac>"
export function createSessionToken(): string {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_S;
  const payload = `${DEMO_USERNAME}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [user, expires, sig] = parts;
  if (!safeEqual(sig, sign(`${user}.${expires}`))) return false;
  return user === DEMO_USERNAME && Number(expires) > Date.now() / 1000;
}
