import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { listCategories, listProducts } from "@/lib/dal";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    listProducts(),
    listCategories(),
  ]);

  const featured = products.slice(0, 8);

  return (
    <>
      <section className="border-b border-ink/10 bg-cream-deep/40">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
          <p className="text-[0.65rem] tracking-brand text-ink-soft uppercase">
            My Vanity
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] font-light sm:text-7xl">
            Everything
            <span className="block text-gold-deep italic">you love</span>
          </h1>
          <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-ink-soft">
            A small, carefully chosen beauty collection. Browse at your leisure,
            then message us — we&apos;ll confirm availability and arrange
            delivery.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="bg-ink px-10 py-4 text-xs tracking-brand text-cream uppercase transition-colors hover:bg-gold-deep"
            >
              Shop the collection
            </Link>
            <Link
              href="/categories"
              className="border border-ink/20 px-10 py-4 text-xs tracking-brand text-ink uppercase transition-colors hover:border-ink"
            >
              Browse categories
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-light">Categories</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="group flex h-full flex-col justify-between border border-ink/10 bg-cream-deep/30 p-6 transition-colors hover:border-gold"
                >
                  <span className="font-display text-2xl transition-colors group-hover:text-gold-deep">
                    {category.name}
                  </span>
                  <span className="mt-6 text-[0.65rem] tracking-brand text-ink-soft uppercase">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "product" : "products"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-light">New arrivals</h2>
          {products.length > featured.length && (
            <Link
              href="/products"
              className="text-xs tracking-brand text-ink-soft uppercase hover:text-ink"
            >
              View all
            </Link>
          )}
        </div>

        {featured.length === 0 ? (
          <p className="mt-8 border border-dashed border-ink/15 p-12 text-center text-sm text-ink-soft">
            The collection is being prepared. Please check back shortly.
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {featured.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} priority={index < 4} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-ink/10 bg-cream-deep/40">
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-light">
            Questions before you order?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Tell us what you&apos;re looking for and we&apos;ll help you find it.
          </p>
          <div className="mx-auto mt-8 max-w-xs">
            <WhatsAppButton />
          </div>
        </div>
      </section>
    </>
  );
}
