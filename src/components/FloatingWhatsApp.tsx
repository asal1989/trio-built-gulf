"use client";

import { usePathname } from "next/navigation";
import { WhatsAppGlyph } from "./WhatsAppButton";
import { servicePageBySlug } from "@/lib/service-pages";
import { company, defaultWhatsAppMessage, whatsappLink } from "@/lib/site";

/**
 * Floating "live enquiry" button, present on every page.
 *
 * Collapsed it is a discreet green circle. On hover or keyboard focus it
 * expands to show "Need technical help? — WhatsApp us". On touch screens a tap
 * opens WhatsApp straight away. On a service page the pre-filled message names
 * that service, so the enquiry arrives with context.
 */
export default function FloatingWhatsApp() {
  const pathname = usePathname() ?? "/";
  const slug = pathname.match(/^\/services\/([^/]+)/)?.[1];
  const message =
    (slug && servicePageBySlug(slug)?.whatsappMessage) || defaultWhatsAppMessage;

  return (
    <a
      href={whatsappLink(company.phone.whatsapp, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Need technical help? Chat with Trio Built Gulf on WhatsApp (opens in a new tab)"
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex items-center rounded-full bg-[#1f9d55] p-3 text-white shadow-[0_14px_34px_-10px_rgba(4,18,31,0.65)] ring-1 ring-white/20 transition-colors duration-300 hover:bg-[#177f44] focus-visible:bg-[#177f44] sm:bottom-6 sm:right-6"
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-ping rounded-full bg-white/30 motion-reduce:hidden"
        />
        <WhatsAppGlyph className="relative h-8 w-8" />
      </span>

      {/* Expands on hover / focus (desktop only) */}
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-500 [transition-timing-function:var(--ease-brand)] group-hover:ml-3 group-hover:max-w-[15rem] group-hover:pr-3 group-hover:opacity-100 group-focus-visible:ml-3 group-focus-visible:max-w-[15rem] group-focus-visible:pr-3 group-focus-visible:opacity-100 sm:flex sm:flex-col sm:leading-tight">
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
          Need technical help?
        </span>
        <span className="font-display text-sm font-bold uppercase tracking-[0.12em]">
          WhatsApp us &rarr;
        </span>
      </span>
    </a>
  );
}
