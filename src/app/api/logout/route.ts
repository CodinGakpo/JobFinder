import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { MODE_COOKIE } from "@/lib/mode";

export async function POST(req: NextRequest) {
  // 303 so the browser follows the redirect with GET after a form POST.
  const res = NextResponse.redirect(new URL("/jobs", req.url), 303);
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(MODE_COOKIE);
  return res;
}
