import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import WhatsAppButton from "@/components/WhatsAppButton";
import { breadcrumbSchema } from "@/lib/seo";
import { getCompany } from "@/server/content/public";
import { pageMeta } from "@/server/content/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta({
    path: "/careers/",
    title: "Careers | Join Trio Built Gulf in Dubai",
    description:
      "Interested in working with Trio Built Gulf Technical Services LLC in Dubai? Send your CV for MEP, HVAC, electrical, plumbing, fit-out and maintenance roles.",
  });
}

const trades = [
  "MEP engineers and supervisors",
  "HVAC technicians",
  "Electricians",
  "Plumbers",
  "Fit-out, ceiling and finishing tradespeople",
  "Maintenance technicians",
];

export default async function CareersPage() {
  const company = await getCompany();
  const subject = encodeURIComponent("Career enquiry — Trio Built Gulf");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Careers", path: "/careers/" },
            ]),
          ),
        }}
      />
      <PageHeader
        eyebrow="Careers"
        title={
          <>
            Work with <span className="text-teal-300">Trio Built Gulf</span>
          </>
        }
        subtitle="We are a Dubai technical services team. If you do this work well, we would like to hear from you."
        image="/images/feat-maintenance.jpg"
        imageAlt="Technician at work"
      />

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <span className="eyebrow text-teal-700">Join the team</span>
            <h2 className="mt-5 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight text-navy">
              Skills we look for
            </h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-navy/70 sm:text-lg">
              We carry out MEP, HVAC, electrical, plumbing, fit-out and
              maintenance work in Dubai. We welcome applications from people
              experienced in these areas:
            </p>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {trades.map((t) => (
                <li key={t} className="py-3.5 text-base text-navy">
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-navy/60">
              We do not publish specific vacancies on this page. Send your CV
              and we will contact you if a suitable role is available.
            </p>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-5">
            <aside className="rounded-xl bg-navy-950 p-7 text-white sm:p-9">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                How to apply
              </p>
              <h2 className="mt-4 text-xl font-bold leading-snug">
                Send us your CV.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Include your trade, experience and the area of Dubai or the UAE
                where you are based.
              </p>
              <div className="mt-7 flex flex-col gap-3">
                <a
                  href={`mailto:${company.email}?subject=${subject}`}
                  className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-teal px-6 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal-700"
                >
                  <Mail className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  Email your CV
                </a>
                <WhatsAppButton
                  message="Hello Trio Built Gulf, I would like to enquire about career opportunities."
                  label="WhatsApp us"
                  phone={company.phone.whatsapp}
                />
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 text-sm text-white/70 transition-colors hover:text-teal-300"
                >
                  Contact details
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
