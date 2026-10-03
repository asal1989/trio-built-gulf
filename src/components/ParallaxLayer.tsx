"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Slow parallax for a hero background: the layer drifts at a fraction of the
 * scroll speed. It does nothing for visitors who prefer reduced motion, and it
 * stops updating once the hero is out of view.
 */
export default function ParallaxLayer({
  children,
  speed = 0.35,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // Past the first screen the hero is off-screen; no need to keep moving it.
      if (y < window.innerHeight * 1.2) el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
