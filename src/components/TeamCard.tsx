import Image from "next/image";
import { Download, Mail, Phone } from "lucide-react";
import { asset } from "@/lib/asset";
import type { TeamMember } from "@/lib/site";

/**
 * Team card. Deliberately carries no biography — only the name, role and the
 * contact routes published on the official business cards.
 *
 * The champagne monogram plate mirrors the printed card, where the logo sits on
 * a champagne panel; the vCard link is the digital equivalent of the card's QR.
 */
export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group relative flex flex-col border border-white/10 bg-white/[0.03] p-8 transition-all duration-500 [transition-timing-function:var(--ease-brand)] hover:-translate-y-1.5 hover:border-teal/40 hover:bg-white/[0.06] sm:p-10">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-teal transition-transform duration-500 [transition-timing-function:var(--ease-brand)] group-hover:scale-x-100"
      />

      {member.card ? (
        /* The official printed card, shown as supplied. It carries the same
           details as the links below, so it is decorative for a screen reader
           only in the sense that nothing here is unique to it. */
        <div className="overflow-hidden rounded-lg shadow-[0_24px_50px_-28px_rgba(0,0,0,0.85)]">
          <Image
            src={member.card}
            alt={member.cardAlt ?? `Business card for ${member.name}`}
            width={614}
            height={378}
            sizes="(min-width: 640px) 44vw, 90vw"
            className="h-auto w-full"
          />
        </div>
      ) : (
        /* Monogram plate — used when no card scan is available */
        <div className="flex h-16 w-16 items-center justify-center bg-champagne">
          <span className="font-display text-lg font-extrabold tracking-tight text-navy">
            {member.initials}
          </span>
        </div>
      )}

      <h3 className="mt-8 text-xl font-bold leading-tight text-white sm:text-2xl">
        {member.name}
      </h3>
      <p className="mt-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">
        {member.role}
      </p>

      <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
        {member.phone ? (
          <a
            href={member.phone.href}
            className="flex items-center gap-3 text-sm text-white/65 transition-colors duration-300 hover:text-teal-300"
          >
            <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only">Call {member.name} on </span>
            {member.phone.label}
          </a>
        ) : null}

        {member.email ? (
          <a
            href={`mailto:${member.email}`}
            className="flex items-center gap-3 break-all text-sm text-white/65 transition-colors duration-300 hover:text-teal-300"
          >
            <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only">Email {member.name} at </span>
            {member.email}
          </a>
        ) : null}

        {member.vcard ? (
          <a
            href={asset(member.vcard)}
            download
            className="mt-5 inline-flex items-center gap-2 border-b border-white/25 pb-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-teal hover:text-teal-300"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            Save contact
            <span className="sr-only"> for {member.name} (.vcf file)</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
