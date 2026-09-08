"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products", exact: false },
  { href: "/admin/categories", label: "Categories", exact: false },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="px-3 pb-4 lg:pb-6">
      <ul className="flex gap-1 overflow-x-auto lg:block lg:space-y-1 lg:overflow-visible">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block whitespace-nowrap px-3 py-2 text-xs tracking-widest uppercase transition-colors",
                  active
                    ? "bg-ink text-cream"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
