"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { ProductView } from "@/lib/dal";
import { cn, formatPrice } from "@/lib/utils";

export function AdminProductList({ products }: { products: ProductView[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Tracks the row currently being mutated, so only that row's controls disable.
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function mutate(
    id: string,
    request: () => Promise<Response>,
  ): Promise<void> {
    setBusyId(id);
    setError(null);

    try {
      const response = await request();
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "That didn't work. Please try again.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setBusyId(null);
    }
  }

  const toggleStock = (product: ProductView) =>
    mutate(product.id, () =>
      fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOutOfStock: !product.isOutOfStock }),
      }),
    );

  const remove = (product: ProductView) => {
    if (
      !window.confirm(
        `Delete "${product.name}"? This also removes its images and cannot be undone.`,
      )
    ) {
      return;
    }
    return mutate(product.id, () =>
      fetch(`/api/products/${product.id}`, { method: "DELETE" }),
    );
  };

  if (products.length === 0) {
    return (
      <p className="mt-8 border border-dashed border-ink/15 p-12 text-center text-sm text-ink-soft">
        No products yet.{" "}
        <Link href="/admin/products/new" className="underline">
          Add your first one
        </Link>
        .
      </p>
    );
  }

  return (
    <>
      {error && (
        <p
          role="alert"
          className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
        {products.map((product) => {
          const busy = busyId === product.id || isPending;

          return (
            <li
              key={product.id}
              className="flex flex-wrap items-center gap-4 py-4"
            >
              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-cream-deep">
                <Image
                  src={product.mainImage}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{product.name}</p>
                <p className="text-xs text-ink-soft">
                  {product.category.name} · {formatPrice(product.price)}
                </p>
              </div>

              <span
                className={cn(
                  "shrink-0 px-2 py-1 text-[0.6rem] tracking-widest uppercase",
                  product.isOutOfStock
                    ? "bg-ink/85 text-cream"
                    : "border border-ink/15 text-ink-soft",
                )}
              >
                {product.isOutOfStock ? "Out of stock" : "In stock"}
              </span>

              <div className="flex shrink-0 items-center gap-4 text-xs tracking-widest uppercase">
                <button
                  type="button"
                  onClick={() => toggleStock(product)}
                  disabled={busy}
                  className="text-ink-soft underline-offset-4 hover:text-ink hover:underline disabled:opacity-50"
                >
                  {product.isOutOfStock ? "Mark in stock" : "Mark out"}
                </button>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => remove(product)}
                  disabled={busy}
                  className="text-red-700 underline-offset-4 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
