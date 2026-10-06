/**
 * Product image storage.
 *
 * The database stores an opaque key (e.g. `products/a1b2c3.webp`), never an
 * absolute URL, and every image is served through `/api/images/<key>`. That way a
 * row written on a laptop resolves identically on Netlify, and swapping the
 * backend never requires a data migration.
 *
 * Backend selection:
 *   - Netlify (production deploy) -> Netlify Blobs, global store, persists across deploys
 *   - Netlify (preview/branch)    -> Netlify Blobs, deploy-scoped store, cleaned up with the deploy
 *   - Local development           -> `.uploads/` on disk (git-ignored)
 *
 * Serverless filesystems are ephemeral, which is why local disk is dev-only.
 */

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/** Only these three types are accepted, verified by magic bytes rather than by the client's claim. */
const ACCEPTED = [
  { ext: "jpg", contentType: "image/jpeg", matches: (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: "png",
    contentType: "image/png",
    matches: (b: Uint8Array) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    ext: "webp",
    contentType: "image/webp",
    // "RIFF" .... "WEBP"
    matches: (b: Uint8Array) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
] as const;

export class ImageValidationError extends Error {}

function detectType(bytes: Uint8Array) {
  const match = ACCEPTED.find((candidate) => candidate.matches(bytes));
  if (!match) {
    throw new ImageValidationError(
      "Unsupported image. Only JPEG, PNG and WebP files are accepted.",
    );
  }
  return match;
}

// process.env.NETLIFY is a *build-time* flag and isn't set in the deployed
// function's runtime; NETLIFY_BLOBS_CONTEXT is, and it's the one that actually
// says whether a Blobs store is available here.
const onNetlify = Boolean(process.env.NETLIFY_BLOBS_CONTEXT);
const LOCAL_DIR = path.join(process.cwd(), ".uploads");

/**
 * Keys are generated here, never derived from the uploaded filename, so a crafted
 * name cannot traverse directories or collide with an existing product's image.
 */
function newKey(ext: string) {
  return `products/${randomUUID()}.${ext}`;
}

/** Rejects anything that isn't a key this module could have produced. */
export function isValidKey(key: string): boolean {
  return /^products\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(key);
}

async function getBlobStore() {
  const { getStore, getDeployStore } = await import("@netlify/blobs");
  const name = "product-images";
  // Keep preview/branch uploads out of the production store.
  return process.env.DEPLOY_CONTEXT === "production"
    ? getStore(name)
    : getDeployStore(name);
}

export type StoredImage = { body: Uint8Array; contentType: string };

/**
 * Validates and persists an uploaded image.
 * @returns the storage key to record on the product.
 */
export async function saveImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError("Image is larger than the 5MB limit.");
  }
  if (file.size === 0) {
    throw new ImageValidationError("Image is empty.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { ext, contentType } = detectType(bytes);
  const key = newKey(ext);

  if (onNetlify) {
    const store = await getBlobStore();
    // contentType is stored so the serving route can set the right header.
    await store.set(key, bytes.buffer as ArrayBuffer, { metadata: { contentType } });
  } else {
    const target = path.join(LOCAL_DIR, key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }

  return key;
}

export async function readImage(key: string): Promise<StoredImage | null> {
  if (!isValidKey(key)) return null;

  if (onNetlify) {
    const store = await getBlobStore();
    const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!result?.data) return null;
    return {
      body: new Uint8Array(result.data as ArrayBuffer),
      contentType: String(result.metadata?.contentType ?? "application/octet-stream"),
    };
  }

  try {
    const body = await readFile(path.join(LOCAL_DIR, key));
    const ext = key.split(".").pop();
    const contentType =
      ACCEPTED.find((c) => c.ext === ext)?.contentType ?? "application/octet-stream";
    return { body: new Uint8Array(body), contentType };
  } catch {
    return null;
  }
}

/** Best-effort delete. A missing object is not an error — the row is going away regardless. */
export async function deleteImage(key: string): Promise<void> {
  if (!isValidKey(key)) return;

  if (onNetlify) {
    const store = await getBlobStore();
    await store.delete(key);
    return;
  }

  try {
    await unlink(path.join(LOCAL_DIR, key));
  } catch {
    // already gone
  }
}

/** Public URL for a stored key. */
export function imageUrl(key: string): string {
  return `/api/images/${key}`;
}
