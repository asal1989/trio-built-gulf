import Image from "next/image";
import Link from "next/link";
import { company, logoAssets } from "@/lib/site";

/**
 * TRIO BUILT GULF logo.
 *
 * The supplied artwork is used exactly as given — navy and teal, nothing
 * recoloured. It is drawn for a light ground, so the header, footer and mobile
 * menu are set in the logo's own stone grey rather than navy.
 *
 * The header and the footer render it at the same size deliberately.
 */
export default function Logo({
  href = "/",
  className = "",
}: {
  href?: string | null;
  className?: string;
}) {
  const { full } = logoAssets;

  const content = (
    <Image
      src={full.onLight}
      alt={company.legalName}
      width={full.width}
      height={full.height}
      priority
      className={`h-auto w-[168px] sm:w-[184px] ${className}`}
    />
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      aria-label={`${company.legalName} — home`}
      className="inline-flex shrink-0 items-center rounded-sm"
    >
      {content}
    </Link>
  );
}
