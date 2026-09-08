import { NextResponse } from "next/server";

import { handleError, requireSession } from "@/lib/api";
import { ImageValidationError, imageUrl, saveImage } from "@/lib/storage";

const MAX_FILES_PER_REQUEST = 10;

/**
 * Admin-only image upload. Accepts one or more files under the `files` field and
 * returns the storage keys to attach to a product.
 *
 * File type is decided by magic bytes inside `saveImage`, not by the client's
 * Content-Type header or the filename.
 */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session.ok) return session.response;

  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }
    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Upload at most ${MAX_FILES_PER_REQUEST} images at a time.` },
        { status: 400 },
      );
    }

    const keys: string[] = [];
    for (const file of files) {
      keys.push(await saveImage(file));
    }

    return NextResponse.json(
      { images: keys.map((key) => ({ key, url: imageUrl(key) })) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleError(error, "POST /api/uploads");
  }
}
