import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { existsSync } from "node:fs";

// A standalone script doesn't get Next.js's env loading, so pull it in ourselves.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const databaseUrl = process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "No database URL. Set DATABASE_URL in .env.local (see .env.example).",
  );
  process.exit(1);
}

const prisma = new PrismaClient({ datasourceUrl: databaseUrl });

const WEAK = new Set([
  "admin",
  "password",
  "changeme",
  "change-this-before-seeding",
  "12345678",
]);

function assertUsablePassword(password: string) {
  if (process.env.SEED_ALLOW_WEAK === "1") return;

  const problems: string[] = [];
  if (password.length < 12) problems.push("it is shorter than 12 characters");
  if (WEAK.has(password.toLowerCase())) problems.push("it is a well-known default");

  if (problems.length) {
    console.error(
      `Refusing to seed the admin account because ${problems.join(" and ")}.\n\n` +
        "This account is the only thing standing in front of your storefront's\n" +
        "admin panel, and the seed is often re-run against production.\n\n" +
        "Set a real ADMIN_PASSWORD in .env.local, or re-run with SEED_ALLOW_WEAK=1\n" +
        "if you genuinely want a throwaway local password.",
    );
    process.exit(1);
  }
}

const CATEGORIES = [
  { name: "Skincare", description: "Cleansers, serums and treatments." },
  { name: "Makeup", description: "Complexion, eyes and lips." },
  { name: "Fragrance", description: "Eau de parfum and body mists." },
  { name: "Hair", description: "Care, styling and treatments." },
];

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim() || "admin";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const email = process.env.ADMIN_EMAIL?.trim() || null;

  if (!password) {
    console.error("ADMIN_PASSWORD is not set. See .env.example.");
    process.exit(1);
  }
  assertUsablePassword(password);

  const existing = await prisma.user.findUnique({ where: { username } });

  if (existing) {
    // Never silently rotate a live admin password on a re-run.
    console.log(
      `• Admin "${username}" already exists — left untouched.\n` +
        "  To reset the password, delete the row (npm run db:studio) and re-seed.",
    );
  } else {
    await prisma.user.create({
      data: { username, passwordHash: await hash(password, 12), email },
    });
    console.log(`✓ Created admin "${username}"`);
  }

  for (const category of CATEGORIES) {
    const slug = category.name.toLowerCase();
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { ...category, slug },
    });
  }
  console.log(`✓ Ensured ${CATEGORIES.length} categories`);

  // Products are intentionally not seeded: every product requires real uploaded
  // image bytes in the storage backend, which a seed script cannot invent.
  console.log("\nDone. Add products from /admin/products/new.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
