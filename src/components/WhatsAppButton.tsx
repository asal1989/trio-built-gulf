import { company, defaultWhatsAppMessage, whatsappLink } from "@/lib/site";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 4.99L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.24h.01c5.49 0 9.95-4.46 9.95-9.96A9.9 9.9 0 0 0 19.08 4.9 9.9 9.9 0 0 0 12.04 2Zm0 1.86c2.17 0 4.2.84 5.73 2.38a8.05 8.05 0 0 1 2.37 5.73c0 4.47-3.63 8.1-8.1 8.1a8.06 8.06 0 0 1-4.11-1.13l-.3-.17-3.06.8.82-2.99-.19-.31a8.02 8.02 0 0 1-1.23-4.3c0-4.47 3.63-8.11 8.07-8.11Zm-2.6 4.05c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34 1 2.5c.12.16 1.7 2.6 4.13 3.55 2.02.79 2.43.63 2.87.59.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.3-.74-1.78-.19-.45-.39-.39-.53-.4h-.46Z" />
    </svg>
  );
}

/**
 * WhatsApp call-to-action. Defaults to the primary operations number and
 * pre-fills a neutral enquiry message.
 */
export default function WhatsAppButton({
  phone = company.phone.whatsapp,
  label = "WhatsApp Us",
  message = defaultWhatsAppMessage,
  variant = "solid",
  className = "",
}: {
  phone?: string;
  label?: string;
  message?: string;
  variant?: "solid" | "outline";
  className?: string;
}) {
  const styles =
    variant === "solid"
      ? "bg-[#1f9d55] text-white hover:bg-[#177f44]"
      : "border border-white/25 text-white hover:border-teal hover:bg-white/5";

  return (
    <a
      href={whatsappLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${styles} ${className}`}
    >
      <WhatsAppGlyph className="h-4 w-4" />
      {label}
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}
