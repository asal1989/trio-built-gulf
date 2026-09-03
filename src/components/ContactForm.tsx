"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";
import { serviceOptions } from "@/lib/site";
import {
  buildEnquiryMailto,
  emptyEnquiry,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryValues,
} from "@/lib/enquiry";

const FIELD_BASE =
  "w-full rounded-[10px] border bg-white px-4 py-3.5 text-sm text-navy transition-colors duration-300 placeholder:text-navy/35 focus:outline-none focus-visible:outline-none";

export default function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState<EnquiryValues>(emptyEnquiry);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const fieldId = (name: keyof EnquiryValues) => `${uid}-${name}`;
  const errorId = (name: keyof EnquiryValues) => `${uid}-${name}-error`;

  const update = (name: keyof EnquiryValues, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear a field's error as soon as the visitor starts correcting it.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateEnquiry(values);
    setErrors(nextErrors);

    const firstError = Object.keys(nextErrors)[0] as
      | keyof EnquiryValues
      | undefined;

    if (firstError) {
      document.getElementById(fieldId(firstError))?.focus();
      return;
    }

    window.location.href = buildEnquiryMailto(values);
    setSubmitted(true);
  };

  const fieldClass = (name: keyof EnquiryValues) =>
    `${FIELD_BASE} ${
      errors[name]
        ? "border-red-500/70 focus:border-red-500"
        : "border-line focus:border-teal"
    }`;

  if (submitted) {
    return (
      <div
        role="status"
        className="flex flex-col items-start border border-teal/30 bg-mist p-8 sm:p-10"
      >
        <CheckCircle2
          className="h-10 w-10 text-teal"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <h3 className="mt-6 text-2xl font-bold text-navy">
          Your enquiry is ready to send
        </h3>
        <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-navy/65">
          We have opened your email application with the enquiry pre-filled.
          Press send there and our team will come back to you. If nothing
          opened, message us directly on WhatsApp instead.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton />
          <button
            type="button"
            onClick={() => {
              setValues(emptyEnquiry);
              setSubmitted(false);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-navy/20 px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-navy transition-colors duration-300 hover:border-teal hover:text-teal-700"
          >
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border border-line bg-white p-7 sm:p-10"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Full Name"
          name="name"
          required
          value={values.name}
          error={errors.name}
          onChange={update}
          id={fieldId("name")}
          errorId={errorId("name")}
          className={fieldClass("name")}
          autoComplete="name"
          placeholder="Your name"
        />

        <Field
          label="Company"
          name="companyName"
          value={values.companyName}
          error={errors.companyName}
          onChange={update}
          id={fieldId("companyName")}
          errorId={errorId("companyName")}
          className={fieldClass("companyName")}
          autoComplete="organization"
          placeholder="Company name (optional)"
        />

        <Field
          label="Email"
          name="email"
          type="email"
          required
          value={values.email}
          error={errors.email}
          onChange={update}
          id={fieldId("email")}
          errorId={errorId("email")}
          className={fieldClass("email")}
          autoComplete="email"
          placeholder="you@company.com"
        />

        <Field
          label="Phone"
          name="phone"
          type="tel"
          value={values.phone}
          error={errors.phone}
          onChange={update}
          id={fieldId("phone")}
          errorId={errorId("phone")}
          className={fieldClass("phone")}
          autoComplete="tel"
          placeholder="+971 50 000 0000"
        />

        {/* Service select */}
        <div className="sm:col-span-2">
          <Label htmlFor={fieldId("service")} required>
            Service Required
          </Label>
          <select
            id={fieldId("service")}
            name="service"
            required
            value={values.service}
            onChange={(e) => update("service", e.target.value)}
            aria-invalid={errors.service ? true : undefined}
            aria-describedby={errors.service ? errorId("service") : undefined}
            className={`${fieldClass("service")} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%230B2A50" stroke-width="1.5"><path d="m6 9 6 6 6-6"/></svg>')] bg-[length:20px_20px] bg-[right_1rem_center] bg-no-repeat pr-12`}
          >
            <option value="">Select a service…</option>
            {serviceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError id={errorId("service")} message={errors.service} />
        </div>

        {/* Message */}
        <div className="sm:col-span-2">
          <Label htmlFor={fieldId("message")} required>
            Message
          </Label>
          <textarea
            id={fieldId("message")}
            name="message"
            required
            rows={5}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? errorId("message") : undefined}
            placeholder="Tell us about the site, scope and timing of your requirement."
            className={`${fieldClass("message")} resize-y`}
          />
          <FieldError id={errorId("message")} message={errors.message} />
        </div>
      </div>

      <button
        type="submit"
        className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-navy px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal sm:w-auto"
      >
        Send Enquiry
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>

      <p className="mt-5 text-xs leading-relaxed text-navy/50">
        Fields marked with an asterisk are required. Your details are used only
        to respond to this enquiry.
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form primitives                                                           */
/* -------------------------------------------------------------------------- */

function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2.5 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-navy/60"
    >
      {children}
      {required ? (
        <span className="ml-1 text-teal" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

function Field({
  label,
  name,
  id,
  errorId,
  value,
  error,
  onChange,
  className,
  type = "text",
  required,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: keyof EnquiryValues;
  id: string;
  errorId: string;
  value: string;
  error?: string;
  onChange: (name: keyof EnquiryValues, value: string) => void;
  className: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={className}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
