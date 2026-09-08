import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

/**
 * Product names repeat ("Rose Serum" from two brands), but the storefront routes
 * on slug, so collisions get a numeric suffix rather than a 500 from the unique
 * index. `excludeId` lets an edit keep its own slug.
 */
export async function uniqueProductSlug(name: string, excludeId?: string) {
  const base = slugify(name) || "product";

  for (let suffix = 1; suffix <= 100; suffix++) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
  }

  // Vanishingly unlikely; keeps the loop bounded rather than spinning.
  return `${base}-${Date.now()}`;
}
