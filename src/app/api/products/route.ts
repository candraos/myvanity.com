import { NextResponse } from "next/server";

import { badRequest, handleError, readJson, requireSession } from "@/lib/api";
import { listProducts, toProductView } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { uniqueProductSlug } from "@/lib/slugs";
import { productInputSchema } from "@/lib/validation";

/** Public — supports `?category=<slug>` and `?search=<text>`. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    return NextResponse.json(
      await listProducts({
        categorySlug: searchParams.get("category") ?? undefined,
        search: searchParams.get("search")?.trim() || undefined,
      }),
    );
  } catch (error) {
    return handleError(error, "GET /api/products");
  }
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  try {
    const parsed = productInputSchema.safeParse(await readJson(request));
    if (!parsed.success) return badRequest(parsed.error);

    const { name, description, price, categoryId, images, mainImage, isOutOfStock } =
      parsed.data;

    const product = await prisma.product.create({
      data: {
        name,
        slug: await uniqueProductSlug(name),
        description: description ?? null,
        price,
        categoryId,
        images,
        mainImage,
        isOutOfStock,
      },
      include: { category: true },
    });

    return NextResponse.json(toProductView(product), { status: 201 });
  } catch (error) {
    return handleError(error, "POST /api/products");
  }
}
