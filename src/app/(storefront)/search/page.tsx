import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the My Vanity collection.",
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim();

  const results = query ? await listProducts({ search: query }) : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl font-light">Search</h1>

      {/* A plain GET form: it works with JavaScript disabled and keeps the query
          in the URL, so results are linkable and shareable. */}
      <form action="/search" method="get" className="mt-8 flex max-w-lg gap-3">
        <label htmlFor="q" className="sr-only">
          Search products
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Serum, lipstick, perfume…"
          autoComplete="off"
          className="min-w-0 flex-1 border border-ink/20 bg-transparent px-4 py-3 text-sm placeholder:text-ink-soft/60 focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          className="bg-ink px-8 py-3 text-xs tracking-brand text-cream uppercase transition-colors hover:bg-gold-deep"
        >
          Search
        </button>
      </form>

      {query && (
        <p className="mt-10 text-[0.65rem] tracking-brand text-ink-soft uppercase">
          {results.length} {results.length === 1 ? "result" : "results"} for
          &ldquo;{query}&rdquo;
        </p>
      )}

      {query && results.length === 0 && (
        <p className="mt-6 border border-dashed border-ink/15 p-12 text-center text-sm text-ink-soft">
          Nothing matched that. Try a shorter or more general word.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {results.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
