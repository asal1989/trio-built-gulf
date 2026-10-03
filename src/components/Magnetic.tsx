"use client";

import { useRef, type ReactNode } from "react";

/**
 * Very subtle "magnetic" pull toward the cursor for key call-to-action buttons.
 * Desktop pointers only (fine pointer + hover); disabled for touch and for
 * visitors who prefer reduced motion. The pull is capped at a few pixels.
 */
export default function Magnetic({
  children,
  strength = 0.18,
  max = 8,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const enabled = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * strength;
    const dy = (e.clientY - (r.top + r.height / 2)) * strength;
    const clamp = (v: number) => Math.max(-max, Math.min(max, v));
    el.style.transform = `translate3d(${clamp(dx).toFixed(1)}px, ${clamp(dy).toFixed(1)}px, 0)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  );
}
