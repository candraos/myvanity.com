import Image from "next/image";
import Link from "next/link";

import type { ProductView } from "@/lib/dal";
import { formatPrice } from "@/lib/utils";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductView;
  priority?: boolean;
}) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-4/5 overflow-hidden bg-cream-deep">
        <Image
          src={product.mainImage}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          priority={priority}
        />

        {product.isOutOfStock && (
          <span className="absolute top-3 left-3 bg-ink/85 px-3 py-1 text-[0.6rem] tracking-brand text-cream uppercase">
            Out of stock
          </span>
        )}
      </div>

      <div className="pt-4">
        <p className="text-[0.65rem] tracking-brand text-ink-soft uppercase">
          {product.category.name}
        </p>
        <h3 className="mt-1 font-display text-xl leading-snug transition-colors group-hover:text-gold-deep">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-ink-soft">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
