import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { breadcrumbSchema } from "@/lib/seo";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { getContent, getPublishedIndustries } from "@/server/content/public";
import { pageMeta } from "@/server/content/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({
    path: "/industries/",
    title: "Industries We Serve | Technical Services for Dubai Properties",
    description:
      "Technical services for commercial buildings, villas and apartments, industrial facilities, hotels, retail, offices and property management across Dubai and the UAE.",
  });
}

export default async function IndustriesPage() {
  const [page, intro, industries] = await Promise.all([
    getContent<{ eyebrow: string; title: string; accent: string; subtitle: string }>("industries-page"),
    getContent<{ heading: string; intro: string }>("industries"),
    getPublishedIndustries(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Industries", path: "/industries/" }])) }}
      />
      <PageHeader
        eyebrow={page.eyebrow}
        title={
          <>
            {page.title} <span className="text-teal-300">{page.accent}</span>
          </>
        }
        subtitle={page.subtitle}
        image="/images/about-towers.jpg"
        imageAlt="Commercial towers in Dubai"
      />

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="shell">
          <Reveal>
            <span className="eyebrow text-teal-700">Industries</span>
            <h2 className="mt-5 max-w-3xl text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight text-navy">{intro.heading}</h2>
            <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-navy/70 sm:text-lg">{intro.intro}</p>
          </Reveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((i, n) => (
              <Reveal as="li" key={i.slug} delay={(n % 4) * 80}>
                <div className="h-full rounded-xl border border-line bg-white p-6 transition-colors duration-300 hover:border-teal">
                  <Icon name={i.icon} className="h-8 w-8 text-teal" />
                  <h3 className="mt-5 text-lg font-bold leading-snug text-navy">{i.name}</h3>
                  <span aria-hidden="true" className="mt-3 block h-[3px] w-9 bg-gold" />
                  {i.description ? <p className="mt-3 text-sm leading-relaxed text-navy/65">{i.description}</p> : null}
                </div>
              </Reveal>
            ))}
          </ul>

          <div className="mt-14">
            <Link
              href="/contact#enquiry"
              className="group inline-flex items-center gap-2 rounded-[10px] bg-teal px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal-700"
            >
              Discuss your property
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
