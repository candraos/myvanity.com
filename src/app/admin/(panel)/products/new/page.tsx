import type { Metadata } from "next";

import { ProductForm } from "@/components/product-form";
import { listCategories } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Add product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-light">Add product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
