import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";
import { isSecureMode } from "./db";

export type Mode = "secure" | "vulnerable";

export const MODE_COOKIE = "mode_override";

export async function isLoggedIn(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

// The APP_MODE env var is the default. A logged-in user can override it for
// their own browser via the mode_override cookie; anyone else always gets the
// default, so a cookie set by an anonymous visitor has no effect.
export async function resolveMode(): Promise<Mode> {
  if (await isLoggedIn()) {
    const override = (await cookies()).get(MODE_COOKIE)?.value;
    if (override === "secure" || override === "vulnerable") return override;
  }
  return isSecureMode() ? "secure" : "vulnerable";
}
