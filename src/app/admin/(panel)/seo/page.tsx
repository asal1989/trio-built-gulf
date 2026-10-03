import SeoTable, { type SeoRow } from "@/components/admin/SeoEditor";
import { Card, PageHeading } from "@/components/admin/ui";
import { mediaUrl } from "@/lib/media";
import { requirePage } from "@/server/auth/guard";
import { db } from "@/server/db";

/** Standard titles/descriptions, mirroring what each public page uses by default. */
const PAGES: { path: string; label: string; title: string; description: string }[] = [
  { path: "/", label: "Home", title: "Trio Built Gulf | MEP, HVAC & Building Maintenance Services in Dubai", description: "Trio Built Gulf Technical Services LLC provides professional technical installation, maintenance, MEP, HVAC, interior finishing and building services in Dubai, UAE." },
  { path: "/about/", label: "About", title: "About Trio Built Gulf | Technical Services Company in Dubai, UAE", description: "Trio Built Gulf Technical Services LLC is a Dubai technical services company delivering installation, MEP, HVAC and building maintenance." },
  { path: "/services/", label: "Services", title: "Technical Services Dubai | MEP, HVAC, Ceilings, Plumbing & Electrical", description: "Licensed technical services in Dubai and the UAE: false ceilings, HVAC, plumbing, electrical, painting, tiling, carpentry, glass and aluminium, steel and plaster works." },
  { path: "/projects/", label: "Projects", title: "Projects & Capabilities | Fit-Out, MEP & Maintenance Dubai", description: "The commercial, interior, facilities, MEP and residential work Trio Built Gulf delivers across Dubai and the UAE." },
  { path: "/industries/", label: "Industries", title: "Industries We Serve | Technical Services for Dubai Properties", description: "Technical services for commercial buildings, villas and apartments, industrial facilities, hotels, retail, offices and property management across Dubai." },
  { path: "/maintenance/", label: "Maintenance & AMC", title: "Maintenance & AMC Dubai | Preventive & Corrective Building Maintenance", description: "Annual maintenance contracts, preventive and corrective maintenance and emergency support for HVAC, electrical, plumbing and building services." },
  { path: "/why-us/", label: "Why Us", title: "Why Choose Trio Built Gulf | MEP & Maintenance Contractor Dubai", description: "Integrated technical expertise, quality workmanship, safety-first delivery and responsive support." },
  { path: "/careers/", label: "Careers", title: "Careers | Join Trio Built Gulf in Dubai", description: "Interested in working with Trio Built Gulf Technical Services LLC in Dubai? Send your CV." },
  { path: "/contact/", label: "Contact", title: "Contact Trio Built Gulf | Get a Quote in Dubai, UAE", description: "Request a quote from Trio Built Gulf Technical Services LLC in Dubai." },
];

export default async function SeoPage() {
  await requirePage("seo:manage");
  const [rows, services] = await Promise.all([
    db.seoMetadata.findMany({ include: { ogImage: true } }),
    db.service.findMany({ where: { published: true }, orderBy: { order: "asc" }, select: { slug: true, label: true, seoTitle: true, seoDescription: true, shortDescription: true } }),
  ]);
  const byPath = new Map(rows.map((r) => [r.path, r]));

  const all = [
    ...PAGES,
    ...services.map((s) => ({
      path: `/services/${s.slug}/`,
      label: `Service: ${s.label}`,
      title: s.seoTitle || `${s.label} | Trio Built Gulf`,
      description: s.seoDescription || s.shortDescription,
    })),
  ];

  const data: SeoRow[] = all.map((p) => {
    const r = byPath.get(p.path);
    return {
      path: p.path,
      label: p.label,
      defaultTitle: p.title,
      defaultDescription: p.description,
      custom: r
        ? {
            title: r.title ?? "",
            description: r.description ?? "",
            canonicalUrl: r.canonicalUrl ?? "",
            ogTitle: r.ogTitle ?? "",
            ogDescription: r.ogDescription ?? "",
            ogImage: r.ogImage ? { id: r.ogImage.id, url: mediaUrl(r.ogImage.storageKey), alt: r.ogImage.alt ?? "", name: r.ogImage.fileName } : null,
            robots: r.robots ?? "",
          }
        : null,
    };
  });

  return (
    <>
      <PageHeading title="SEO" subtitle="Control how each page appears in Google and when shared on social media." />
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <Card title="Sitemap">
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-teal-700 hover:underline">
            /sitemap.xml ↗
          </a>
          <p className="mt-1 text-xs text-navy/55">Generated automatically from your published pages and services. Pages set to noindex are left out.</p>
        </Card>
        <Card title="robots.txt">
          <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-teal-700 hover:underline">
            /robots.txt ↗
          </a>
          <p className="mt-1 text-xs text-navy/55">Points search engines to the sitemap and keeps the admin out of search results.</p>
        </Card>
      </div>
      <SeoTable rows={data} />
    </>
  );
}
