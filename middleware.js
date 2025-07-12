// middleware.js
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export function middleware(request) {
  const session = auth.getSession();

  const authRoutes = ["/auth/login", "/auth/register"];

  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname);

  if (isAuthRoute) {
    return NextResponse.next();
  }

  return auth(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
