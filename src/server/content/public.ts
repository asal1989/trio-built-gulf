import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { mediaUrl } from "@/lib/media";
import { servicePages, type ServicePage } from "@/lib/service-pages";
import { company as staticCompany, projects as staticProjects, testimonials as staticTestimonials } from "@/lib/site";
import { db } from "../db";
import { getContactSettings, primaryPhone, type ContactSettings } from "../settings";
import { contentDef, resolveContent } from "./defaults";

/**
 * Read side of the CMS, used by the public website.
 *
 * Everything is cached with tags; admin saves call revalidateTag("content") /
 * ("settings") so changes appear immediately. If the database is unreachable
 * each reader falls back to the content that used to be hard-coded, so the
 * public site never goes down because of the CMS.
 */

const TAGS = { tags: ["content"], revalidate: 3600 };

/* ------------------------------ company -------------------------------- */

export type CompanyInfo = {
  name: string;
  legalName: string;
  nameLine1: string;
  nameLine2: string;
  tagline: string;
  city: string;
  country: string;
  location: string;
  email: string;
  phone: { label: string; href: string; whatsapp: string };
  phoneAlt: { label: string; href: string; whatsapp: string; role: string };
  phones: { label: string; number: string; href: string; whatsapp: string; role: string }[];
  address: { street: string; locality: string; region: string; country: string };
  hours: string;
  mapsUrl: string;
  social: Record<string, string>;
};

const tel = (n: string) => `tel:${n.replace(/[^+\d]/g, "")}`;

export const getCompany = cache(async (): Promise<CompanyInfo> => {
  const c: ContactSettings = await getContactSettings();
  const main = primaryPhone(c);
  const alt = c.phones[1];
  return {
    name: c.companyName || staticCompany.name,
    legalName: c.legalName || staticCompany.legalName,
    nameLine1: (c.companyName || staticCompany.name).toUpperCase(),
    nameLine2: staticCompany.nameLine2,
    tagline: staticCompany.tagline,
    city: c.city,
    country: c.country,
    location: c.address || `${c.city}, ${c.country}`,
    email: c.email,
    phone: { label: main.label, href: main.href, whatsapp: c.whatsapp || main.whatsapp },
    phoneAlt: alt
      ? { label: alt.number, href: tel(alt.number), whatsapp: alt.whatsapp, role: alt.role }
      : { label: main.label, href: main.href, whatsapp: main.whatsapp, role: "" },
    phones: c.phones.map((p) => ({ label: p.label, number: p.number, href: tel(p.number), whatsapp: p.whatsapp, role: p.role })),
    address: { street: c.address, locality: c.city, region: c.city, country: "AE" },
    hours: c.hours,
    mapsUrl: c.mapsUrl,
    social: c.social,
  };
});

/* ------------------------------ copy ----------------------------------- */

/** Page copy or company-content block, merged over its defaults. */
export function getContent<T extends Record<string, unknown>>(key: string): Promise<T> {
  const def = contentDef(key);
  if (!def) throw new Error(`Unknown content key: ${key}`);
  return unstable_cache(
    async () => {
      try {
        const row =
          def.group === "page"
            ? await db.page.findUnique({ where: { slug: key } })
            : await db.contentBlock.findUnique({ where: { key } });
        const saved = row ? (def.group === "page" ? (row as { content: unknown }).content : (row as { data: unknown }).data) : null;
        return resolveContent<T>(def, saved);
      } catch (error) {
        console.error(`content: could not read "${key}", using defaults`, error);
        return resolveContent<T>(def, null);
      }
    },
    ["content-v1", key],
    TAGS,
  )();
}

/* ----------------------------- services -------------------------------- */

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export type PublicService = ServicePage & { name: string; icon: string; features: string[]; gallery: { url: string; alt: string }[]; fullDescription: string };

const fromStatic = (p: ServicePage): PublicService => ({ ...p, name: `${p.h1.lead} ${p.h1.accent}`.trim(), icon: "Wrench", features: p.scope.map((s) => s.title), gallery: [], fullDescription: p.intro.join("\n\n") });

