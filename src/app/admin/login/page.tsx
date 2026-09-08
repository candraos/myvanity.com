import type { Metadata } from "next";

import { LoginForm } from "@/app/admin/login/login-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Logo />
          <h1 className="mt-8 font-display text-3xl font-light">Admin</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Sign in to manage products and categories.
          </p>
        </div>

        <LoginForm
          callbackUrl={typeof callbackUrl === "string" ? callbackUrl : "/admin"}
        />
      </div>
    </main>
  );
}
