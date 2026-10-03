/**
 * Editable website content: definitions + the default copy.
 *
 * The defaults are the text the website already used, so the public site is
 * unchanged until an admin saves an edit. A field left empty in the admin falls
 * back to its default.
 *
 * A "block" is a reusable company-content section (vision, values, why-us…).
 * A "page" holds the headings/hero/CTA copy of a public page.
 */

export type FieldDef =
  | { key: string; label: string; kind: "text"; hint?: string; max?: number }
  | { key: string; label: string; kind: "textarea"; hint?: string; max?: number }
  | { key: string; label: string; kind: "list"; hint?: string; multiline?: boolean }
  | {
      key: string;
      label: string;
      kind: "pairs";
      hint?: string;
      fields: { key: string; label: string; type?: "text" | "textarea" | "icon" }[];
    };

export type ContentDef = {
  key: string;
  group: "company" | "page";
  title: string;
  description: string;
  /** Public path the content appears on, shown as "View on website". */
  path?: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
};

const BLOCKS: ContentDef[] = [
  {
    key: "intro",
    group: "company",
    title: "Company introduction",
    description: "The 'who we are' story on the About page.",
    path: "/about/",
    fields: [
      { key: "headline", kind: "text", label: "Headline" },
      { key: "paragraphs", kind: "list", label: "Paragraphs", multiline: true },
      { key: "badge", kind: "textarea", label: "Photo caption", max: 300 },
    ],
    defaults: {
      headline: "A single partner across every trade.",
      paragraphs: [
        "Trio Built Gulf Technical Services LLC provides professional technical services, installation and maintenance solutions for buildings across Dubai and the United Arab Emirates.",
        "Our work spans mechanical, electrical and plumbing disciplines alongside interior finishing trades — delivered with a consistent focus on quality of workmanship, reliability on site and timely execution.",
      ],
      badge: "Technical services delivered across commercial, residential and industrial environments.",
    },
  },
  {
    key: "vision",
    group: "company",
    title: "Vision",
    description: "Shown on the About page.",
    path: "/about/",
    fields: [{ key: "text", kind: "textarea", label: "Vision statement", max: 500 }],
    defaults: { text: "To be a trusted technical services partner in the UAE, delivering excellence and value in every project." },
  },
  {
    key: "mission",
    group: "company",
    title: "Mission",
    description: "Shown on the About page.",
    path: "/about/",
    fields: [{ key: "text", kind: "textarea", label: "Mission statement", max: 600 }],
    defaults: {
      text: "To provide high-quality, reliable and innovative MEP, HVAC and fit-out solutions that meet our clients' needs and contribute to sustainable growth.",
    },
  },
  {
    key: "values",
    group: "company",
    title: "Core values",
    description: "The values listed on the About page.",
    path: "/about/",
    fields: [
      { key: "heading", kind: "text", label: "Heading" },
      {
        key: "items",
        kind: "pairs",
        label: "Values",
        fields: [
          { key: "title", label: "Value" },
          { key: "description", label: "Short description", type: "textarea" },
          { key: "icon", label: "Icon", type: "icon" },
        ],
      },
    ],
    defaults: {
      heading: "What we stand for",
      items: [
        { title: "Integrity", description: "Honest scopes, honest prices, honest communication.", icon: "Scale" },
        { title: "Quality", description: "Workmanship and attention to detail on every installation.", icon: "BadgeCheck" },
        { title: "Safety", description: "A safe working environment for our people and your occupants.", icon: "ShieldCheck" },
        { title: "Customer Focus", description: "Solutions built around your requirements.", icon: "Users" },
        { title: "Continuous Improvement", description: "We review our work and keep raising the standard.", icon: "ClipboardCheck" },
        { title: "Reliability", description: "We do what we say, when we say.", icon: "CalendarCheck" },
        { title: "Professionalism", description: "Courteous, coordinated and well organised.", icon: "Briefcase" },
      ],
    },
  },
  {
    key: "why-us",
    group: "company",
    title: "Why choose Trio Built Gulf",
    description: "The eight reasons shown on the Why Us page.",
    path: "/why-us/",
    fields: [
      { key: "heading", kind: "text", label: "Page heading (lines separated by | )", hint: "e.g. Why | Trio Built | Gulf?" },
      { key: "tagline", kind: "textarea", label: "Gold tagline (one line per row)", max: 200 },
      { key: "intro", kind: "textarea", label: "Intro paragraph", max: 600 },
      {
        key: "items",
        kind: "pairs",
        label: "Reasons",
        fields: [
          { key: "title", label: "Title" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "icon", label: "Icon", type: "icon" },
        ],
      },
      { key: "closing", kind: "textarea", label: "Closing statement", max: 400 },
    ],
    defaults: {
      heading: "Why | Trio Built | Gulf?",
      tagline: "Built on Expertise.\nDriven by Quality.\nFocused on Results.",
      intro:
        "At Trio Built Gulf Technical Services LLC, we combine technical expertise, disciplined execution and customer-focused service to deliver reliable solutions across MEP, HVAC, electrical, plumbing, fit-out and building maintenance.",
      items: [
        { title: "Integrated Technical Expertise", description: "Multiple building services under one professional team, helping clients simplify coordination and project execution.", icon: "Layers3" },
        { title: "Quality Without Compromise", description: "We focus on workmanship, attention to detail and the use of appropriate materials and proven installation practices.", icon: "BadgeCheck" },
        { title: "Reliable Project Execution", description: "From initial site assessment to final handover, we follow a structured approach focused on coordination, quality and timely execution.", icon: "CalendarCheck" },
        { title: "Safety-First Approach", description: "Safety is incorporated into our planning and site operations to support a secure and professional working environment.", icon: "ShieldCheck" },
        { title: "Responsive Technical Support", description: "Our services extend beyond installation, with maintenance and technical support designed to keep building systems operating reliably.", icon: "Headset" },
        { title: "Solutions Tailored to Every Project", description: "Every project has different requirements. We develop practical solutions based on the site, application, scope and client expectations.", icon: "Ruler" },
        { title: "Transparent & Professional Communication", description: "Clear communication, well-defined scopes and professional coordination help create smoother relationships throughout the project.", icon: "MessagesSquare" },
        { title: "Long-Term Partnership", description: "Our objective is not simply to complete a job, but to build lasting relationships through dependable service, consistent quality and ongoing support.", icon: "Handshake" },
      ],
      closing: "Your project deserves more than a service provider. It deserves a technical partner you can rely on.",
    },
  },
  {
    key: "health-safety",
    group: "company",
    title: "Health & safety",
    description: "Safety commitments shown on the About page. Do not claim certifications you do not hold.",
    path: "/about/",
    fields: [
      { key: "heading", kind: "text", label: "Heading" },
      { key: "intro", kind: "textarea", label: "Introduction", max: 600 },
      { key: "points", kind: "list", label: "Commitments" },
    ],
    defaults: {
      heading: "Health & safety",
      intro: "Safe, well-controlled work is the foundation of every project. Our commitment applies from first mobilisation to final handover.",
      points: ["A safe working environment", "Compliance with UAE regulations", "A skilled and trained workforce"],
    },
  },
  {
    key: "quality",
    group: "company",
    title: "Quality",
    description: "Quality commitments shown on the About page.",
    path: "/about/",
    fields: [
      { key: "heading", kind: "text", label: "Heading" },
      { key: "intro", kind: "textarea", label: "Introduction", max: 600 },
      { key: "points", kind: "list", label: "Commitments" },
    ],
    defaults: {
      heading: "Quality",
      intro: "Quality is controlled at every stage rather than checked only at the end.",
      points: ["Quality control at every stage", "Use of standard materials", "Continuous improvement"],
    },
  },
  {
    key: "industries",
    group: "company",
    title: "Industries we serve (intro)",
    description: "Introduction on the Industries page. The industries themselves are managed under Industries.",
    path: "/industries/",
    fields: [
      { key: "heading", kind: "text", label: "Heading" },
      { key: "intro", kind: "textarea", label: "Introduction", max: 600 },
    ],
    defaults: {
      heading: "Sectors we work in",
      intro: "Technical services for the sectors that shape the UAE's built environment.",
    },
  },
  {
    key: "maintenance-amc",
    group: "company",
    title: "Maintenance & AMC",
    description: "The Maintenance page: what is offered and why planned maintenance matters.",
    path: "/maintenance/",
    fields: [
      { key: "heading", kind: "text", label: "Heading" },
      { key: "intro", kind: "textarea", label: "Introduction", max: 800 },
      {
        key: "offerings",
        kind: "pairs",
        label: "What we offer",
        fields: [
          { key: "title", label: "Title" },
          { key: "description", label: "Description", type: "textarea" },
        ],
      },
      { key: "benefits", kind: "list", label: "Benefits" },
    ],
    defaults: {
      heading: "Planned maintenance that keeps buildings performing",
      intro: "Planned and responsive maintenance protects asset value, limits disruption to occupants and keeps building systems running reliably.",
      offerings: [
        { title: "Annual Maintenance Contracts (AMC)", description: "A defined scope and visit plan for a fixed term, agreed up front." },
        { title: "Preventive maintenance", description: "Scheduled inspection and servicing to stop faults developing." },
        { title: "Corrective maintenance", description: "Fault-finding and repair when something fails or underperforms." },
        { title: "Emergency support", description: "Contact us with the problem and we will respond as quickly as practicable." },
        { title: "HVAC, electrical, plumbing & building maintenance", description: "Multiple trades under one arrangement and one point of contact." },
      ],
      benefits: ["Planned maintenance schedules", "Reduced downtime", "Cost-effective solutions", "A clear record of what was done"],
    },
  },
];

