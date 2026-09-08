import { NextResponse } from "next/server";

import {
  badRequest,
  handleError,
  notFound,
  readJson,
  requireSession,
} from "@/lib/api";
import { getProductById, toProductView } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { uniqueProductSlug } from "@/lib/slugs";
import { deleteImage } from "@/lib/storage";
import { productInputSchema, stockToggleSchema } from "@/lib/validation";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/products/[id]">,
) {
  try {
    const { id } = await ctx.params;
    const product = await getProductById(id);
    return product ? NextResponse.json(product) : notFound("Product");
  } catch (error) {
    return handleError(error, "GET /api/products/[id]");
  }
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/products/[id]">,
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  try {
    const { id } = await ctx.params;
    const parsed = productInputSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { images: true },
    });
    if (!existing) return notFound("Product");

    const { name, description, price, categoryId, images, mainImage, isOutOfStock } =
      parsed.data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug: await uniqueProductSlug(name, id),
        description: description ?? null,
        price,
        categoryId,
        images,
        mainImage,
        isOutOfStock,
      },
      include: { category: true },
    });

    // Reclaim blobs for images the admin removed. Done after the row is safely
    // updated, so a storage hiccup can't leave the product pointing at nothing.
    const removed = existing.images.filter((key) => !images.includes(key));
    await Promise.all(removed.map(deleteImage));

    return NextResponse.json(toProductView(product));
  } catch (error) {
    return handleError(error, "PUT /api/products/[id]");
  }
}

/** Stock toggle from the admin product list. */
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/products/[id]">,
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  try {
    const { id } = await ctx.params;
    const parsed = stockToggleSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);

    const product = await prisma.product.update({
      where: { id },
      data: { isOutOfStock: parsed.data.isOutOfStock },
      include: { category: true },
    });

    return NextResponse.json(toProductView(product));
  } catch (error) {
    return handleError(error, "PATCH /api/products/[id]");
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/products/[id]">,
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  try {
    const { id } = await ctx.params;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { images: true },
    });
    if (!existing) return notFound("Product");

    await prisma.product.delete({ where: { id } });
    await Promise.all(existing.images.map(deleteImage));

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, "DELETE /api/products/[id]");
  }
}
