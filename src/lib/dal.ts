import { cache } from "react";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { imageUrl } from "@/lib/storage";

/**
 * Data Access Layer.
 *
 * Everything the UI renders goes through here so that two conversions happen in
 * exactly one place: Prisma's `Decimal` becomes a plain number, and storage keys
 * become servable URLs. Both matter because these objects cross into Client
 * Components, where a Decimal instance would fail to serialize.
 */

export type ProductView = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  isOutOfStock: boolean;
  /** Servable URLs, in upload order. */
  images: string[];
  mainImage: string;
  /** Raw storage keys — the admin edit form round-trips these back on save. */
  imageKeys: string[];
  mainImageKey: string;
  category: { id: string; name: string; slug: string };
};

export type CategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
};

type ProductRow = Awaited<
  ReturnType<typeof prisma.product.findFirstOrThrow<{ include: { category: true } }>>
>;

export function toProductView(row: ProductRow): ProductView {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price.toNumber(),
    isOutOfStock: row.isOutOfStock,
    images: row.images.map(imageUrl),
    mainImage: imageUrl(row.mainImage),
    imageKeys: row.images,
    mainImageKey: row.mainImage,
    category: {
      id: row.category.id,
      name: row.category.name,
      slug: row.category.slug,
    },
  };
}

export async function listProducts(options?: {
  categorySlug?: string;
  search?: string;
}): Promise<ProductView[]> {
  const { categorySlug, search } = options ?? {};

  const rows = await prisma.product.findMany({
    where: {
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: [{ isOutOfStock: "asc" }, { createdAt: "desc" }],
  });

  return rows.map(toProductView);
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  return row ? toProductView(row) : null;
}

export async function getProductById(id: string): Promise<ProductView | null> {
  const row = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  return row ? toProductView(row) : null;
}

export async function listCategories(): Promise<CategoryView[]> {
  const rows = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    productCount: row._count.products,
  }));
}

export async function getDashboardStats() {
  const [products, categories, outOfStock] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { isOutOfStock: true } }),
  ]);
  return { products, categories, outOfStock, inStock: products - outOfStock };
}

/**
 * The single authorization check for admin work. `cache` dedupes it across a
 * render pass, so calling it in both a layout and a page costs one verification.
 */
export const requireAdmin = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
});
