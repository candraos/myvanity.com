import { cn, whatsappOrderUrl } from "@/lib/utils";

/**
 * The only "checkout" in the store: a wa.me deep link pre-filled with the product
 * name and price. `noopener` matters here because the link opens a new tab.
 */
export function WhatsAppButton({
  product,
  disabled = false,
  className,
}: {
  product?: { name: string; price: number };
  disabled?: boolean;
  className?: string;
}) {
  const label = disabled ? "Currently unavailable" : "Order on WhatsApp";

  if (disabled) {
    return (
      <p
        className={cn(
          "flex w-full items-center justify-center gap-3 border border-ink/15 bg-cream-deep px-8 py-4 text-xs tracking-brand text-ink-soft uppercase",
          className,
        )}
      >
        {label}
      </p>
    );
  }

  return (
    <a
      href={whatsappOrderUrl(product)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex w-full items-center justify-center gap-3 bg-ink px-8 py-4 text-xs tracking-brand text-cream uppercase transition-colors hover:bg-gold-deep",
        className,
      )}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M12.04 2c-5.5 0-9.97 4.47-9.97 9.97 0 1.76.46 3.48 1.34 5L2 22l5.16-1.35a9.94 9.94 0 0 0 4.88 1.25h.01c5.5 0 9.97-4.47 9.97-9.97 0-2.66-1.04-5.16-2.92-7.04A9.9 9.9 0 0 0 12.04 2Zm0 18.15h-.01a8.3 8.3 0 0 1-4.22-1.16l-.3-.18-3.13.82.83-3.05-.2-.31a8.26 8.26 0 0 1-1.27-4.4c0-4.57 3.72-8.29 8.3-8.29 2.21 0 4.29.86 5.86 2.43a8.24 8.24 0 0 1 2.43 5.87c0 4.57-3.72 8.27-8.29 8.27Zm4.55-6.2c-.25-.13-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07s.9 2.4 1.02 2.57c.12.17 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z" />
    </svg>
  );
}
