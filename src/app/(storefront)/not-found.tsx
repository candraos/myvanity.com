import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
      <p className="text-[0.65rem] tracking-brand text-ink-soft uppercase">
        404
      </p>
      <h1 className="mt-6 font-display text-4xl font-light">
        We couldn&apos;t find that
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        The page or product you&apos;re looking for may have been removed.
      </p>
      <Link
        href="/products"
        className="mt-10 bg-ink px-10 py-4 text-xs tracking-brand text-cream uppercase transition-colors hover:bg-gold-deep"
      >
        Browse the collection
      </Link>
    </div>
  );
}
