import { NextResponse } from "next/server";

import { badRequest, handleError, readJson, requireSession } from "@/lib/api";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { categoryInputSchema } from "@/lib/validation";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/categories/[id]">,
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  try {
    const { id } = await ctx.params;
    const parsed = categoryInputSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);

    const { name, description } = parsed.data;
    const slug = slugify(name);

    if (!slug) {
      return NextResponse.json(
        { error: "Validation failed", fields: { name: "Name must contain letters or numbers." } },
        { status: 400 },
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, description: description ?? null },
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleError(error, "PUT /api/categories/[id]");
  }
}

/**
 * The schema cascades Product deletes from Category, so deleting a populated
 * category would wipe products (and orphan their image blobs) with no warning.
 * Refuse instead, and tell the admin how many products are in the way.
 */
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/categories/[id]">,
) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  try {
    const { id } = await ctx.params;

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        {
          error:
            `This category still holds ${productCount} product${productCount === 1 ? "" : "s"}. ` +
            "Move or delete them first.",
        },
        { status: 409 },
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, "DELETE /api/categories/[id]");
  }
}
