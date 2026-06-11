import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { jwtDecode } from "jwt-decode";

export interface JwtPayloadType {
    iss?: string;
    sub?: string;
    aud?: string[] | string;
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    role?: string;
}

export async function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);

  // #region Logout Middleware
  if (request.nextUrl.pathname.includes("/logout")) {
    headers.set("Set-Cookie", "_TCS_AUTH=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax");
    return NextResponse.redirect(new URL('/', request.url), { headers });
  }
  // #endregion

  // #region Security Middleware
  if (request.cookies.get("_TCS_AUTH")) {
    const decoded = jwtDecode<JwtPayloadType>(request.cookies.get("_TCS_AUTH")?.value || "");
    
    if (decoded.role === "product_manager" && !request.nextUrl.pathname.includes("/product-manager")) {
      return NextResponse.redirect(new URL('/product-manager', request.url), { headers });
    }
    else if (decoded.role === "sales_manager" && !request.nextUrl.pathname.includes("/sales-manager")) {
      return NextResponse.redirect(new URL('/sales-manager', request.url), { headers });
    }
    else if (decoded.role === "user" && (request.nextUrl.pathname.includes("/product-manager") || request.nextUrl.pathname.includes("/sales-manager"))) {
      return NextResponse.redirect(new URL('/', request.url), { headers });
    }
  }

  if (!request.cookies.get("_TCS_AUTH") && (request.nextUrl.pathname.includes("/product-manager") || request.nextUrl.pathname.includes("/sales-manager"))) {
    return NextResponse.redirect(new URL('/', request.url), { headers });
  }
  // #endregion

  return NextResponse.next({ headers });
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};