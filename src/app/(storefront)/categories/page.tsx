import type { Metadata } from "next";
import Link from "next/link";

import { listCategories } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Categories",
  description: "Shop My Vanity by category.",
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl font-light">Categories</h1>

      {categories.length === 0 ? (
        <p className="mt-12 border border-dashed border-ink/15 p-12 text-center text-sm text-ink-soft">
          No categories yet.
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/products?category=${category.slug}`}
                className="group flex h-full flex-col border border-ink/10 bg-cream-deep/30 p-8 transition-colors hover:border-gold"
              >
                <h2 className="font-display text-2xl transition-colors group-hover:text-gold-deep">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {category.description}
                  </p>
                )}
                <p className="mt-auto pt-8 text-[0.65rem] tracking-brand text-ink-soft uppercase">
                  {category.productCount}{" "}
                  {category.productCount === 1 ? "product" : "products"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
