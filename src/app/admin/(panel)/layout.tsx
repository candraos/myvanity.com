import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin-nav";
import { Logo } from "@/components/logo";
import { requireAdmin } from "@/lib/dal";

export default async function AdminPanelLayout({
  children,
}: LayoutProps<"/admin">) {
  // The proxy already redirected anonymous browsers, but this is the check that
  // actually guards the data — proxy checks are optimistic by design.
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-b border-ink/10 bg-cream-deep/40 lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-6 py-5 lg:block">
          <Logo href="/admin" />
          <p className="mt-1 hidden text-[0.6rem] tracking-brand text-ink-soft uppercase lg:block">
            Admin
          </p>
        </div>

        <AdminNav />

        <div className="border-t border-ink/10 px-6 py-5">
          <p className="text-xs text-ink-soft">
            Signed in as{" "}
            <span className="text-ink">{admin.name ?? "admin"}</span>
          </p>
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="text-xs tracking-widest text-ink-soft uppercase underline-offset-4 hover:text-ink hover:underline"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-3 block text-xs tracking-widest text-ink-soft uppercase underline-offset-4 hover:text-ink hover:underline"
          >
            View store
          </Link>
        </div>
      </aside>

      <main className="flex-1 px-6 py-10 lg:px-10">{children}</main>
    </div>
  );
}
