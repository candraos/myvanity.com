import Link from "next/link";

import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { listCategories } from "@/lib/dal";

export async function SiteHeader() {
  const categories = await listCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <p className="bg-ink py-2 text-center text-[0.65rem] tracking-brand text-cream uppercase">
        Everything You Love
      </p>

      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <MobileNav categories={categories} />

        <Logo className="md:flex-none" />

        <nav
          aria-label="Main"
          className="ml-auto hidden items-center gap-8 text-sm tracking-wide md:flex"
        >
          <Link href="/products" className="text-ink-soft hover:text-ink">
            Products
          </Link>
          <Link href="/categories" className="text-ink-soft hover:text-ink">
            Categories
          </Link>
          <Link href="/search" className="text-ink-soft hover:text-ink">
            Search
          </Link>
        </nav>

        <Link
          href="/search"
          aria-label="Search products"
          className="ml-auto text-ink-soft hover:text-ink md:ml-0"
        >
          <SearchIcon />
        </Link>
      </div>

      {categories.length > 0 && (
        <nav
          aria-label="Categories"
          className="hidden border-t border-ink/10 md:block"
        >
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3 text-xs tracking-widest uppercase">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="text-ink-soft transition-colors hover:text-gold-deep"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-5 w-5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
