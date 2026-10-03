/**
 * Create (or reset) an admin user from the command line.
 *
 *   npm run admin:create -- --email you@example.com --name "Your Name" [--role SUPER_ADMIN]
 *
 * The password is read from ADMIN_PASSWORD; if unset, a strong random one is
 * generated and printed ONCE. The user is asked to change it at first sign-in.
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Role } from "../src/generated/prisma/enums";
import { hashPassword, passwordProblems } from "../src/server/auth/password";

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const email: string = arg("email")?.trim().toLowerCase() ?? "";
const name = arg("name")?.trim() ?? "Administrator";
const role = (arg("role") ?? "SUPER_ADMIN") as keyof typeof Role;

if (!email.includes("@")) {
  console.error('Usage: npm run admin:create -- --email you@example.com --name "Your Name" [--role SUPER_ADMIN]');
  process.exit(1);
}
if (!(role in Role)) {
  console.error(`Unknown role "${role}". Choose one of: ${Object.keys(Role).join(", ")}`);
  process.exit(1);
}

const generated = !process.env.ADMIN_PASSWORD;
const password = process.env.ADMIN_PASSWORD ?? `${randomBytes(9).toString("base64url")}aA1`;
const problems = passwordProblems(password);
if (problems.length) {
  console.error(`Password must contain: ${problems.join(", ")}`);
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  try {
  const passwordHash = await hashPassword(password);
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash, name, role: Role[role], active: true, mustChangePassword: true },
    create: { email, name, passwordHash, role: Role[role], mustChangePassword: true },
  });
  await db.session.deleteMany({ where: { userId: user.id } });
  console.log(`\nAdmin ready: ${user.email} (${user.role})`);
  if (generated) console.log(`Temporary password (shown once): ${password}`);
  console.log("You will be asked to choose a new password at first sign-in.\n");
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
