# Trio Built Gulf Technical Services LLC — Website

Corporate website for **Trio Built Gulf Technical Services LLC**, Dubai, United Arab Emirates.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and Lucide icons.

---

## Running the site

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run build` produces a fully static site — every page is prerendered, so it
can be deployed to Vercel, Netlify, Cloudflare Pages or any static host.

---

## Editing the content

**Almost everything you will want to change lives in one file:**
[`src/lib/site.ts`](src/lib/site.ts)

| What | Where in `site.ts` |
| --- | --- |
| Company name, address, email, phone numbers | `company` |
| Official logo artwork | `logoAssets` |
| Navigation links | `navLinks` |
| The four headline statistics | `stats` |
| The 11 core services (title, description, icon) | `services` |
| The three featured categories | `featured` |
| "Why clients choose us" blocks | `differentiators` |
| Project / capability cards | `projects` |
| The "How we work" steps | `process` |
| Team members and their contact details | `team` |
| Client testimonials | `testimonials` |
| Options in the enquiry form dropdown | `serviceOptions` |

Change a value there and it updates across the whole site — navigation,
sections, footer, structured data and the contact form.

### The logo

The master is `public/images/trio_built_gulf_logo_high_resolution.png`, the
supplied original. **It is used exactly as given — nothing is recoloured.**

Because the artwork is navy and teal on a light ground, the header, footer and
mobile menu are set in the logo's own stone grey (`#C9C9C1`, the `stone` token)
rather than navy. The header and the footer render it at the **same size**
(184px wide) deliberately.

`scripts/build-logo.mjs` lifts the master's grey ground to transparency —
recovering a true alpha for every anti-aliased edge, so there is no grey
fringe — then trims it.

Output filenames are **content-hashed** (`logo-full.c79eecc0.png`). Without
that the filename never changes, so browsers and CDNs keep serving a cached
copy of the previous logo: the new file is on disk but nobody sees it.

**If you replace the master**, regenerate everything including the favicon:

```bash
node scripts/build-logo.mjs
```

That rewrites `src/lib/logo-assets.ts` with the new hashed paths, so the
components pick the new logo up on the next build with no cache to fight.

### Adding real projects

`projects` currently holds **capability categories**, not real project records —
no client names, project names or dates have been invented.

To publish a real project, add `client`, `location` and/or `year` to an entry:

```ts
{
  slug: "marina-tower-hvac",
  category: "Commercial",
  title: "Marina Tower — HVAC Upgrade",
  description: "…",
  image: "/images/proj-commercial.jpg",
  alt: "…",
  client: "Example Facilities Management",
  location: "Dubai Marina",
  year: "2026",
}
```

The card renders that metadata automatically.

### Team contact cards

Each team member has a downloadable vCard in `public/contacts/` — the digital
equivalent of the QR code on the printed business cards. The "Save contact"
link on each team card points at it via the `vcard` field in `team`.

If you add or change a person, update both the `team` entry and the matching
`.vcf` file.

### Adding testimonials

`testimonials` is intentionally an **empty array** — no testimonials have been
invented. Add real, approved quotes and the testimonials section appears on the
home page by itself. While the array is empty the section stays hidden.

---

## The contact form

The enquiry form validates in the browser (required fields, email format, phone
format, minimum message length), then opens the visitor's email client with a
fully pre-filled message to `company.email`. WhatsApp is offered alongside it.

This means **no enquiry is ever silently dropped** and the site needs no mail
service to work on day one.

To deliver enquiries server-side instead, POST the form values to a route
handler from `buildEnquiryMailto`'s caller in
[`src/lib/enquiry.ts`](src/lib/enquiry.ts) and keep the mailto as the fallback.

---

## Before going live

- [ ] Set `SITE_URL` in [`src/app/layout.tsx`](src/app/layout.tsx) to the real
      domain — it makes canonical and social-share URLs absolute.
- [ ] Add the trade licence number and full street address to `company.address`
      in `site.ts` (the `LocalBusiness` structured data picks them up).
- [ ] Replace the stock photography in `public/images/` with real project
      photography as it becomes available. Keep the same filenames and nothing
      else needs changing.

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx        Fonts, SEO metadata, LocalBusiness structured data
│   ├── page.tsx          Home page — all nine sections
│   ├── contact/page.tsx  Contact page
│   ├── not-found.tsx     404
│   ├── icon.png          Favicon (generated from the logo mark)
│   └── globals.css       Brand tokens, typography, shared utilities
├── components/           Reusable UI (see below)
└── lib/
    ├── site.ts           All site content — edit this
    └── enquiry.ts        Contact form validation and email building

scripts/
└── build-logo.mjs        Regenerates the logo crops + favicon from the master
```

**Components:** `Navbar`, `MobileMenu`, `Logo`, `Hero`, `SectionHeader`,
`ServiceCard`, `ProjectCard`, `StatCard`, `TeamCard`, `TestimonialCard`,
`CTASection`, `Footer`, `ContactForm`, `WhatsAppButton`, `Icon`, `Reveal`.

---

## Brand

Colours measured from the official vector logo
(`TRIO BUILT GULF TECHNICAL SERVICES LLC logo.pdf`) and cross-checked against
the printed business cards — both agree.

| Token | Hex | Tailwind class | Notes |
| --- | --- | --- | --- |
| Navy | `#0A2E50` | `navy` | logo navy |
| Dark Navy | `#071F36` | `navy-900` | section ground |
| Darkest Navy | `#04121F` | `navy-950` | deepest ground |
| Teal | `#348171` | `teal` | logo teal; white text on it passes AA (4.64:1) |
| Dark Teal | `#2A6A5C` | `teal-700` | hover states, teal text on light |
| Light Teal | `#4CAE9A` | `teal-300` | teal text on navy (6.2:1) |
| Stone | `#C9C9C1` | `stone` | the logo ground: header, footer, mobile menu |
| Champagne | `#D8D9A5` | `champagne` | team monograms |
| Light background | `#F5F7F8` | `mist` | |
| Hairline | `#DFE5E9` | `line` | |

Typography: **Manrope** for headings (`font-display`), **Inter** for body text.

---

## Accessibility & performance notes

- One `<h1>` per page with a clean `h2`/`h3` hierarchy throughout.
- All photography carries descriptive alt text; decorative imagery is hidden
  from assistive technology.
- The mobile menu traps scroll, closes on <kbd>Esc</kbd> and on route change.
- Scroll-reveal animations are skipped entirely under
  `prefers-reduced-motion: reduce`, and a `<noscript>` rule guarantees content
  is visible without JavaScript.
- Photography is served locally from `public/images/` and optimised by
  `next/image` — no third-party image requests at runtime.
