import type { Metadata } from "next";
import Link from "next/link";

import { AdminProductList } from "@/components/admin-product-list";
import { listProducts } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-light">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-ink px-6 py-3 text-xs tracking-brand text-cream uppercase transition-colors hover:bg-gold-deep"
        >
          Add product
        </Link>
      </div>

      <AdminProductList products={products} />
    </div>
  );
}
