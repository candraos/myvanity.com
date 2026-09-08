"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login } from "@/app/admin/actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, formAction] = useActionState(login, undefined);

  return (
    <form action={formAction} className="mt-10 space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <Field label="Username" name="username" type="text" autoComplete="username" />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
      />

      {error && (
        <p
          role="alert"
          className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[0.65rem] tracking-brand text-ink-soft uppercase"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="mt-2 w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:border-ink focus:outline-none"
      />
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-ink px-8 py-4 text-xs tracking-brand text-cream uppercase transition-colors hover:bg-gold-deep disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
