import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { listCategories, listProducts } from "@/lib/dal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse the full My Vanity collection.",
};

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  // searchParams is a Promise in Next.js 16 — synchronous access was removed.
  const { category } = await searchParams;
  const categorySlug = typeof category === "string" ? category : undefined;

  const [products, categories] = await Promise.all([
    listProducts({ categorySlug }),
    listCategories(),
  ]);

  const active = categories.find((entry) => entry.slug === categorySlug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header>
        <h1 className="font-display text-4xl font-light">
          {active ? active.name : "All products"}
        </h1>
        {active?.description && (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
            {active.description}
          </p>
        )}
      </header>

      {categories.length > 0 && (
        <nav aria-label="Filter by category" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            <li>
              <FilterChip href="/products" active={!categorySlug}>
                All
              </FilterChip>
            </li>
            {categories.map((entry) => (
              <li key={entry.id}>
                <FilterChip
                  href={`/products?category=${entry.slug}`}
                  active={entry.slug === categorySlug}
                >
                  {entry.name}
                </FilterChip>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {categorySlug && !active ? (
        <p className="mt-12 border border-dashed border-ink/15 p-12 text-center text-sm text-ink-soft">
          That category doesn&apos;t exist.{" "}
          <Link href="/products" className="underline">
            View all products
          </Link>
          .
        </p>
      ) : products.length === 0 ? (
        <p className="mt-12 border border-dashed border-ink/15 p-12 text-center text-sm text-ink-soft">
          Nothing here yet.
        </p>
      ) : (
        <>
          <p className="mt-10 text-[0.65rem] tracking-brand text-ink-soft uppercase">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {products.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} priority={index < 4} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-block border px-5 py-2 text-xs tracking-widest uppercase transition-colors",
        active
          ? "border-ink bg-ink text-cream"
          : "border-ink/15 text-ink-soft hover:border-ink/40 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