export const getPublishedServices = unstable_cache(
  async (): Promise<PublicService[]> => {
    try {
      const rows = await db.service.findMany({
        where: { published: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: { cover: true, features: { orderBy: { order: "asc" } }, gallery: { orderBy: { order: "asc" }, include: { media: true } } },
      });
      return rows.map((s) => {
        const fallback = servicePages.find((p) => p.slug === s.slug);
        return {
          slug: s.slug,
          name: s.name,
          h1: { lead: s.headingLead || s.label, accent: s.headingAccent ?? "" },
          metaTitle: s.seoTitle || `${s.label} | Trio Built Gulf`,
          metaDescription: s.seoDescription || s.shortDescription,
          label: s.label,
          summary: s.shortDescription,
          image: s.cover ? mediaUrl(s.cover.storageKey) : (fallback?.image ?? "/images/feat-mep.jpg"),
          imageAlt: s.cover?.alt || s.label,
          intro: arr<string>(s.intro).length ? arr<string>(s.intro) : s.fullDescription ? s.fullDescription.split(/\n\n+/) : [s.shortDescription],
          scope: arr<{ title: string; text: string }>(s.scope),
          whenTitle: s.whenTitle ?? "",
          when: arr<string>(s.whenItems),
          approach: arr<{ title: string; text: string }>(s.approach),
          faqs: arr<{ q: string; a: string }>(s.faqs),
          related: s.related,
          whatsappMessage: s.whatsappMessage || `Hello Trio Built Gulf, I would like a quote for ${s.label} in Dubai.`,
          icon: s.icon,
          features: s.features.map((f) => f.text),
          gallery: s.gallery.map((g) => ({ url: mediaUrl(g.media.storageKey), alt: g.media.alt ?? s.label })),
          fullDescription: s.fullDescription ?? "",
        };
      });
    } catch (error) {
      console.error("content: could not read services, using static pages", error);
      return servicePages.map(fromStatic);
    }
  },
  ["services-v1"],
  TAGS,
);

export async function getServiceBySlug(slug: string): Promise<PublicService | undefined> {
  return (await getPublishedServices()).find((s) => s.slug === slug);
}

/* ----------------------------- projects -------------------------------- */

export type PublicProject = {
  slug: string;
  name: string;
  client: string;
  location: string;
  projectType: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
  startDate: string | null;
  completionDate: string | null;
  description: string;
  scopeOfWork: string;
  cover: { url: string; alt: string } | null;
  gallery: { url: string; alt: string }[];
  services: string[];
  featured: boolean;
};

export const getPublishedProjects = unstable_cache(
  async (): Promise<PublicProject[] | null> => {
    try {
      const rows = await db.project.findMany({
        where: { published: true },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        include: { cover: true, services: { select: { label: true } }, gallery: { orderBy: { order: "asc" }, include: { media: true } } },
      });
      return rows.map((p) => ({
        slug: p.slug,
        name: p.name,
        client: p.client ?? "",
        location: p.location ?? "",
        projectType: p.projectType ?? "",
        status: p.status,
        startDate: p.startDate?.toISOString() ?? null,
        completionDate: p.completionDate?.toISOString() ?? null,
        description: p.description ?? "",
        scopeOfWork: p.scopeOfWork ?? "",
        cover: p.cover ? { url: mediaUrl(p.cover.storageKey), alt: p.cover.alt || p.name } : null,
        gallery: p.gallery.map((g) => ({ url: mediaUrl(g.media.storageKey), alt: g.media.alt || p.name })),
        services: p.services.map((s) => s.label),
        featured: p.featured,
      }));
    } catch (error) {
      console.error("content: could not read projects", error);
      return null; // null = "unknown": the page shows the static capability categories
    }
  },
  ["projects-v1"],
  TAGS,
);

export const capabilityProjects = staticProjects;

/* --------------------------- testimonials ------------------------------ */

export type PublicTestimonial = { name: string; company: string; position: string; quote: string; photo: string | null };

export const getPublishedTestimonials = unstable_cache(
  async (): Promise<PublicTestimonial[]> => {
    try {
      const rows = await db.testimonial.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }], include: { photo: true } });
      return rows.map((t) => ({ name: t.name, company: t.company ?? "", position: t.position ?? "", quote: t.quote, photo: t.photo ? mediaUrl(t.photo.storageKey) : null }));
    } catch (error) {
      console.error("content: could not read testimonials", error);
      return staticTestimonials.map((t) => ({ name: t.author, company: t.company ?? "", position: t.role ?? "", quote: t.quote, photo: null }));
    }
  },
  ["testimonials-v1"],
  TAGS,
);

/* ----------------------------- industries ------------------------------ */

export type PublicIndustry = { slug: string; name: string; description: string; icon: string };

export const getPublishedIndustries = unstable_cache(
  async (): Promise<PublicIndustry[]> => {
    try {
      const rows = await db.industry.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { name: "asc" }] });
      return rows.map((i) => ({ slug: i.slug, name: i.name, description: i.description ?? "", icon: i.icon }));
    } catch (error) {
      console.error("content: could not read industries", error);
      return [];
    }
  },
  ["industries-v1"],
  TAGS,
);

/* ------------------------------ documents ------------------------------ */

/** The newest public company profile, if one has been uploaded. */
export const getCompanyProfileLink = unstable_cache(
  async (): Promise<{ url: string; title: string } | null> => {
    try {
      const doc = await db.document.findFirst({
        where: { type: "COMPANY_PROFILE", isPublic: true, mediaId: { not: null } },
        orderBy: { updatedAt: "desc" },
      });
      return doc ? { url: "/documents/company-profile/", title: doc.title } : null;
    } catch {
      return null;
    }
  },
  ["company-profile-v1"],
  TAGS,
);

/* -------------------------------- SEO ---------------------------------- */

export type SeoOverride = {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
};

/** Per-path SEO overrides saved in the admin (empty fields mean "use the page default"). */
export const getAllSeo = unstable_cache(
  async (): Promise<Record<string, SeoOverride>> => {
    try {
      const rows = await db.seoMetadata.findMany({ include: { ogImage: true } });
      const out: Record<string, SeoOverride> = {};
      for (const r of rows) {
        out[r.path] = {
          title: r.title ?? undefined,
          description: r.description ?? undefined,
          canonical: r.canonicalUrl ?? undefined,
          ogTitle: r.ogTitle ?? undefined,
          ogDescription: r.ogDescription ?? undefined,
          ogImage: r.ogImage ? mediaUrl(r.ogImage.storageKey) : undefined,
          robots: r.robots ?? undefined,
        };
      }
      return out;
    } catch (error) {
      console.error("content: could not read SEO overrides", error);
      return {};
    }
  },
  ["seo-v1"],
  TAGS,
);
