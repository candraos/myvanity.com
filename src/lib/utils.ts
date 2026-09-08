import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Combining diacritical marks, written as escapes because the literal characters
// are invisible in an editor.
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * URL-safe slug. Decomposes and strips diacritics first, so "Crème Hydratante"
 * becomes "creme-hydratante" rather than "cr-me-hydratante".
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const WHATSAPP_MESSAGE =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??
  "Hi, I'm interested in this product. Please confirm availability.";

/** Builds a wa.me deep link pre-filled with the product the shopper is viewing. */
export function whatsappOrderUrl(product?: {
  name: string;
  price: number;
}): string {
  const digitsOnly = WHATSAPP_NUMBER.replace(/\D/g, "");
  const text = product
    ? `${WHATSAPP_MESSAGE}\n\n${product.name} — ${formatPrice(product.price)}`
    : WHATSAPP_MESSAGE;

  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(text)}`;
}
