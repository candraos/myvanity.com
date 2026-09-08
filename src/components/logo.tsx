import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The "M | V" mark. The divider is decorative, so it's hidden from screen
 * readers and the link carries a plain accessible name instead.
 */
export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="My Vanity — home"
      className={cn(
        "group inline-flex items-baseline gap-2 font-display leading-none",
        className,
      )}
    >
      <span className="text-2xl font-light tracking-[0.15em]">M</span>
      <span
        aria-hidden="true"
        className="text-xl font-light text-gold transition-colors group-hover:text-gold-deep"
      >
        |
      </span>
      <span className="text-2xl font-light tracking-[0.15em]">V</span>
    </Link>
  );
}
