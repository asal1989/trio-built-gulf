import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { breadcrumbSchema } from "@/lib/seo";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getCompany, getContent } from "@/server/content/public";
import { pageMeta } from "@/server/content/seo";

type Amc = {
  heading: string;
  intro: string;
  offerings: { title: string; description: string }[];
  benefits: string[];
};

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({
    path: "/maintenance/",
    title: "Maintenance & AMC Dubai | Preventive & Corrective Building Maintenance",
    description:
      "Annual maintenance contracts, preventive and corrective maintenance and emergency support for HVAC, electrical, plumbing and building services in Dubai.",
  });
}

export default async function MaintenancePage() {
  const [company, page, amc] = await Promise.all([
    getCompany(),
    getContent<{ eyebrow: string; title: string; accent: string; subtitle: string }>("maintenance-page"),
    getContent<Amc>("maintenance-amc"),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Maintenance", path: "/maintenance/" }])) }}
      />
      <PageHeader
        eyebrow={page.eyebrow}
        title={
          <>
            {page.title} <span className="text-teal-300">{page.accent}</span>
          </>
        }
        subtitle={page.subtitle}
        image="/images/feat-maintenance.jpg"
        imageAlt="Technician carrying out maintenance work"
      />

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <div className="shell">
          <Reveal>
            <span className="eyebrow text-teal-700">Maintenance</span>
            <h2 className="mt-5 max-w-3xl text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight text-navy">{amc.heading}</h2>
            <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-navy/70 sm:text-lg">{amc.intro}</p>
          </Reveal>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {amc.offerings.map((o, i) => (
              <Reveal as="li" key={o.title} delay={(i % 3) * 80}>
                <div className="h-full rounded-xl border border-line bg-white p-6 sm:p-7">
                  <h3 className="text-base font-bold text-navy">{o.title}</h3>
                  <span aria-hidden="true" className="mt-3 block h-[3px] w-9 bg-gold" />
                  <p className="mt-3 text-sm leading-relaxed text-navy/65">{o.description}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy-950 py-20 text-white sm:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow text-teal-300">Why planned maintenance</span>
            <h2 className="mt-5 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight">Fewer breakdowns. Clearer costs.</h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact#enquiry"
                className="group inline-flex items-center justify-center gap-2 rounded-[10px] bg-teal px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal-700"
              >
                Request an AMC quote
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              </Link>
              <WhatsAppButton phone={company.phone.whatsapp} message="Hello Trio Built Gulf, I would like to discuss an annual maintenance contract in Dubai." />
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <ul className="divide-y divide-white/10">
              {amc.benefits.map((b) => (
                <li key={b} className="flex gap-4 py-5 text-base leading-relaxed text-white/80">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-teal-300" strokeWidth={2} aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
