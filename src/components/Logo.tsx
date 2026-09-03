import Image from "next/image";
import Link from "next/link";
import { company, logoAssets } from "@/lib/site";

/**
 * TRIO BUILT GULF logo.
 *
 * Both artwork files carry an alpha channel, so the logo sits on any ground.
 * `onLight` is the supplied navy-and-teal original for the white header;
 * `onDark` is the white-and-teal colourway for the navy footer.
 *
 * The header and the footer render it at the same size deliberately.
 */
export default function Logo({
  href = "/",
  variant = "onLight",
  className = "",
}: {
  href?: string | null;
  variant?: "onLight" | "onDark";
  className?: string;
}) {
  const { full } = logoAssets;

  const content = (
    <Image
      src={variant === "onDark" ? full.onDark : full.onLight}
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
