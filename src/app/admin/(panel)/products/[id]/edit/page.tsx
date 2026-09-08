import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/product-form";
import { getProductById, listCategories } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProductById(id),
    listCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-light">Edit product</h1>
      <p className="mt-2 text-sm text-ink-soft">{product.name}</p>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
