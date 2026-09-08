import type { NextAuthConfig } from "next-auth";

/**
 * The half of the auth config that carries no database or bcrypt import.
 *
 * `src/proxy.ts` builds a NextAuth instance from *this* object alone, so the
 * per-request proxy check stays a cookie read. The full config in `src/auth.ts`
 * spreads this and adds the Credentials provider.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
  },
  // Netlify terminates TLS upstream; without this NextAuth rejects the forwarded host.
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
