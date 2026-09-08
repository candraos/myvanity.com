import type { Metadata } from "next";

import { AdminCategoryManager } from "@/components/admin-category-manager";
import { listCategories } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-light">Categories</h1>
      <p className="mt-2 text-sm text-ink-soft">
        A category can only be deleted once it holds no products.
      </p>
      <AdminCategoryManager categories={categories} />
    </div>
  );
}
