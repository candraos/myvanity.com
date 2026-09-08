import { NextResponse } from "next/server";

import { badRequest, handleError, readJson, requireSession } from "@/lib/api";
import { listCategories } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { categoryInputSchema } from "@/lib/validation";

/** Public — the storefront's category nav reads this. */
export async function GET() {
  try {
    return NextResponse.json(await listCategories());
  } catch (error) {
    return handleError(error, "GET /api/categories");
  }
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  try {
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

    const category = await prisma.category.create({
      data: { name, slug, description: description ?? null },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleError(error, "POST /api/categories");
  }
}
