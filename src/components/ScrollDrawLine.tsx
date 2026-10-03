"use client";

import { useEffect, useRef } from "react";

/**
 * A line that draws itself as the visitor scrolls through its parent section —
 * used for the project execution timeline. Vertical on mobile, horizontal from
 * the `lg` breakpoint (matching the track it sits on). With reduced motion it
 * is simply drawn in full.
 */
export default function ScrollDrawLine({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "1");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = parent.getBoundingClientRect();
      // Starts drawing when the section reaches ~80% of the viewport and finishes near its end.
      const progress = (window.innerHeight * 0.8 - rect.top) / (rect.height + window.innerHeight * 0.1);
      el.style.setProperty("--p", Math.max(0, Math.min(1, progress)).toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      style={{ ["--p" as string]: 0 }}
      className={`pointer-events-none absolute left-[19px] top-2 z-[1] h-full w-px origin-top bg-teal [transform:scaleY(var(--p))] lg:left-0 lg:top-[19px] lg:h-px lg:w-full lg:origin-left lg:[transform:scaleX(var(--p))] ${className}`}
    />
  );
}
