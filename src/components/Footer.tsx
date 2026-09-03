import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import { company, navLinks, services } from "@/lib/site";

/**
 * Set in the logo's own stone grey, matching the header, so the supplied
 * artwork is shown exactly as given.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-stone text-navy">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="tech-grid absolute -inset-[20%] text-navy/[0.06]" />
      </div>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-navy/15" />

      <div className="shell relative py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* Identity */}
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-7 max-w-sm text-pretty text-sm leading-relaxed text-navy/70">
              Professional technical services, installation and maintenance
              solutions for commercial, residential and industrial environments
              across Dubai and the UAE.
            </p>
            <p className="mt-7 flex items-center gap-3 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
              <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-teal-700" />
              {company.city} &bull; {company.country}
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-navy/55">
              Navigate
            </h2>
            <ul className="mt-6 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-navy/75 transition-colors duration-300 hover:text-teal-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <div className="lg:col-span-3">
            <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-navy/55">
              Services
            </h2>
            <ul className="mt-6 space-y-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href="/#services"
                    className="text-sm leading-relaxed text-navy/75 transition-colors duration-300 hover:text-teal-700"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-navy/55">
              Contact
            </h2>
            <address className="mt-6 space-y-4 not-italic">
              <p className="flex items-start gap-3 text-sm text-navy/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.5} aria-hidden="true" />
                {company.location}
              </p>
              <a
                href={`mailto:${company.email}`}
                className="flex items-start gap-3 break-all text-sm text-navy/75 transition-colors duration-300 hover:text-teal-700"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.5} aria-hidden="true" />
                {company.email}
              </a>
              <a
                href={company.phone.href}
                className="flex items-start gap-3 text-sm text-navy/75 transition-colors duration-300 hover:text-teal-700"
              >
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.5} aria-hidden="true" />
                {company.phone.label}
              </a>
              <a
                href={company.phoneAlt.href}
                className="flex items-start gap-3 text-sm text-navy/75 transition-colors duration-300 hover:text-teal-700"
              >
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.5} aria-hidden="true" />
                {company.phoneAlt.label}
              </a>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-navy/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-navy/60">
            &copy; {year} {company.legalName}. All Rights Reserved.
          </p>
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-navy/45">
            Technical Services &bull; Installation &bull; Maintenance
          </p>
        </div>
      </div>
    </footer>
  );
}
