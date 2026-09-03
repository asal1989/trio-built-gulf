"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Phone } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { company, navLinks } from "@/lib/site";

/**
 * The bar is set in the logo's own stone grey so the supplied artwork can be
 * shown unaltered. It stays solid at every scroll position — a transparent bar
 * would put the navy logo over the dark hero, where it would disappear.
 */
export default function Navbar() {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the panel on route change, including back/forward.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* Contact strip — retracts once the page starts scrolling */}
      <div
        className={`fixed inset-x-0 top-0 z-50 hidden bg-navy-950 transition-all duration-500 lg:block ${
          scrolled
            ? "pointer-events-none -translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="shell flex h-10 items-center justify-between text-[11px] font-medium tracking-[0.14em] text-white/60">
          <span className="uppercase">
            {company.city} <span className="text-teal-300">&bull;</span>{" "}
            {company.country}
          </span>
          <div className="flex items-center gap-6">
            <a
              href={`mailto:${company.email}`}
              className="transition-colors hover:text-teal-300"
            >
              {company.email}
            </a>
            <span aria-hidden="true" className="h-3 w-px bg-white/20" />
            <a
              href={company.phone.href}
              className="flex items-center gap-2 transition-colors hover:text-teal-300"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
              {company.phone.label}
            </a>
          </div>
        </div>
      </div>

      <header
        className={`fixed inset-x-0 z-50 border-b border-navy/10 bg-stone transition-all duration-500 [transition-timing-function:var(--ease-brand)] ${
          scrolled
            ? "top-0 shadow-[0_10px_40px_-24px_rgba(10,46,80,0.45)]"
            : "top-0 lg:top-10"
        }`}
      >
        <div className="shell flex h-[132px] items-center justify-between gap-4 sm:h-[156px] xl:gap-8">
          <Logo />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active =
                  link.href === "/contact" && pathname === "/contact";
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative block whitespace-nowrap px-2.5 py-2 font-display text-[13px] font-extrabold uppercase tracking-[0.08em] transition-colors duration-300 xl:px-4 xl:text-[15px] xl:tracking-[0.12em] ${
                        active ? "text-teal-700" : "text-navy hover:text-teal-700"
                      }`}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-4 bottom-0 h-px origin-left bg-teal transition-transform duration-500 [transition-timing-function:var(--ease-brand)] ${
                          active
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/contact#enquiry"
              className="group hidden items-center gap-2 whitespace-nowrap rounded-[10px] bg-navy px-5 py-3.5 font-display text-[13px] font-extrabold uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:bg-teal-700 sm:inline-flex xl:px-6 xl:tracking-[0.14em]"
            >
              Get a Quote
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2.5}
              />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-navy/25 text-navy transition-colors duration-300 hover:border-teal-700 hover:text-teal-700 lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer — the header is fixed, so every page starts below it. */}
      <div aria-hidden="true" className="h-[132px] sm:h-[156px] lg:h-[196px]" />

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
