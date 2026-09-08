"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { CategoryView } from "@/lib/dal";

export function MobileNav({ categories }: { categories: CategoryView[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever navigation lands somewhere new.
  useEffect(() => setOpen(false), [pathname]);

  // While the drawer is open, don't let the page scroll behind it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center text-ink"
      >
        <span aria-hidden="true" className="space-y-1.5">
          <span className="block h-px w-6 bg-ink" />
          <span className="block h-px w-6 bg-ink" />
          <span className="block h-px w-4 bg-ink" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />

          <nav
            aria-label="Mobile"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-cream px-6 py-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-brand text-ink-soft uppercase">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center text-xl leading-none text-ink-soft"
              >
                ×
              </button>
            </div>

            <ul className="mt-8 space-y-4 font-display text-2xl">
              <li>
                <Link href="/products">All products</Link>
              </li>
              <li>
                <Link href="/categories">Categories</Link>
              </li>
              <li>
                <Link href="/search">Search</Link>
              </li>
            </ul>

            {categories.length > 0 && (
              <>
                <h2 className="mt-10 text-xs tracking-brand text-ink-soft uppercase">
                  Shop by category
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-ink-soft">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="hover:text-ink"
                      >
                        {category.name}
                        <span className="ml-2 text-xs text-ink-soft/70">
                          {category.productCount}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
