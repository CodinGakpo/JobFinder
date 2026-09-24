import { NextRequest, NextResponse } from "next/server";
import { MODE_COOKIE, isLoggedIn, resolveMode } from "@/lib/mode";

export async function GET() {
  return NextResponse.json({ mode: await resolveMode(), canToggle: await isLoggedIn() });
}

export async function POST(req: NextRequest) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }
  const { mode } = await req.json().catch(() => ({}));
  if (mode !== "secure" && mode !== "vulnerable") {
    return NextResponse.json({ error: "mode must be 'secure' or 'vulnerable'" }, { status: 400 });
  }
  const res = NextResponse.json({ mode, canToggle: true });
  // No maxAge: a session cookie, so the override ends when the browser closes.
  res.cookies.set(MODE_COOKIE, mode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res;
}
