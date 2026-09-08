import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import prisma from "@/lib/prisma";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * A real bcrypt hash of a value nobody will guess. When the username doesn't
 * exist we still run one comparison, so response time doesn't reveal which
 * usernames are registered.
 */
const DUMMY_HASH =
  "$2b$12$uJBAA0zQavYRUw/Hq3AsZer2W1oDVyt4sgIKsAqw7QFnz/8S7EzkG";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
          await compare(password, DUMMY_HASH);
          return null;
        }

        if (!(await compare(password, user.passwordHash))) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        // Returning null (rather than throwing) keeps the failure message generic.
        return { id: user.id, name: user.username, email: user.email };
      },
    }),
  ],
});