const PAGES: ContentDef[] = [
  {
    key: "home",
    group: "page",
    title: "Home page",
    description: "Hero and the closing call-to-action on the home page.",
    path: "/",
    fields: [
      { key: "heroHeadline", kind: "textarea", label: "Hero headline (one line per row)", max: 200 },
      { key: "heroAccent", kind: "text", label: "Hero headline — highlighted line" },
      { key: "heroSubtitle", kind: "textarea", label: "Hero supporting text", max: 300 },
      { key: "primaryCta", kind: "text", label: "Main button label" },
      { key: "whatsappCta", kind: "text", label: "WhatsApp button label" },
      { key: "ctaHeading", kind: "text", label: "Bottom call-to-action heading (lines separated by | )" },
      { key: "ctaText", kind: "textarea", label: "Bottom call-to-action text", max: 300 },
    ],
    defaults: {
      heroHeadline: "MEP, HVAC & Building\nTechnical Services",
      heroAccent: "in Dubai",
      heroSubtitle: "Reliable installation, fit-out and maintenance solutions for commercial, residential and industrial projects.",
      primaryCta: "Request a Quote",
      whatsappCta: "WhatsApp Us",
      ctaHeading: "Need a technical | service?",
      ctaText: "Installation, repair or maintenance in Dubai — message our Dubai team directly on WhatsApp and tell us what you need.",
    },
  },
  {
    key: "about",
    group: "page",
    title: "About page",
    description: "Page banner. The story, vision, values, safety and quality come from the company content sections.",
    path: "/about/",
    fields: [
      { key: "eyebrow", kind: "text", label: "Small label" },
      { key: "title", kind: "text", label: "Banner title" },
      { key: "accent", kind: "text", label: "Banner title — highlighted words" },
    ],
    defaults: { eyebrow: "Who we are", title: "Technical expertise.", accent: "Built around you." },
  },
  {
    key: "services",
    group: "page",
    title: "Services page",
    description: "Banner and intro of the Services page.",
    path: "/services/",
    fields: [
      { key: "eyebrow", kind: "text", label: "Small label" },
      { key: "title", kind: "text", label: "Banner title" },
      { key: "accent", kind: "text", label: "Banner title — highlighted words" },
      { key: "subtitle", kind: "textarea", label: "Banner text", max: 300 },
      { key: "guidesHeading", kind: "text", label: "Services list heading" },
      { key: "guidesIntro", kind: "textarea", label: "Services list introduction", max: 600 },
    ],
    defaults: {
      eyebrow: "What we do",
      title: "Our core",
      accent: "services",
      subtitle: "Licensed technical activities, delivered as a single coordinated scope or as a standalone trade.",
      guidesHeading: "Find the service you need",
      guidesIntro:
        "Trio Built Gulf provides technical services in Dubai for offices, retail, hospitality, residential and industrial properties — from a single trade to a coordinated scope. Each guide below explains what the work covers, when you need it and how we deliver it.",
    },
  },
  {
    key: "projects",
    group: "page",
    title: "Projects page",
    description: "Banner of the Projects page.",
    path: "/projects/",
    fields: [
      { key: "eyebrow", kind: "text", label: "Small label" },
      { key: "title", kind: "text", label: "Banner title" },
      { key: "accent", kind: "text", label: "Banner title — highlighted words" },
      { key: "subtitle", kind: "textarea", label: "Banner text", max: 300 },
    ],
    defaults: {
      eyebrow: "Capabilities",
      title: "Our project",
      accent: "capabilities",
      subtitle:
        "The environments we work in and the packages we deliver. Completed project references are published here as they are approved for release.",
    },
  },
  {
    key: "industries-page",
    group: "page",
    title: "Industries page",
    description: "Banner of the Industries page.",
    path: "/industries/",
    fields: [
      { key: "eyebrow", kind: "text", label: "Small label" },
      { key: "title", kind: "text", label: "Banner title" },
      { key: "accent", kind: "text", label: "Banner title — highlighted words" },
      { key: "subtitle", kind: "textarea", label: "Banner text", max: 300 },
    ],
    defaults: {
      eyebrow: "Who we serve",
      title: "Industries we",
      accent: "serve",
      subtitle: "Commercial, residential, industrial, hospitality and retail properties across Dubai and the UAE.",
    },
  },
  {
    key: "maintenance-page",
    group: "page",
    title: "Maintenance page",
    description: "Banner of the Maintenance & AMC page.",
    path: "/maintenance/",
    fields: [
      { key: "eyebrow", kind: "text", label: "Small label" },
      { key: "title", kind: "text", label: "Banner title" },
      { key: "accent", kind: "text", label: "Banner title — highlighted words" },
      { key: "subtitle", kind: "textarea", label: "Banner text", max: 300 },
    ],
    defaults: {
      eyebrow: "After handover",
      title: "Maintenance &",
      accent: "AMC",
      subtitle: "Preventive and corrective maintenance, and annual maintenance contracts, for buildings in Dubai.",
    },
  },
  {
    key: "contact",
    group: "page",
    title: "Contact page",
    description: "Banner of the Contact page. Phone, email, address and map come from Settings.",
    path: "/contact/",
    fields: [
      { key: "eyebrow", kind: "text", label: "Small label" },
      { key: "title", kind: "text", label: "Banner title" },
      { key: "accent", kind: "text", label: "Banner title — highlighted words" },
      { key: "subtitle", kind: "textarea", label: "Banner text", max: 300 },
    ],
    defaults: {
      eyebrow: "",
      title: "Contact",
      accent: "Trio Built Gulf",
      subtitle:
        "Tell us about your technical service, installation or maintenance requirement and our team will come back to you.",
    },
  },
  {
    key: "footer",
    group: "page",
    title: "Footer",
    description: "The description in the website footer. Contact details come from Settings.",
    fields: [{ key: "description", kind: "textarea", label: "Footer description", max: 400 }],
    defaults: {
      description:
        "Professional technical services, installation and maintenance solutions for commercial, residential and industrial environments across Dubai and the UAE.",
    },
  },
];

export const CONTENT_DEFS: ContentDef[] = [...PAGES, ...BLOCKS];
export const contentDef = (key: string) => CONTENT_DEFS.find((d) => d.key === key);

/** Merge saved values over defaults; empty values fall back to the default. */
export function resolveContent<T extends Record<string, unknown>>(def: ContentDef, saved: unknown): T {
  const out: Record<string, unknown> = { ...def.defaults };
  if (saved && typeof saved === "object") {
    for (const [k, v] of Object.entries(saved as Record<string, unknown>)) {
      const empty = v === "" || v === null || v === undefined || (Array.isArray(v) && v.length === 0);
      if (!empty && k in def.defaults) out[k] = v;
    }
  }
  return out as T;
}
