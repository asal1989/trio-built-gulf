"use client";

import { usePathname } from "next/navigation";
import { WhatsAppGlyph } from "./WhatsAppButton";
import { defaultWhatsAppMessage, whatsappLink } from "@/lib/site";

/**
 * Floating WhatsApp button, present on every page. On a service page the
 * pre-filled message names that service, so the enquiry arrives with context.
 * The number and per-service messages come from the CMS (passed in by the layout).
 */
export default function FloatingWhatsApp({
  whatsapp,
  serviceMessages = {},
}: {
  whatsapp: string;
  serviceMessages?: Record<string, string>;
}) {
  const pathname = usePathname() ?? "/";
  const slug = pathname.match(/^\/services\/([^/]+)/)?.[1];
  const message = (slug && serviceMessages[slug]) || defaultWhatsAppMessage;

  return (
    <a
      href={whatsappLink(whatsapp, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Trio Built Gulf on WhatsApp (opens in a new tab)"
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex items-center gap-3 rounded-full bg-[#1f9d55] py-3 pl-3 pr-3 text-white shadow-[0_14px_34px_-10px_rgba(4,18,31,0.65)] ring-1 ring-white/20 transition-all duration-300 hover:bg-[#177f44] sm:bottom-6 sm:right-6 sm:pr-6"
    >
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-white/30 motion-reduce:hidden" />
        <WhatsAppGlyph className="relative h-8 w-8" />
      </span>
      <span className="hidden flex-col leading-tight sm:flex">
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">Need a quote?</span>
        <span className="font-display text-sm font-bold uppercase tracking-[0.12em]">WhatsApp now</span>
      </span>
    </a>
  );
}
