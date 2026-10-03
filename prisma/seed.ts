/**
 * Seeds the database with the website's existing content so the public site
 * looks the same on day one and becomes editable from the admin panel.
 *
 *   npm run db:seed
 *
 * Idempotent: safe to run repeatedly. It only fills what is missing and never
 * overwrites content an admin has already edited.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { servicePages } from "../src/lib/service-pages";
import { company, services as licensedServices } from "../src/lib/site";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const industries: [string, string, string][] = [
  ["Commercial Buildings", "Building2", "Offices, towers and mixed-use commercial properties."],
  ["Residential Villas & Apartments", "Home", "Villas, apartments and residential communities."],
  ["Industrial Facilities", "Factory", "Warehouses, workshops and industrial premises."],
  ["Hotels & Hospitality", "Hotel", "Hotels, serviced apartments and hospitality venues."],
  ["Retail & Showrooms", "Store", "Shops, showrooms and retail fit-outs."],
  ["Offices & Workspaces", "Briefcase", "Office fit-out and workplace maintenance."],
  ["Construction & Fit-Out", "HardHat", "Support for contractors and fit-out programmes."],
  ["Property Management", "KeyRound", "Planned maintenance for managed properties."],
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function main() {
  // Contact settings -------------------------------------------------------
  await db.setting.upsert({
    where: { key: "contact" },
    update: {},
    create: {
      key: "contact",
      value: {
        companyName: company.name,
        legalName: company.legalName,
        phones: [
          { label: "Operations", number: company.phone.label, whatsapp: company.phone.whatsapp, role: "Co-Founder" },
          { label: "Co-Founder", number: company.phoneAlt.label, whatsapp: company.phoneAlt.whatsapp, role: "Co-Founder" },
        ],
        whatsapp: company.phone.whatsapp,
        email: company.email,
        address: "Dubai, United Arab Emirates",
        city: company.city,
        country: company.country,
        mapsUrl: "https://www.google.com/maps?q=Dubai,+United+Arab+Emirates&output=embed",
        hours: "",
        social: { linkedin: "", instagram: "", facebook: "", x: "", youtube: "" },
      },
    },
  });

  // Services (the nine landing pages) --------------------------------------
  let order = 0;
  for (const p of servicePages) {
    order += 10;
    await db.service.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: `${p.h1.lead} ${p.h1.accent}`,
        label: p.label,
        shortDescription: p.summary,
        fullDescription: p.intro.join("\n\n"),
        headingLead: p.h1.lead,
        headingAccent: p.h1.accent,
        icon: "Wrench",
        intro: p.intro,
        scope: p.scope,
        whenTitle: p.whenTitle,
        whenItems: p.when,
        approach: p.approach,
        faqs: p.faqs,
        whatsappMessage: p.whatsappMessage,
        related: p.related,
        seoTitle: p.metaTitle,
        seoDescription: p.metaDescription,
        order,
        published: true,
        features: { create: p.scope.map((s, i) => ({ text: s.title, order: i })) },
      },
    });
  }

  // Remaining licensed trades become draft services, ready to be completed. --
  const have = new Set(servicePages.map((p) => p.slug));
  for (const s of licensedServices) {
    const slug = slugify(s.title).slice(0, 60);
    if (have.has(slug)) continue;
    const exists = await db.service.findUnique({ where: { slug } });
    if (exists) continue;
    order += 10;
    await db.service.create({
      data: {
        slug,
        name: s.title,
        label: s.title,
        shortDescription: s.description,
        icon: s.icon,
        order,
        published: false,
      },
    });
  }

  // Industries --------------------------------------------------------------
  let io = 0;
  for (const [name, icon, description] of industries) {
    io += 10;
    await db.industry.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { slug: slugify(name), name, icon, description, order: io, published: true },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
