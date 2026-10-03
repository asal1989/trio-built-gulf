import { NextResponse, type NextRequest } from "next/server";

/**
 * First line of defence for the admin area: no session cookie, no entry.
 * (The cookie is only checked for presence here — every page and action
 * validates the session against the database.)
 */
const COOKIES = ["__Host-tbg_session", "tbg_session"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith("/admin/login");
  const hasSession = COOKIES.some((c) => request.cookies.has(c));

  if (!hasSession && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login/", request.url));
  }

  const response = NextResponse.next();
  // The admin must never be cached or indexed.
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
