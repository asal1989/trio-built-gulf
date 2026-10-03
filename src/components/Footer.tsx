import Link from "next/link";
import { ArrowUpRight, Download, Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import { WhatsAppGlyph } from "./WhatsAppButton";
import { defaultWhatsAppMessage, whatsappLink } from "@/lib/site";
import { getCompany, getCompanyProfileLink, getContent, getPublishedServices } from "@/server/content/public";

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Industries", href: "/industries" },
  { label: "Maintenance", href: "/maintenance" },
  { label: "Why Us", href: "/why-us" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
] as const;

const disciplines = ["MEP", "HVAC", "Plumbing", "Electrical", "Fit-Out", "Maintenance"] as const;

const linkClass = "text-sm leading-relaxed text-white/70 transition-colors duration-300 hover:text-teal-300";
const headingClass = "font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/50";

const SOCIAL_LABELS: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook", x: "X", youtube: "YouTube" };

/**
 * Deep navy — it anchors the page and mirrors the hero, with the white
 * colourway of the logo. Contact details, services and wording come from the CMS.
 */
export default async function Footer() {
  const year = new Date().getFullYear();
  const [company, services, copy, profile] = await Promise.all([
    getCompany(),
    getPublishedServices(),
    getContent<{ description: string }>("footer"),
    getCompanyProfileLink(),
  ]);
  const social = Object.entries(company.social).filter(([, url]) => url);

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="tech-grid absolute -inset-[20%] text-white/[0.05]" />
      </div>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/15" />
      <span aria-hidden="true" className="absolute left-0 top-0 h-[3px] w-24 bg-gold" />

      <div className="shell relative pb-28 pt-16 sm:pt-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* Identity */}
          <div className="md:col-span-2 lg:col-span-4">
            <Logo variant="onDark" />
            <p className="mt-7 max-w-sm text-pretty text-sm leading-relaxed text-white/65">{copy.description}</p>

            <ul aria-label="Disciplines" className="mt-7 flex flex-wrap gap-x-2 gap-y-2">
              {disciplines.map((d) => (
                <li key={d} className="rounded-sm border border-white/15 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
                  {d}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={whatsappLink(company.phone.whatsapp, defaultWhatsAppMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#1f9d55] px-6 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-[#177f44]"
              >
                <WhatsAppGlyph className="h-5 w-5" />
                WhatsApp now
                <span className="sr-only"> (opens WhatsApp in a new tab)</span>
              </a>
              <Link
                href="/contact#enquiry"
                className="group inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/25 px-6 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:border-teal-300 hover:bg-white/5"
              >
                Request a quote
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </div>

            {profile ? (
              <a href={profile.url} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-white">
                <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Download company profile
              </a>
            ) : null}

            {social.length > 0 ? (
              <ul aria-label="Social media" className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {social.map(([key, url]) => (
                  <li key={key}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {SOCIAL_LABELS[key] ?? key}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Services */}
          <nav aria-label="Services" className="lg:col-span-3">
            <h2 className={headingClass}>Services</h2>
            <ul className="mt-6 space-y-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className={linkClass}>
                    {service.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-sm font-semibold text-teal-300 transition-colors duration-300 hover:text-white">
                  All services &rarr;
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company" className="lg:col-span-2">
            <h2 className={headingClass}>Company</h2>
            <ul className="mt-6 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className={headingClass}>Contact</h2>
            <address className="mt-6 space-y-5 not-italic">
              <p className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" strokeWidth={1.5} aria-hidden="true" />
                {company.location}
              </p>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Phone</p>
                  {company.phones.map((p) => (
                    <a key={p.number} href={p.href} className={`block ${linkClass}`}>
                      {p.number}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <WhatsAppGlyph className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">WhatsApp</p>
                  <a
                    href={whatsappLink(company.phone.whatsapp, defaultWhatsAppMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block ${linkClass}`}
                  >
                    {company.phone.label}
                    <span className="sr-only"> (opens WhatsApp in a new tab)</span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Email</p>
                  <a href={`mailto:${company.email}`} className={`block break-all ${linkClass}`}>
                    {company.email}
                  </a>
                </div>
              </div>

              {company.hours ? <p className="pl-7 text-xs text-white/55">{company.hours}</p> : null}
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/12 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/55">
            &copy; {year} {company.legalName}. All Rights Reserved.
          </p>
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{company.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
