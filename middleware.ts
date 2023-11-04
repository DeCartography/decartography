import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  // Redirect from "/" to "/dashboard" by default
  if (request.nextUrl.pathname === "/") {
    // return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.redirect(new URL("https://localhost:3000/dashboard"));

  }

  // Check if the _auth cookie exists
  const authCookieExists = request.cookies.has("_auth");
  // const authCookieExists = request.cookies.has("_auth"&&"address");
  // _auth Cookieが存在するかどうかを確認する関数: authCookieExists

  // 、もし_auth Cookieが存在しない場合は、/loginにリダイレクトする
  if (request.nextUrl.pathname.startsWith("/dashboard") && !authCookieExists) {
    console.log("Redirecting to /login because _auth cookie is missing");  // ここに追加

    // return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.redirect(new URL("https://localhost:3000/login"));
  }

  // authCookieExistsがtrueの場合&&/loginにいる場合、dashboardにリダイレクトする
  // Redirect from login to dashboard if the _auth cookie exists
  if (request.nextUrl.pathname.startsWith("/login") && authCookieExists) {
    console.log("Redirecting to /dashboard because _auth cookie exists");  // ここに追加

    // return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.redirect(new URL("https://localhost:3000/dashboard"));
  }

  // console.log(request.cookies.getAll());
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
