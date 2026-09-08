import { readImage } from "@/lib/storage";

/**
 * Serves product images from whichever storage backend is active.
 *
 * Public by design — these are storefront images. `readImage` rejects any key
 * that doesn't match the generated `products/<uuid>.<ext>` shape, so this cannot
 * be walked into other files.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/images/[...key]">,
) {
  const { key } = await ctx.params;
  const image = await readImage(key.join("/"));

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(image.body as BodyInit, {
    headers: {
      "Content-Type": image.contentType,
      // Keys embed a UUID and are never reused, so the bytes at a key never change.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
