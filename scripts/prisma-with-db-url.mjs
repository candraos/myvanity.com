// Runs a Prisma CLI command with DATABASE_URL resolved for the current environment.
//
// Netlify DB injects NETLIFY_DATABASE_URL, but prisma/schema.prisma reads
// DATABASE_URL (which is what you set locally). This bridges the two so the same
// npm scripts work on a laptop and in a Netlify build, without a shell-specific
// `VAR=x cmd` prefix that would break on Windows.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

// The Prisma CLI only reads `.env`, but Next.js projects keep local secrets in
// `.env.local`. Load both, nearest-wins, so one DATABASE_URL serves everything.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!url) {
  console.error(
    "No database URL found.\n" +
      "  Local:   set DATABASE_URL in .env.local (see .env.example)\n" +
      "  Netlify: NETLIFY_DATABASE_URL is injected once Netlify DB is provisioned",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const { status } = spawnSync("prisma", args, {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DATABASE_URL: url },
});

process.exit(status ?? 1);
