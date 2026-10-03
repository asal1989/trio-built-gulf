import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

import CTASection from "@/components/CTASection";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { SITE_URL, breadcrumbSchema } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";
import { getCompany, getPublishedServices, getServiceBySlug } from "@/server/content/public";
import { pageMeta } from "@/server/content/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getServiceBySlug(slug);
  if (!page) return {};
  return pageMeta({ path: `/services/${page.slug}/`, title: page.metaTitle, description: page.metaDescription });
}

export default async function ServicePageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getServiceBySlug(slug);
  if (!page) notFound();
  const [company, all] = await Promise.all([getCompany(), getPublishedServices()]);

  const url = `${SITE_URL}/services/${page.slug}/`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: `${page.label} in Dubai`,
    description: page.metaDescription,
    url,
    serviceType: page.label,
    provider: { "@id": `${SITE_URL}/#organisation` },
    areaServed: [
      { "@type": "City", name: "Dubai" },
      { "@type": "Country", name: "United Arab Emirates" },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const crumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services/" },
    { name: page.label, path: `/services/${page.slug}/` },
  ]);

  const related = page.related
    .map((slugName) => all.find((x) => x.slug === slugName))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const wa = whatsappLink(company.phone.whatsapp, page.whatsappMessage);

  return (
    <>
      {[serviceSchema, faqSchema, crumbs].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <PageHeader
        eyebrow="Services"
        title={
          <>
            {page.h1.lead} <span className="text-teal-300">{page.h1.accent}</span>
          </>
        }
        subtitle={page.summary}
        image={page.image}
        imageAlt={page.imageAlt}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-line bg-white">
        <ol className="shell flex flex-wrap items-center gap-2 py-4 text-xs text-navy/60">
          <li>
            <Link href="/" className="hover:text-teal-700">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/services" className="hover:text-teal-700">
              Services
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-navy">
            {page.label}
          </li>
        </ol>
      </nav>

      {/* Introduction */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <span className="eyebrow text-teal-700">Overview</span>
              <div className="mt-6 space-y-5 text-pretty text-base leading-relaxed text-navy/75 sm:text-lg">
                {page.intro.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:col-span-5">
            <aside className="rounded-xl bg-navy-950 p-7 text-white sm:p-9">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                Get a quote
              </p>
              <h2 className="mt-4 text-xl font-bold leading-snug">
                Tell us what you need: {page.label}.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Share the location, the scope and your timeline. We will come
                back with questions or a site visit.
              </p>
              <div className="mt-7 flex flex-col gap-3">
                <Link
                  href="/contact#enquiry"
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-teal px-6 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal-700"
                >
                  Request a quote
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </Link>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/25 px-6 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  WhatsApp us
                </a>
                <a
                  href={company.phone.href}
                  className="text-center text-sm text-white/70 transition-colors hover:text-teal-300"
                >
                  or call {company.phone.label}
                </a>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* Scope */}
      <section className="bg-mist py-16 sm:py-20 lg:py-24">
        <div className="shell">
          <Reveal>
            <span className="eyebrow text-teal-700">What the service covers</span>
            <h2 className="mt-5 max-w-3xl text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight text-navy">
              {page.label} scope of work
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.scope.map((item, i) => (
              <Reveal as="li" key={item.title} delay={(i % 3) * 80}>
                <div className="h-full rounded-xl border border-line bg-white p-6 sm:p-7">
                  <h3 className="text-base font-bold text-navy">{item.title}</h3>
                  <span aria-hidden="true" className="mt-3 block h-[3px] w-9 bg-gold" />
                  <p className="mt-3 text-sm leading-relaxed text-navy/65">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* When you need it */}
      <section className="bg-navy-950 py-16 text-white sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow text-teal-300">Why it matters</span>
            <h2 className="mt-5 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight">
              {page.whenTitle}
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <ul className="divide-y divide-white/10">
              {page.when.map((w) => (
                <li key={w} className="flex gap-4 py-5 text-base leading-relaxed text-white/80">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-teal-300" strokeWidth={2} aria-hidden="true" />
                  {w}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Approach */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell">
          <Reveal>
            <span className="eyebrow text-teal-700">How we work</span>
            <h2 className="mt-5 max-w-3xl text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight text-navy">
              From first call to handover
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {page.approach.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 80}>
                <div className="h-full border-t-2 border-gold pt-5">
                  <span className="font-display text-3xl font-bold tabular-nums text-navy/15">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-navy">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy/65">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-mist py-16 sm:py-20 lg:py-24">
        <div className="shell max-w-4xl">
          <Reveal>
            <span className="eyebrow text-teal-700">Questions</span>
            <h2 className="mt-5 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight text-navy">
              {page.label}: frequently asked questions
            </h2>
          </Reveal>
          <div className="mt-10 divide-y divide-line rounded-xl border border-line bg-white">
            {page.faqs.map((f) => (
              <details key={f.q} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-bold text-navy">
                  {f.q}
                  <span aria-hidden="true" className="mt-1 text-teal transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-navy/70 sm:text-base">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="bg-white py-16 sm:py-20">
        <div className="shell">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-navy/50">
            Related services
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/services/${r.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-line p-6 transition-colors duration-300 hover:border-teal"
                >
                  <span className="text-base font-bold text-navy">{r.label}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-navy/60">
                    {r.summary}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">
                    View service
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-navy/60">
            <Link href="/services" className="font-semibold text-teal-700 hover:text-navy">
              See all of our technical services in Dubai
            </Link>
          </p>
        </div>
      </section>

      <CTASection />
    </>
  );
}
