import { z } from "zod";
import { isValidKey } from "@/lib/storage";

/**
 * Every write path validates through these before touching the database.
 * Written against Zod 4, whose error surface is `error.issues` — v3's
 * `error.errors` no longer exists.
 */

const imageKey = z
  .string()
  .refine(isValidKey, "Not a valid uploaded image reference.");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(60),
  description: optionalText(500),
});

/**
 * Used for both create and edit — the admin form always submits the full product,
 * so there is no partial-update path to keep in sync.
 */
export const productInputSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required.").max(120),
    description: optionalText(2000),
    // Accepts "24.99" from a form field as well as a JSON number.
    price: z.coerce
      .number()
      .positive("Price must be greater than zero.")
      .max(1_000_000, "Price looks unreasonably large."),
    categoryId: z.string().min(1, "Please choose a category."),
    images: z.array(imageKey).min(1, "Upload at least one image."),
    mainImage: imageKey,
    isOutOfStock: z.boolean().default(false),
  })
  .refine((value) => value.images.includes(value.mainImage), {
    message: "The main image must be one of the uploaded images.",
    path: ["mainImage"],
  });

/** The stock toggle on the products list sends only this. */
export const stockToggleSchema = z.object({
  isOutOfStock: z.boolean(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;

/**
 * Turns a ZodError into a flat `{ field: message }` map the admin forms can read.
 * Issues without a path (the cross-field main-image rule lands here when it has
 * no `path`) collect under `_form`. First message per field wins.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.map(String).join(".") : "_form";
    out[key] ??= issue.message;
  }

  return out;
}
