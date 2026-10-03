import { Badge, type Tone } from "./ui";
import { LEAD_STATUS_LABELS } from "@/lib/enquiry-options";

export const STATUS_TONE: Record<keyof typeof LEAD_STATUS_LABELS, Tone> = {
  NEW: "blue",
  CONTACTED: "purple",
  SITE_VISIT: "orange",
  QUOTATION_SENT: "gold",
  NEGOTIATION: "teal",
  WON: "green",
  LOST: "red",
};

export function StatusBadge({ status }: { status: keyof typeof LEAD_STATUS_LABELS }) {
  return <Badge tone={STATUS_TONE[status]}>{LEAD_STATUS_LABELS[status]}</Badge>;
}

export const leadCode = (n: number) => `L-${String(n).padStart(6, "0")}`;

export const TYPE_LABEL = { QUOTE: "Quote request", MAINTENANCE: "Maintenance", GENERAL: "General" } as const;

/** Digits-only number for wa.me links. */
export const waDigits = (n?: string | null) => (n ?? "").replace(/\D/g, "");
