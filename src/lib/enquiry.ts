import { company } from "./site";

export type EnquiryValues = {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

export type EnquiryErrors = Partial<Record<keyof EnquiryValues, string>>;

export const emptyEnquiry: EnquiryValues = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  service: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
// Digits, spaces and the usual separators; 7–15 digits after stripping.
const PHONE_PATTERN = /^[+0-9()\-.\s]{7,24}$/;

export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your full name.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  // Optional, but must look like a number when supplied.
  if (values.phone.trim()) {
    const digits = values.phone.replace(/\D/g, "");
    if (!PHONE_PATTERN.test(values.phone.trim()) || digits.length < 7) {
      errors.phone = "Please enter a valid phone number.";
    }
  }

  if (!values.service) {
    errors.service = "Please select the service you need.";
  }

  if (!values.message.trim()) {
    errors.message = "Please tell us about your requirement.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Please add a little more detail (10 characters or more).";
  }

  return errors;
}

/**
 * Builds the enquiry email.
 *
 * The site ships without a mail provider, so submitting hands a fully
 * pre-filled message to the visitor's email client — nothing is silently
 * dropped. To deliver server-side instead, POST `values` to a route handler
 * here and keep the mailto as the failure fallback.
 */
export function buildEnquiryMailto(values: EnquiryValues): string {
  const subject = `Enquiry: ${values.service} — ${values.name}`;

  const body = [
    `Name: ${values.name.trim()}`,
    `Company: ${values.companyName.trim() || "—"}`,
    `Email: ${values.email.trim()}`,
    `Phone: ${values.phone.trim() || "—"}`,
    `Service required: ${values.service}`,
    "",
    "Message:",
    values.message.trim(),
    "",
    "—",
    `Sent from the ${company.legalName} website.`,
  ].join("\r\n");

  return `mailto:${company.email}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}
