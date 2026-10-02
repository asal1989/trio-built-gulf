import {
  BadgeCheck,
  CalendarCheck,
  Droplets,
  Frame,
  Grid3x3,
  Hammer,
  Handshake,
  Headset,
  Layers,
  Layers3,
  LayoutPanelTop,
  MessagesSquare,
  Paintbrush,
  Ruler,
  Settings2,
  ShieldCheck,
  Target,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Explicit icon registry. Keeping it a static map (rather than a dynamic
 * lookup on the whole lucide package) means only these icons are bundled.
 */
const ICONS: Record<string, LucideIcon> = {
  BadgeCheck,
  CalendarCheck,
  Droplets,
  Frame,
  Grid3x3,
  Hammer,
  Handshake,
  Headset,
  Layers,
  Layers3,
  LayoutPanelTop,
  MessagesSquare,
  Paintbrush,
  Ruler,
  Settings2,
  ShieldCheck,
  Target,
  Wind,
  Zap,
};

export default function Icon({
  name,
  className,
  strokeWidth = 1.4,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Component = ICONS[name] ?? Wrench;
  return (
    <Component
      className={className}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      focusable="false"
    />
  );
}
