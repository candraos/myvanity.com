import Link from "next/link";

import { Logo } from "@/components/logo";
import { whatsappOrderUrl } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-cream-deep/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
            A curated collection of beauty you already love — chosen with care,
            delivered with it too.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-lg">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/products" className="hover:text-ink">
                All products
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-ink">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-ink">
                Search
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg">Order</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            No checkout, no account. Message us and we&apos;ll confirm
            availability and delivery.
          </p>
          <a
            href={whatsappOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block border-b border-gold pb-0.5 text-sm tracking-wide text-ink transition-colors hover:border-gold-deep hover:text-gold-deep"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs tracking-widest text-ink-soft uppercase">
          © {new Date().getFullYear()} My Vanity — Everything You Love
        </p>
      </div>
    </footer>
  );
}
