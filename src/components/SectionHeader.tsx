import type { ReactNode } from "react";
import Reveal from "./Reveal";

/**
 * The one heading treatment used by every section: numbered eyebrow, large
 * display heading, optional supporting line, optional trailing slot.
 */
export default function SectionHeader({
  id,
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "light",
  action,
  headingLevel: Heading = "h2",
  className = "",
}: {
  /** Wired to the section's `aria-labelledby`. */
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  action?: ReactNode;
  headingLevel?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const isDark = tone === "dark";
  const centered = align === "center";

  return (
    <div
      className={`flex flex-col gap-8 ${
        centered
          ? "items-center text-center"
          : "lg:flex-row lg:items-end lg:justify-between"
      } ${className}`}
    >
      <Reveal className={centered ? "max-w-3xl" : "max-w-3xl"}>
        {eyebrow ? (
          <span
            className={`eyebrow mb-6 ${isDark ? "text-teal-300" : "text-teal-700"}`}
          >
            {eyebrow}
          </span>
        ) : null}

        <Heading
          id={id}
          className={`text-[clamp(2rem,5.2vw,3.75rem)] font-extrabold uppercase leading-[1.03] ${
            isDark ? "text-white" : "text-navy"
          }`}
        >
          {title}
        </Heading>

        {subtitle ? (
          <p
            className={`mt-6 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg ${
              isDark ? "text-white/65" : "text-navy/65"
            } ${centered ? "mx-auto" : ""}`}
          >
            {subtitle}
          </p>
        ) : null}
      </Reveal>

      {action ? <Reveal delay={120} className="shrink-0">{action}</Reveal> : null}
    </div>
  );
}
