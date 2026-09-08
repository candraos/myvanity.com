"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CategoryView } from "@/lib/dal";

export function AdminCategoryManager({
  categories,
}: {
  categories: CategoryView[];
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(url: string, init: RequestInit): Promise<boolean> {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...init,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(
          body?.fields?.name ?? body?.error ?? "That didn't work. Try again.",
        );
        return false;
      }

      router.refresh();
      return true;
    } catch {
      setError("Couldn't reach the server.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await send("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
    if (ok) {
      setName("");
      setDescription("");
    }
  }

  async function saveEdit(category: CategoryView) {
    const ok = await send(`/api/categories/${category.id}`, {
      method: "PUT",
      body: JSON.stringify({ name: editName, description: category.description ?? "" }),
    });
    if (ok) setEditingId(null);
  }

  async function remove(category: CategoryView) {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    await send(`/api/categories/${category.id}`, { method: "DELETE" });
  }

  return (
    <div className="mt-8 max-w-2xl">
      <form
        onSubmit={create}
        className="space-y-4 border border-ink/10 bg-cream-deep/30 p-6"
      >
        <h2 className="font-display text-xl">New category</h2>

        <div>
          <label
            htmlFor="category-name"
            className="block text-[0.65rem] tracking-brand text-ink-soft uppercase"
          >
            Name
          </label>
          <input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-2 w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="category-description"
            className="block text-[0.65rem] tracking-brand text-ink-soft uppercase"
          >
            Description (optional)
          </label>
          <textarea
            id="category-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            className="mt-2 w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-ink focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="bg-ink px-6 py-3 text-xs tracking-brand text-cream uppercase transition-colors hover:bg-gold-deep disabled:opacity-60"
        >
          Add category
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="mt-8 border border-dashed border-ink/15 p-10 text-center text-sm text-ink-soft">
          No categories yet.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-center gap-4 py-4">
              {editingId === category.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    aria-label={`Rename ${category.name}`}
                    className="min-w-0 flex-1 border border-ink/20 bg-transparent px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(category)}
                    disabled={busy || !editName.trim()}
                    className="text-xs tracking-widest uppercase underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-xs tracking-widest text-ink-soft uppercase underline-offset-4 hover:underline"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{category.name}</p>
                    <p className="text-xs text-ink-soft">
                      /{category.slug} · {category.productCount}{" "}
                      {category.productCount === 1 ? "product" : "products"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(category.id);
                      setEditName(category.name);
                      setError(null);
                    }}
                    className="text-xs tracking-widest text-ink-soft uppercase underline-offset-4 hover:text-ink hover:underline"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(category)}
                    disabled={busy}
                    className="text-xs tracking-widest text-red-700 uppercase underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
