"use client";

import { useEffect } from "react";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The message itself stays server-side; only the digest reaches the browser.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
      <h1 className="font-display text-4xl font-light">Something went wrong</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-10 bg-ink px-10 py-4 text-xs tracking-brand text-cream uppercase transition-colors hover:bg-gold-deep"
      >
        Try again
      </button>
      {error.digest && (
        <p className="mt-6 text-xs text-ink-soft/70">Reference: {error.digest}</p>
      )}
    </div>
  );
}
