"use client";

import Image from "next/image";
import { useId, useState, type ComponentType, type FormEvent } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Headset,
  Lock,
  Mail,
  Package,
  PencilLine,
  Phone,
  PhoneCall,
  SendHorizontal,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";
import { company, serviceOptions } from "@/lib/site";
import {
  buildEnquiryMailto,
  emptyEnquiry,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryValues,
} from "@/lib/enquiry";

/** Points the visitor makes up their mind on, beside the form itself. */
const ASSURANCES = [
  {
    icon: ShieldCheck,
    title: "Reliable Solutions",
    body: "High-quality services tailored to your needs.",
  },
  {
    icon: Clock,
    title: "Timely Response",
    body: "We value your time and ensure quick replies.",
  },
  {
    icon: Users,
    title: "Expert Team",
    body: "Experienced professionals dedicated to your success.",
  },
];

const FIELD_BASE =
  "w-full rounded-lg border bg-white py-3.5 pl-12 pr-4 text-sm text-navy transition-colors duration-300 placeholder:text-navy/65 focus:outline-none focus-visible:outline-none";

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

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_40px_80px_-60px_rgba(4,18,31,0.6)]">
      <div className="grid lg:grid-cols-[minmax(0,360px)_1fr]">
        <Assurances />

        <div className="min-w-0">
          {submitted ? (
            <Sent onReset={() => { setValues(emptyEnquiry); setSubmitted(false); }} />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-6 p-7 sm:grid-cols-2 sm:p-9">
                <Field
                  label="Full Name"
                  name="name"
                  icon={User}
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
                  label="Company (optional)"
                  name="companyName"
                  icon={Building2}
                  value={values.companyName}
                  error={errors.companyName}
                  onChange={update}
                  id={fieldId("companyName")}
                  errorId={errorId("companyName")}
                  className={fieldClass("companyName")}
                  autoComplete="organization"
                  placeholder="Company name"
                />

                <Field
                  label="Email"
                  name="email"
                  type="email"
                  icon={Mail}
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
                  icon={Phone}
                  required
                  value={values.phone}
                  error={errors.phone}
                  onChange={update}
                  id={fieldId("phone")}
                  errorId={errorId("phone")}
                  className={fieldClass("phone")}
                  autoComplete="tel"
                  placeholder="+971 50 000 0000"
                />

                <div className="sm:col-span-2">
                  <Label htmlFor={fieldId("service")} required>
                    Service Required
                  </Label>
                  <div className="relative">
                    <FieldIcon icon={Package} />
                    <select
                      id={fieldId("service")}
                      name="service"
                      required
                      value={values.service}
                      onChange={(e) => update("service", e.target.value)}
                      aria-invalid={errors.service ? true : undefined}
                      aria-describedby={
                        errors.service ? errorId("service") : undefined
                      }
                      className={`${fieldClass("service")} appearance-none pr-12`}
                    >
                      <option value="">Select a service…</option>
                      {serviceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy/55"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                  <FieldError id={errorId("service")} message={errors.service} />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor={fieldId("message")} required>
                    Message
                  </Label>
                  <div className="relative">
                    <PencilLine
                      className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-navy/55"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <textarea
                      id={fieldId("message")}
                      name="message"
                      required
                      rows={5}
                      value={values.message}
                      onChange={(e) => update("message", e.target.value)}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={
                        errors.message ? errorId("message") : undefined
                      }
                      placeholder="Tell us about the site, scope and timing of your requirement."
                      className={`${fieldClass("message")} resize-y py-3.5`}
                    />
                  </div>
                  <FieldError id={errorId("message")} message={errors.message} />
                </div>
              </div>

              <div className="flex flex-col gap-5 border-t border-line bg-mist px-7 py-6 sm:flex-row sm:items-center sm:px-9">
                <button
                  type="submit"
                  className="group inline-flex items-center justify-center gap-3 rounded-lg bg-navy px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-teal"
                >
                  <SendHorizontal
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  Send Enquiry
                </button>

                <p className="flex items-center gap-3 text-xs leading-relaxed text-navy/70">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                    <Lock
                      className="h-4 w-4 text-navy/45"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                  Your information is secure and will not be shared.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panels                                                                    */
/* -------------------------------------------------------------------------- */

/** The navy side panel: why to write, and how to skip the form entirely. */
function Assurances() {
  return (
    <aside className="relative overflow-hidden bg-navy-950 p-8 sm:p-10">
      <Image
        src="/images/cta-architecture.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1024px) 360px, 100vw"
        className="object-cover opacity-25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(160deg,rgba(4,18,31,0.95)_0%,rgba(7,31,54,0.9)_45%,rgba(42,106,92,0.85)_100%)]"
      />

      <div className="relative flex h-full flex-col">
        <div className="flex gap-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal">
            <Headset className="h-5 w-5 text-white" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-bold leading-snug text-white">
              We&rsquo;re Here to Help
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Our experts are ready to assist you with the right solutions.
            </p>
          </div>
        </div>

        <ul className="mt-8 space-y-7 border-t border-white/15 pt-8">
          {ASSURANCES.map(({ icon: Glyph, title, body }) => (
            <li key={title} className="flex gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/50">
                <Glyph className="h-5 w-5 text-gold" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <h4 className="font-bold leading-snug text-white">{title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex items-center gap-5 border-t border-white/15 pt-8 lg:mt-auto">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal">
            <PhoneCall className="h-5 w-5 text-white" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-white/60">Need immediate assistance?</p>
            <a
              href={company.phone.href}
              className="mt-1 block text-lg font-bold text-white transition-colors duration-300 hover:text-teal-300"
            >
              {company.phone.label}
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Shown once the visitor's email client has been handed the enquiry. */
function Sent({ onReset }: { onReset: () => void }) {
  return (
    <div role="status" className="flex h-full flex-col items-start p-8 sm:p-10">
      <CheckCircle2
        className="h-10 w-10 text-teal"
        strokeWidth={1.4}
        aria-hidden="true"
      />
      <h3 className="mt-6 text-2xl font-bold text-navy">
        Your enquiry is ready to send
      </h3>
      <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-navy/65">
        We have opened your email application with the enquiry pre-filled. Press
        send there and our team will come back to you. If nothing opened,
        message us directly on WhatsApp instead.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <WhatsAppButton />
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/20 px-7 py-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-navy transition-colors duration-300 hover:border-teal hover:text-teal-700"
        >
          Send another enquiry
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form primitives                                                           */
/* -------------------------------------------------------------------------- */

function FieldIcon({ icon: Glyph }: { icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }> }) {
  return (
    <Glyph
      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy/55"
      strokeWidth={1.5}
      aria-hidden={true}
    />
  );
}

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
      className="mb-2.5 block font-display text-[11px] font-bold uppercase tracking-[0.16em] text-navy/75"
    >
      {children}
      {required ? (
        <span className="ml-1 text-gold-600" aria-hidden="true">
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
  icon,
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
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
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
      <div className="relative">
        <FieldIcon icon={icon} />
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
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
