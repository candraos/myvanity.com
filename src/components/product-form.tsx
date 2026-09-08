"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import type { CategoryView, ProductView } from "@/lib/dal";
import { cn } from "@/lib/utils";

type UploadedImage = { key: string; url: string };

export function ProductForm({
  categories,
  product,
}: {
  categories: CategoryView[];
  product?: ProductView;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<UploadedImage[]>(
    product
      ? product.imageKeys.map((key, index) => ({
          key,
          url: product.images[index],
        }))
      : [],
  );
  const [mainImage, setMainImage] = useState(product?.mainImageKey ?? "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    setUploading(true);
    setErrors((current) => ({ ...current, images: "" }));

    const body = new FormData();
    for (const file of Array.from(fileList)) body.append("files", file);

    try {
      const response = await fetch("/api/uploads", { method: "POST", body });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setErrors((current) => ({
          ...current,
          images: payload?.error ?? "Upload failed.",
        }));
        return;
      }

      const uploaded: UploadedImage[] = payload.images;
      setImages((current) => [...current, ...uploaded]);
      // First image uploaded becomes the main one until the admin says otherwise.
      setMainImage((current) => current || uploaded[0]?.key || "");
    } catch {
      setErrors((current) => ({
        ...current,
        images: "Couldn't reach the server while uploading.",
      }));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function removeImage(key: string) {
    const next = images.filter((image) => image.key !== key);
    setImages(next);

    // Removing the main image promotes whatever is left, so the form never
    // submits a mainImage that isn't in images.
    if (mainImage === key) setMainImage(next[0]?.key ?? "");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: String(formData.get("price") ?? ""),
      categoryId: String(formData.get("categoryId") ?? ""),
      isOutOfStock: formData.get("isOutOfStock") === "on",
      images: images.map((image) => image.key),
      mainImage,
    };

    try {
      const response = await fetch(
        product ? `/api/products/${product.id}` : "/api/products",
        {
          method: product ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setErrors(
          body?.fields ?? { _form: body?.error ?? "Couldn't save the product." },
        );
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setErrors({ _form: "Couldn't reach the server." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-8" noValidate>
      {errors._form && (
        <p
          role="alert"
          className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errors._form}
        </p>
      )}

      <Field label="Name" name="name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={product?.name}
          className={inputClass}
        />
      </Field>

      <Field label="Description" name="description" error={errors.description}>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={product?.description ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Price (USD)" name="price" error={errors.price}>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
            className={inputClass}
          />
        </Field>

        <Field label="Category" name="categoryId" error={errors.categoryId}>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.category.id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {categories.length === 0 && (
        <p className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You need at least one category first.{" "}
          <Link href="/admin/categories" className="underline">
            Create one
          </Link>
          .
        </p>
      )}

      <fieldset>
        <legend className="text-[0.65rem] tracking-brand text-ink-soft uppercase">
          Images
        </legend>

        <div className="mt-3">
          <input
            ref={fileInput}
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={(event) => handleFiles(event.target.files)}
            className="block w-full text-sm text-ink-soft file:mr-4 file:border file:border-ink/20 file:bg-transparent file:px-4 file:py-2 file:text-xs file:tracking-widest file:uppercase hover:file:border-ink"
          />
          <p className="mt-2 text-xs text-ink-soft">
            JPEG, PNG or WebP · up to 5MB each. Click an image to make it the
            main one.
          </p>
          {uploading && (
            <p className="mt-2 text-xs text-ink-soft">Uploading…</p>
          )}
          {errors.images && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {errors.images}
            </p>
          )}
          {errors.mainImage && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {errors.mainImage}
            </p>
          )}
        </div>

        {images.length > 0 && (
          <ul className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4">
            {images.map((image) => {
              const isMain = image.key === mainImage;

              return (
                <li key={image.key} className="relative">
                  <button
                    type="button"
                    onClick={() => setMainImage(image.key)}
                    aria-pressed={isMain}
                    className={cn(
                      "relative block aspect-square w-full overflow-hidden border-2 transition-colors",
                      isMain
                        ? "border-gold-deep"
                        : "border-transparent hover:border-ink/20",
                    )}
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                    {isMain && (
                      <span className="absolute inset-x-0 bottom-0 bg-gold-deep py-1 text-center text-[0.55rem] tracking-widest text-cream uppercase">
                        Main
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage(image.key)}
                    aria-label="Remove image"
                    className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-cream hover:bg-red-700"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>

      <label className="flex items-center gap-3 text-sm">
        <input
          name="isOutOfStock"
          type="checkbox"
          defaultChecked={product?.isOutOfStock}
          className="h-4 w-4 accent-[#1a1a1a]"
        />
        Mark as out of stock
      </label>

      <div className="flex items-center gap-4 border-t border-ink/10 pt-6">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="bg-ink px-8 py-4 text-xs tracking-brand text-cream uppercase transition-colors hover:bg-gold-deep disabled:opacity-60"
        >
          {submitting
            ? "Saving…"
            : product
              ? "Save changes"
              : "Create product"}
        </button>
        <Link
          href="/admin/products"
          className="text-xs tracking-widest text-ink-soft uppercase underline-offset-4 hover:text-ink hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

const inputClass =
  "mt-2 w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-ink focus:outline-none";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[0.65rem] tracking-brand text-ink-soft uppercase"
      >
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
