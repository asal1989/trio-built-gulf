"use client";

import { useEffect, useRef } from "react";
import type { Stat } from "@/lib/site";

/**
 * Statistic block.
 *
 * The final value is rendered server-side, so it is correct without JS and for
 * crawlers. On mount, numeric values rewind to zero and count up the first
 * time the block scrolls into view. The digits are written straight to the DOM
 * node — a per-frame setState here would re-render on every animation frame.
 */
export default function StatCard({
  stat,
  tone = "light",
}: {
  stat: Stat;
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);

  const suffix = stat.suffix ?? "";
  const finalDisplay = stat.display ?? `${stat.value ?? 0}${suffix}`;

  useEffect(() => {
    const target = stat.value;
    const root = ref.current;
    const node = valueRef.current;

    // Nothing to animate for non-numeric values such as "UAE".
    if (target === null || !root || !node) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;
    node.textContent = `0${suffix}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const duration = 1500;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // easeOutExpo — quick settle, no overshoot
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          node.textContent = `${Math.round(target * eased)}${suffix}`;
          if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      // Leave the final value behind if the component unmounts mid-count.
      node.textContent = `${target}${suffix}`;
    };
  }, [stat.value, suffix]);

  const isDark = tone === "dark";

  return (
    <div
      ref={ref}
      className={`border-t pt-5 ${isDark ? "border-white/15" : "border-line"}`}
    >
      <p
        ref={valueRef}
        className={`font-display text-[clamp(1.9rem,4.4vw,2.9rem)] font-extrabold leading-none tabular-nums ${
          isDark ? "text-white" : "text-navy"
        }`}
      >
        {finalDisplay}
      </p>
      <p
        className={`mt-3 font-display text-[10px] font-bold uppercase leading-relaxed tracking-[0.18em] ${
          isDark ? "text-teal-300" : "text-teal-700"
        }`}
      >
        {stat.label}
      </p>
    </div>
  );
}
