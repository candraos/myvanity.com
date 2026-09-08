import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`. This runs on the Node.js
 * runtime (the proxy runtime is not configurable).
 *
 * This is an *optimistic* gate only: it reads the session cookie and redirects,
 * which keeps prefetches cheap. It is deliberately not the last line of defence —
 * every admin API route re-checks the session against the database via `auth()`.
 */
const { auth } = NextAuth(authConfig);

const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return isLoggedIn
      ? NextResponse.redirect(new URL("/admin", req.url))
      : NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/admin/login", req.url);
    // Send them back where they were headed once they authenticate.
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};
