"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

/**
 * Only ever redirect to a path on this site. Without this check, a crafted
 * `?callbackUrl=https://evil.example` would turn the login form into an open
 * redirect that borrows the store's credibility.
 */
function safeRedirect(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value : "";
  const isInternal = path.startsWith("/") && !path.startsWith("//");
  return isInternal ? path : "/admin";
}

export async function login(
  _previous: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: safeRedirect(formData.get("callbackUrl")),
    });
  } catch (error) {
    // A successful sign-in throws NEXT_REDIRECT, which must reach the framework.
    if (error instanceof AuthError) {
      // Deliberately vague: don't reveal which half was wrong.
      return "Incorrect username or password.";
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
