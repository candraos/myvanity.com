# My Vanity

Storefront and admin panel for the My Vanity luxury beauty store. Customers browse
the catalogue and order over WhatsApp — there is no cart, checkout, or customer
account. Only the shop owner logs in.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 ·
Prisma 6 + PostgreSQL · NextAuth v5 · deployed to Netlify.

---

## Getting started

```bash
npm install                       # also runs `prisma generate`
cp .env.example .env.local        # then fill in DATABASE_URL and AUTH_SECRET
npm run db:migrate -- --name init # create the tables
npm run db:seed                   # create the admin account + starter categories
npm run dev
```

You need a PostgreSQL database reachable at `DATABASE_URL`. Anything works
locally — Docker, Postgres.app, a free Neon branch.

Generate `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

The seed **refuses weak admin passwords** (under 12 characters, or a known
default like `admin`). Set a real `ADMIN_PASSWORD` in `.env.local`, or pass
`SEED_ALLOW_WEAK=1` for a throwaway local one. Re-running the seed never
overwrites an existing admin password.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate -- --name x` | Create + apply a migration |
| `npm run db:migrate:deploy` | Apply pending migrations (used by the Netlify build) |
| `npm run db:seed` | Admin user + starter categories |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Drop and rebuild the local database (then re-run `db:seed`) |

The `db:*` scripts go through `scripts/prisma-with-db-url.mjs`, which loads
`.env.local` (the Prisma CLI only reads `.env`) and falls back to
`NETLIFY_DATABASE_URL` when running on Netlify.

---

## How it fits together

```
src/
  auth.ts            NextAuth instance (Credentials provider, bcrypt, Prisma)
  auth.config.ts     the DB-free half of the config, shared with the proxy
  proxy.ts           Next 16's replacement for middleware.ts — optimistic /admin gate
  lib/
    dal.ts           all reads; converts Decimal -> number and keys -> URLs
    storage.ts       image bytes: local disk in dev, Netlify Blobs in production
    validation.ts    Zod 4 schemas for every write
    api.ts           session check + error mapping shared by route handlers
  app/
    (storefront)/    public pages — home, products, categories, search
    admin/           login (public) and (panel)/ (authenticated)
    api/             products, categories, uploads, images, auth
```

### Authorization

Two layers, deliberately:

1. `src/proxy.ts` reads the session cookie and redirects anonymous visitors away
   from `/admin`. It is **optimistic** — it never touches the database, so
   prefetches stay cheap.
2. Every admin API route calls `requireSession()`, and the admin layout calls
   `requireAdmin()`. This is the check that actually protects data, and it runs
   even if a request bypasses the proxy entirely.

Sessions are JWTs that expire after 30 minutes.

### Images

Uploads are validated by **magic bytes**, not by the filename or the
`Content-Type` the browser claims, and are limited to JPEG/PNG/WebP under 5MB.
The storage key is generated server-side (`products/<uuid>.<ext>`) so an uploaded
filename can never influence where a file lands.

The database stores that key — never an absolute URL — and everything is served
through `/api/images/<key>`. That keeps rows portable between local disk and
Netlify Blobs. To switch to Cloudinary or S3 later, only `src/lib/storage.ts`
changes; no data migration is needed.

---

## Deploying to Netlify

1. Push to GitHub and import the repo in Netlify.
2. Set these environment variables in **Site settings → Environment variables**:
   - `AUTH_SECRET` — a *different* 32-byte secret from your local one
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` — only needed while seeding
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_WHATSAPP_MESSAGE`
3. Deploy. `@netlify/database` in `package.json` causes Netlify to provision a
   Postgres database automatically and inject `NETLIFY_DATABASE_URL` — you never
   copy a connection string. `netlify.toml` runs `db:migrate:deploy` before the
   build, so a failed migration blocks the publish instead of shipping a broken site.
4. Seed the production admin account once, from your machine:

   ```bash
   DATABASE_URL="<the Netlify DB URL>" npm run db:seed
   ```

Production images live in Netlify Blobs; deploy previews get their own isolated
blob store and their own database branch, so testing never touches live data.

### Things worth knowing

- **Storefront pages render per request** (`export const dynamic` in
  `src/app/(storefront)/layout.tsx`), so an edit in `/admin` is live instantly.
  If traffic ever makes that expensive, remove that line and call
  `revalidatePath('/')` from the write paths instead.
- **Prices are USD** and stored as `Decimal(10,2)`. Change `formatPrice` in
  `src/lib/utils.ts` for a different currency.
- **`X-XSS-Protection` is set to `0`, deliberately.** The legacy XSS auditor is
  gone from every current browser and, where it survives, introduces cross-site
  leak vulnerabilities. The Content-Security-Policy in `next.config.ts` is the
  real control.
- **Deleting a category is blocked while it still holds products**, because the
  schema cascades — without the guard, one click would silently delete products.
