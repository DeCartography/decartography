import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  // Redirect from "/" to "/dashboard" by default
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check if the _auth cookie exists
  const authCookieExists = request.cookies.has("_auth");

  if (request.nextUrl.pathname.startsWith("/dashboard") && !authCookieExists) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect from login to dashboard if the _auth cookie exists
  if (request.nextUrl.pathname.startsWith("/login") && authCookieExists) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
