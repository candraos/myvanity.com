"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? images[0];

  return (
    <div>
      <div className="relative aspect-4/5 overflow-hidden bg-cream-deep">
        <Image
          key={current}
          src={current}
          alt={
            images.length > 1
              ? `${name} — image ${selected + 1} of ${images.length}`
              : name
          }
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <li key={image}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show image ${index + 1}`}
                aria-current={index === selected}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden border transition-colors",
                  index === selected
                    ? "border-gold-deep"
                    : "border-transparent hover:border-ink/20",
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
