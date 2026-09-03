"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone, X } from "lucide-react";
import Logo from "./Logo";
import { company, navLinks } from "@/lib/site";

/**
 * White, matching the header, so the navy logo and links read at full
 * contrast against the panel.
 */
export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] lg:hidden ${open ? "" : "pointer-events-none"}`}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close menu"
        onClick={onClose}
        className={`absolute inset-0 h-full w-full cursor-default bg-navy-950/70 backdrop-blur-sm transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-500 [transition-timing-function:var(--ease-brand)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative flex items-start justify-between gap-4 border-b border-navy/10 px-6 py-5">
          <Logo href={null} />
          <button
            type="button"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            aria-label="Close menu"
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-navy/25 text-navy transition-colors duration-300 hover:border-teal-700 hover:text-teal-700"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-6 py-8">
          <ul>
            {navLinks.map((link, i) => (
              <li key={link.href} className="border-b border-navy/10">
                <Link
                  href={link.href}
                  onClick={onClose}
                  tabIndex={open ? 0 : -1}
                  style={{ transitionDelay: open ? `${120 + i * 55}ms` : "0ms" }}
                  className={`group flex items-center justify-between py-4 font-display text-2xl font-bold uppercase tracking-tight text-navy transition-all duration-500 [transition-timing-function:var(--ease-brand)] hover:text-teal-700 ${
                    open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight
                    className="h-5 w-5 text-navy/30 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-teal-700"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/contact#enquiry"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-[10px] bg-navy px-6 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal-700"
          >
            Get a Quote
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>

          <address className="mt-10 space-y-4 not-italic">
            <p className="flex items-start gap-3 text-sm text-navy/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.5} />
              {company.location}
            </p>
            <a
              href={company.phone.href}
              tabIndex={open ? 0 : -1}
              className="flex items-center gap-3 text-sm text-navy/70 transition-colors hover:text-teal-700"
            >
              <Phone className="h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.5} />
              {company.phone.label}
            </a>
            <a
              href={`mailto:${company.email}`}
              tabIndex={open ? 0 : -1}
              className="flex items-center gap-3 break-all text-sm text-navy/70 transition-colors hover:text-teal-700"
            >
              <Mail className="h-4 w-4 shrink-0 text-teal-700" strokeWidth={1.5} />
              {company.email}
            </a>
          </address>
        </nav>
      </div>
    </div>
  );
}
