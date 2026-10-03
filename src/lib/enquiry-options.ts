/** Option lists shared by the public enquiry form and the admin CRM. */

export const PROJECT_TYPES = [
  "Commercial",
  "Residential",
  "Industrial",
  "Hospitality",
  "Retail / Showroom",
  "Office fit-out",
  "Maintenance / AMC",
  "Other",
] as const;

export const BUDGET_RANGES = [
  "Under AED 10,000",
  "AED 10,000 – 50,000",
  "AED 50,000 – 150,000",
  "AED 150,000 – 500,000",
  "Above AED 500,000",
  "Not sure yet",
] as const;

export const LEAD_STATUS_LABELS = {
  NEW: "New",
  CONTACTED: "Contacted",
  SITE_VISIT: "Site visit",
  QUOTATION_SENT: "Quotation sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
} as const;

export const LEAD_STATUS_ORDER = [
  "NEW",
  "CONTACTED",
  "SITE_VISIT",
  "QUOTATION_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export const ENQUIRY_LIMITS = {
  maxFiles: 5,
  maxFileBytes: 10 * 1024 * 1024,
  maxTotalBytes: 25 * 1024 * 1024,
  accept: ".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.dwg",
} as const;
