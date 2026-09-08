import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getProductBySlug, listProducts } from "@/lib/dal";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description:
      product.description ??
      `${product.name} — available now at My Vanity in ${product.category.name}.`,
    openGraph: {
      title: product.name,
      images: [{ url: product.mainImage }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = (await listProducts({ categorySlug: product.category.slug }))
    .filter((entry) => entry.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <nav aria-label="Breadcrumb" className="text-xs tracking-widest uppercase">
        <ol className="flex flex-wrap items-center gap-2 text-ink-soft">
          <li>
            <Link href="/products" className="hover:text-ink">
              Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-ink"
            >
              {product.category.name}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:pt-8">
          <p className="text-[0.65rem] tracking-brand text-ink-soft uppercase">
            {product.category.name}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight font-light sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-6 font-display text-3xl text-gold-deep">
            {formatPrice(product.price)}
          </p>

          {product.isOutOfStock && (
            <p className="mt-4 inline-block bg-ink/85 px-3 py-1 text-[0.6rem] tracking-brand text-cream uppercase">
              Out of stock
            </p>
          )}

          {product.description && (
            <div className="mt-8 border-t border-ink/10 pt-8">
              <p className="text-sm leading-relaxed whitespace-pre-line text-ink-soft">
                {product.description}
              </p>
            </div>
          )}

          <div className="mt-10">
            <WhatsAppButton product={product} disabled={product.isOutOfStock} />
            <p className="mt-4 text-center text-xs leading-relaxed text-ink-soft">
              {product.isOutOfStock
                ? "This piece is currently unavailable — message us to be told when it returns."
                : "Opens WhatsApp with this product ready to send. We'll confirm availability and delivery."}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 border-t border-ink/10 pt-12">
          <h2 className="font-display text-3xl font-light">
            More in {product.category.name}
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {related.map((entry) => (
              <li key={entry.id}>
                <ProductCard product={entry} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
