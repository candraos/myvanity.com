import type { Metadata } from "next";
import Link from "next/link";

import { getDashboardStats, listProducts } from "@/lib/dal";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [stats, products] = await Promise.all([
    getDashboardStats(),
    listProducts(),
  ]);

  const recent = products.slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-light">Dashboard</h1>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Products" value={stats.products} />
        <Stat label="Categories" value={stats.categories} />
        <Stat label="In stock" value={stats.inStock} />
        <Stat label="Out of stock" value={stats.outOfStock} />
      </dl>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="bg-ink px-6 py-3 text-xs tracking-brand text-cream uppercase transition-colors hover:bg-gold-deep"
        >
          Add product
        </Link>
        <Link
          href="/admin/categories"
          className="border border-ink/20 px-6 py-3 text-xs tracking-brand text-ink uppercase transition-colors hover:border-ink"
        >
          Manage categories
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-light">Recently added</h2>

        {recent.length === 0 ? (
          <p className="mt-6 border border-dashed border-ink/15 p-10 text-center text-sm text-ink-soft">
            No products yet.{" "}
            <Link href="/admin/products/new" className="underline">
              Add your first one
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
            {recent.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="flex items-center justify-between gap-4 py-4 hover:bg-ink/[0.03]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{product.name}</span>
                    <span className="block text-xs text-ink-soft">
                      {product.category.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-ink-soft">
                    {formatPrice(product.price)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink/10 bg-cream-deep/30 p-6">
      <dt className="text-[0.6rem] tracking-brand text-ink-soft uppercase">
        {label}
      </dt>
      <dd className="mt-2 font-display text-4xl font-light">{value}</dd>
    </div>
  );
}
