"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Slow parallax for large photographs.
 *
 *  - mode "page"    (hero): drifts at a fraction of the page scroll.
 *  - mode "element" (mid-page images): drifts relative to where the element sits
 *    in the viewport, so the photo moves slower than the content around it.
 *
 * Does nothing when the visitor prefers reduced motion, and skips work while
 * the element is off-screen.
 */
export default function ParallaxLayer({
  children,
  speed = 0.22,
  mode = "page",
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  mode?: "page" | "element";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (mode === "page") {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
        return;
      }
      const parent = el.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translate3d(0, ${(-offset).toFixed(1)}px, 0)`;
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
  }, [speed, mode]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
