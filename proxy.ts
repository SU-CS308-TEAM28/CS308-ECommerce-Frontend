import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);

  // #region Logout Middleware
  if (request.nextUrl.pathname.includes("/logout")) {
    headers.set("Set-Cookie", "_TCS_AUTH=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax");
    return NextResponse.redirect(new URL('/', request.url), { headers });
  }
  // #endregion

  return NextResponse.next({ headers });
}

export const config = {
  matcher: "/logout",
};