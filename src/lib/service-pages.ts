/**
 * Content for the individual service pages (/services/<slug>/).
 *
 * Each page targets one real search intent and is written to be useful on its
 * own: what the work covers, when a client needs it, how it is delivered and
 * the questions clients actually ask. There are no invented projects, client
 * names, certifications, prices or response-time promises. Replace or extend
 * the copy as real project detail becomes available.
 */

export type ServicePage = {
  slug: string;
  /** H1 — lead words plain, `accent` words highlighted. */
  h1: { lead: string; accent: string };
  /** <title>, absolute. Keep under ~60 characters. */
  metaTitle: string;
  /** Meta description, ~150 characters. */
  metaDescription: string;
  /** Short label used in navigation, cards and breadcrumbs. */
  label: string;
  /** One-line summary for cards and the services hub. */
  summary: string;
  image: string;
  imageAlt: string;
  intro: string[];
  scope: { title: string; text: string }[];
  whenTitle: string;
  when: string[];
  approach: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
  whatsappMessage: string;
};

export const servicePages: ServicePage[] = [
  {
    slug: "mep-contractor-dubai",
    h1: { lead: "MEP contractor", accent: "in Dubai" },
    metaTitle: "MEP Contractor in Dubai | Mechanical, Electrical & Plumbing",
    metaDescription:
      "Trio Built Gulf is a Dubai MEP contractor for installation, repair and maintenance of mechanical, electrical and plumbing systems in commercial and residential buildings.",
    label: "MEP Contractor",
    summary:
      "Mechanical, electrical and plumbing installation and maintenance, coordinated as one scope.",
    image: "/images/feat-mep.jpg",
    imageAlt:
      "Commercial office interior with exposed ceiling services and ventilation ductwork",
    intro: [
      "MEP — mechanical, electrical and plumbing — is what makes a building work: cooling and ventilation, power and lighting, water supply and drainage. When these trades are handled by separate contractors, clashes in the ceiling void, repeated site visits and gaps in responsibility are common.",
      "Trio Built Gulf Technical Services LLC is a Dubai-based contractor that carries out installation and maintenance across these disciplines. You can appoint us for a single trade, or for a coordinated scope with one point of contact.",
    ],
    scope: [
      {
        title: "Mechanical & HVAC",
        text: "Air-conditioning, ventilation and air-distribution installation, plus ducting works and maintenance.",
      },
      {
        title: "Electrical",
        text: "Electrical fittings and fixtures, lighting, repair and maintenance, and upgrades to existing installations.",
      },
      {
        title: "Plumbing & sanitary",
        text: "Water supply, drainage and sanitary installations, fixture replacement, leak repair and maintenance.",
      },
      {
        title: "Services coordination",
        text: "Sequencing trades so ceilings, partitions and finishes can close without rework.",
      },
      {
        title: "Fit-out support",
        text: "MEP alterations for office, retail and residential fit-out, alongside ceilings and finishes.",
      },
      {
        title: "Planned maintenance",
        text: "Preventive and corrective maintenance for installed systems, including contract-based support.",
      },
    ],
    whenTitle: "When an MEP contractor is the right call",
    when: [
      "You are fitting out or refurbishing a space and need services moved, extended or upgraded.",
      "Several trades are working in the same ceiling or riser and need one party coordinating them.",
      "A building has recurring faults across cooling, power or water and no single party owns the fix.",
      "You want one contractor accountable for installation and later maintenance.",
    ],
    approach: [
      {
        title: "Brief and site visit",
        text: "We review the drawings or requirement and walk the site to understand existing services and access.",
      },
      {
        title: "Scope and quotation",
        text: "A clear scope by trade, with assumptions and exclusions written down.",
      },
      {
        title: "Programme and installation",
        text: "Works are sequenced around other trades and the building's operation.",
      },
      {
        title: "Testing and handover",
        text: "Systems are checked before handover, with support available afterwards.",
      },
    ],
    faqs: [
      {
        q: "Can you take on MEP for a fit-out that another company designed?",
        a: "Yes. We can install and coordinate to supplied drawings and specifications. If the information is incomplete we will flag the gaps in writing before work starts.",
      },
      {
        q: "Do you handle all three trades, or only one?",
        a: "Either. Some clients appoint us for HVAC only, others for the full mechanical, electrical and plumbing scope. The scope is agreed per project.",
      },
      {
        q: "Does MEP work need approvals in Dubai?",
        a: "Many works do, depending on the building, the community and what is being changed. The relevant authority or the building's management usually sets the requirement. We tell you at quotation stage what we expect to be needed.",
      },
      {
        q: "Do you also maintain what you install?",
        a: "Yes. Installation and maintenance are both part of what we do, so the same team can support the system after handover.",
      },
    ],
    related: [
      "hvac-services-dubai",
      "electrical-maintenance-dubai",
      "plumbing-services-dubai",
    ],
    whatsappMessage:
      "Hello Trio Built Gulf, I would like a quote for MEP works in Dubai.",
  },
  {
    slug: "hvac-services-dubai",
    h1: { lead: "HVAC services", accent: "in Dubai" },
    metaTitle: "HVAC Services Dubai | AC Installation, Ducting & Repair",
    metaDescription:
      "HVAC installation, ducting, ventilation and AC repair in Dubai for offices, retail, villas and apartments. Trio Built Gulf supports you from installation to maintenance.",
    label: "HVAC Services",
    summary:
      "Air-conditioning, ventilation and air-distribution installation, repair and maintenance.",
    image: "/images/feat-mep.jpg",
    imageAlt: "Ceiling services and ventilation ductwork in a commercial space",
    intro: [
      "In Dubai, air-conditioning is not a comfort extra — it is a working part of every occupied building for most of the year. A system that is sized, installed and maintained properly keeps spaces comfortable, controls humidity and avoids breakdowns at the hottest time of year.",
      "Trio Built Gulf provides air-conditioning, ventilation and air-filtration installation and repair for commercial, residential and industrial properties across Dubai and the UAE.",
    ],
    scope: [
      {
        title: "HVAC system installation",
        text: "New and replacement air-conditioning and ventilation systems installed to specification.",
      },
      {
        title: "Ducting works",
        text: "Duct installation, modification and air-distribution changes for new layouts and fit-outs.",
      },
      {
        title: "Ventilation & air filtration",
        text: "Fresh-air, extract and filtration works for spaces that need better air quality.",
      },
      {
        title: "AC troubleshooting & repair",
        text: "Diagnosis of poor cooling, noise, leaks and faults, followed by corrective repair.",
      },
      {
        title: "Fit-out alterations",
        text: "Diffuser, ducting and unit relocations when ceilings and partitions change.",
      },
      {
        title: "Maintenance support",
        text: "Preventive and corrective maintenance, including ongoing contract support.",
      },
    ],
    whenTitle: "Signs you need HVAC attention",
    when: [
      "Some rooms stay warm while others are cold, which can point to air-distribution problems.",
      "The system runs constantly but struggles to hold temperature.",
      "You see water leaks, ice build-up, unusual noise or odours from units.",
      "You are changing the layout of an office or retail space and the cooling must follow.",
    ],
    approach: [
      {
        title: "Assess",
        text: "We inspect the system or review the layout and identify the cause or requirement.",
      },
      {
        title: "Propose",
        text: "You receive a clear recommendation — repair, adjust or replace — with the reasoning.",
      },
      {
        title: "Install or repair",
        text: "Works are carried out with attention to access, noise and tenant disruption.",
      },
      {
        title: "Test and support",
        text: "Performance is checked after the work and maintenance can be arranged.",
      },
    ],
    faqs: [
      {
        q: "Do you install HVAC in new fit-outs as well as repair existing units?",
        a: "Both. We install new systems and ducting for fit-outs and refurbishments, and we diagnose and repair existing equipment.",
      },
      {
        q: "Can you work in an occupied office or shop?",
        a: "Yes. We plan works around operating hours where possible. Tell us your constraints when you enquire.",
      },
      {
        q: "Is HVAC installation covered under your trade licence?",
        a: "Air-conditioning, ventilation and air filtration is one of our licensed activities. Licence details are available on request.",
      },
      {
        q: "Do you offer ongoing maintenance after installation?",
        a: "Yes. See our HVAC maintenance page for how preventive and corrective support works.",
      },
    ],
    related: [
      "hvac-maintenance-dubai",
      "false-ceiling-contractor-dubai",
      "mep-contractor-dubai",
    ],
    whatsappMessage:
      "Hello Trio Built Gulf, I would like a quote for HVAC services in Dubai.",
  },
  {
    slug: "hvac-maintenance-dubai",
    h1: { lead: "HVAC maintenance", accent: "in Dubai" },
    metaTitle: "HVAC Maintenance Dubai | AC Servicing & AMC Support",
    metaDescription:
      "Preventive and corrective HVAC maintenance in Dubai. Planned AC servicing and maintenance contracts for offices, retail, residential and industrial buildings.",
    label: "HVAC Maintenance",
    summary:
      "Planned preventive servicing and corrective repair that keeps cooling systems reliable.",
    image: "/images/feat-maintenance.jpg",
    imageAlt: "Technician carrying out maintenance work",
    intro: [
      "Most HVAC failures are not sudden. Dirty filters, blocked drains, worn components and low refrigerant build up over weeks until a unit fails in peak summer. Planned maintenance catches these early, which is usually cheaper and less disruptive than emergency repair.",
      "Trio Built Gulf provides preventive and corrective HVAC maintenance for buildings in Dubai, either as one-off servicing or as a planned maintenance contract.",
    ],
    scope: [
      {
        title: "Preventive maintenance",
        text: "Scheduled inspection, cleaning and checks of air-conditioning units and associated components.",
      },
      {
        title: "Corrective maintenance",
        text: "Fault-finding and repair when a unit or system is not performing.",
      },
      {
        title: "Planned schedules",
        text: "Visit frequencies set around the building's use, size and equipment.",
      },
      {
        title: "Condition reporting",
        text: "Findings recorded so you can see what was done and what needs attention.",
      },
      {
        title: "Annual maintenance contracts",
        text: "A defined scope and visit plan for a fixed term, agreed up front.",
      },
      {
        title: "Related building services",
        text: "Electrical and plumbing maintenance can be combined into the same arrangement.",
      },
    ],
    whenTitle: "Why planned HVAC maintenance pays off",
    when: [
      "Fewer breakdowns during the hottest months, when failures cost most.",
      "Better cooling performance and more consistent comfort for occupants.",
      "Faults found early, while they are still small repairs.",
      "A clear record of servicing for landlords, tenants and facilities teams.",
    ],
    approach: [
      {
        title: "Survey",
        text: "We list the equipment, check its condition and note access and operating hours.",
      },
      {
        title: "Plan",
        text: "A maintenance scope and visit schedule are agreed with you in writing.",
      },
      {
        title: "Service",
        text: "Scheduled visits are carried out and recorded.",
      },
      {
        title: "Review",
        text: "Recurring issues are flagged with recommendations, not left to repeat.",
      },
    ],
    faqs: [
      {
        q: "How often should AC units be serviced?",
        a: "It depends on the equipment, how heavily it runs and the environment. Commercial spaces are commonly serviced on a quarterly or twice-yearly cycle. We recommend a frequency after seeing the installation.",
      },
      {
        q: "What is the difference between preventive and corrective maintenance?",
        a: "Preventive maintenance is scheduled work to stop faults developing. Corrective maintenance is repair after something has failed or is underperforming.",
      },
      {
        q: "Can I get maintenance for HVAC, electrical and plumbing together?",
        a: "Yes. Combining them under one arrangement means one party to call and a single maintenance plan for the building.",
      },
      {
        q: "Do you maintain systems you did not install?",
        a: "Yes, after a survey of the existing equipment so the scope is accurate.",
      },
    ],
    related: [
      "hvac-services-dubai",
      "building-maintenance-dubai",
      "electrical-maintenance-dubai",
    ],
    whatsappMessage:
      "Hello Trio Built Gulf, I would like to discuss HVAC maintenance in Dubai.",
  },
  {
    slug: "electrical-maintenance-dubai",
    h1: { lead: "Electrical maintenance", accent: "in Dubai" },
    metaTitle: "Electrical Maintenance Dubai | Repair, Fittings & Upgrades",
    metaDescription:
      "Electrical maintenance, repair and fittings in Dubai for homes, offices and retail. Lighting, power points, fixtures and upgrades handled by Trio Built Gulf.",
    label: "Electrical Maintenance",
    summary:
      "Electrical fittings, fixtures, repair and maintenance for commercial and residential properties.",
    image: "/images/proj-facilities.jpg",
    imageAlt: "Interior corridor with lighting and electrical fittings",
    intro: [
      "Electrical faults are rarely something to defer. Tripping circuits, flickering lights, failed fittings and ageing installations affect safety as well as convenience. Regular maintenance and prompt repair keep a building safe and its occupants working.",
      "Trio Built Gulf carries out electrical fittings and fixtures work, repair and maintenance for commercial, residential and industrial properties in Dubai.",
    ],
    scope: [
      {
        title: "Fittings & fixtures",
        text: "Supply and installation of lights, switches, sockets and other fixtures.",
      },
      {
        title: "Lighting solutions",
        text: "New lighting and replacement or upgrade of existing lighting layouts.",
      },
      {
        title: "Repair & fault-finding",
        text: "Tracing and fixing faults including tripping, failed circuits and damaged fittings.",
      },
      {
        title: "Power distribution works",
        text: "Additions and modifications to distribution to suit new layouts and loads.",
      },
      {
        title: "Upgrades",
        text: "Bringing older installations up to a condition suitable for current use.",
      },
      {
        title: "Planned maintenance",
        text: "Scheduled checks and upkeep, alone or alongside other building services.",
      },
    ],
    whenTitle: "When to call an electrical contractor",
    when: [
      "Circuits trip repeatedly or fittings fail more often than they should.",
      "You are refurbishing and need lighting and power points moved or added.",
      "A space has changed use and the electrical layout no longer suits it.",
      "You want a regular check-up on a commercial or residential building.",
    ],
    approach: [
      {
        title: "Inspect",
        text: "We look at the installation and the fault or requirement.",
      },
      {
        title: "Quote",
        text: "Scope and materials are set out clearly, with exclusions stated.",
      },
      {
        title: "Carry out",
        text: "Works are done with attention to safe isolation and tidy completion.",
      },
      {
        title: "Test and hand over",
        text: "The installation is checked and left safe and working.",
      },
    ],
    faqs: [
      {
        q: "Do you do residential electrical work as well as commercial?",
        a: "Yes, for villas, apartments, offices, retail units and industrial premises.",
      },
      {
        q: "Are approvals needed for electrical changes in Dubai?",
        a: "Some changes — particularly to supply, load or distribution — need approval from the relevant authority or building management. We advise on this when we quote.",
      },
      {
        q: "Can you handle a one-off repair, or only contracts?",
        a: "Both. One-off repairs, installations and ongoing maintenance are all available.",
      },
      {
        q: "Can you coordinate electrical work with other trades?",
        a: "Yes. We regularly coordinate with ceilings, HVAC and finishing so lighting and power are ready when ceilings close.",
      },
    ],
    related: [
      "mep-contractor-dubai",
      "building-maintenance-dubai",
      "false-ceiling-contractor-dubai",
    ],
    whatsappMessage:
      "Hello Trio Built Gulf, I need electrical maintenance or repair in Dubai.",
  },
  {
    slug: "plumbing-services-dubai",
    h1: { lead: "Plumbing services", accent: "in Dubai" },
    metaTitle: "Plumbing Services Dubai | Repairs, Sanitary & Installation",
    metaDescription:
      "Plumbing and sanitary installation, leak repair and maintenance in Dubai for villas, apartments, offices and retail. Trio Built Gulf, a Dubai technical services company.",
    label: "Plumbing Services",
    summary:
      "Plumbing and sanitary installations, repairs and maintenance for homes and commercial buildings.",
    image: "/images/proj-maintenance.jpg",
    imageAlt: "Tap and plumbing fitting",
    intro: [
      "A small leak, a slow drain or a failing fixture rarely stays small. Water damage reaches ceilings, finishes and neighbouring units quickly, so plumbing problems are best fixed early and properly.",
      "Trio Built Gulf provides plumbing and sanitary installations, repairs and maintenance for residential, commercial and industrial buildings across Dubai.",
    ],
    scope: [
      {
        title: "Sanitary installations",
        text: "Supply and installation of basins, WCs, showers, taps and associated fittings.",
      },
      {
        title: "Water supply works",
        text: "Pipework installation, modification and replacement.",
      },
      {
        title: "Drainage",
        text: "Drainage installation and repair, including blockages and slow drains.",
      },
      {
        title: "Leak repair",
        text: "Locating and repairing leaks, with the area made good where our scope covers it.",
      },
      {
        title: "Fit-out plumbing",
        text: "Plumbing for new kitchens, pantries, washrooms and wet areas.",
      },
      {
        title: "Planned maintenance",
        text: "Regular checks for buildings, alone or combined with other building services.",
      },
    ],
    whenTitle: "When to call a plumbing contractor",
    when: [
      "You have a leak, damp patch or water stain you cannot trace.",
      "Drains are slow or blocked repeatedly.",
      "You are renovating a bathroom, pantry or kitchen and need plumbing moved.",
      "You want a regular plumbing check on a building you manage.",
    ],
    approach: [
      {
        title: "Diagnose",
        text: "We find the source of the problem before proposing the fix.",
      },
      {
        title: "Agree the work",
        text: "Scope and responsibilities for making good are made clear up front.",
      },
      {
        title: "Repair or install",
        text: "Works are completed with care for finishes and occupants.",
      },
      {
        title: "Check",
        text: "The system is tested before we leave.",
      },
    ],
    faqs: [
      {
        q: "Do you repair leaks inside walls and ceilings?",
        a: "Yes. We trace and repair the leak. Making good finishes such as paint or tiles can be included in the scope when you ask.",
      },
      {
        q: "Can you handle plumbing for a full bathroom renovation?",
        a: "Yes. We install plumbing and sanitary fittings, and we can coordinate with tiling, plaster and carpentry.",
      },
      {
        q: "Do you work in residential villas and apartments?",
        a: "Yes, as well as offices, retail and industrial premises.",
      },
      {
        q: "Is plumbing covered by your trade licence?",
        a: "Plumbing and sanitary installations are one of our licensed activities. Licence details are available on request.",
      },
    ],
    related: [
      "building-maintenance-dubai",
      "mep-contractor-dubai",
      "interior-fit-out-dubai",
    ],
    whatsappMessage:
      "Hello Trio Built Gulf, I need plumbing services in Dubai.",
  },
  {
    slug: "interior-fit-out-dubai",
    h1: { lead: "Interior fit-out", accent: "in Dubai" },
    metaTitle: "Interior Fit-Out Dubai | Offices, Retail & Residential",
    metaDescription:
      "Interior fit-out in Dubai for offices, retail, hospitality and villas. Ceilings, partitions, painting, flooring, carpentry and MEP from one contractor.",
    label: "Interior Fit-Out",
    summary:
      "Interior finishing for offices, retail, hospitality and residential spaces, with MEP coordinated in.",
    image: "/images/feat-interior.jpg",
    imageAlt: "Finished residential interior with timber wall panel and open-plan living space",
    intro: [
      "A fit-out succeeds or fails on coordination. Ceilings cannot close until services are in; flooring cannot go down while painting is under way; and every delay moves the opening or move-in date.",
      "Trio Built Gulf delivers interior finishing works — and the technical services behind them — for offices, retail units, hospitality spaces and residential properties in Dubai.",
    ],
    scope: [
      {
        title: "False ceilings & partitions",
        text: "Suspended ceiling systems and light partitioning installed to line and level.",
      },
      {
        title: "Painting & plaster",
        text: "Plaster works and painting to a durable, clean finish.",
      },
      {
        title: "Flooring & tiling",
        text: "Floor and wall tiling and wood flooring works.",
      },
      {
        title: "Carpentry & joinery",
        text: "Carpentry for doors, cabinetry, panelling and built-in elements.",
      },
      {
        title: "Glass & aluminium",
        text: "Glass partitions, doors and aluminium works.",
      },
      {
        title: "MEP integration",
        text: "HVAC, lighting and plumbing changes carried out with the fit-out, not around it.",
      },
    ],
    whenTitle: "What a well-run fit-out depends on",
    when: [
      "A clear scope by trade before work begins.",
      "A programme that sequences services, ceilings and finishes sensibly.",
      "Approvals and building-management requirements identified early.",
      "One contractor accountable for the finished space.",
    ],
    approach: [
      {
        title: "Brief and survey",
        text: "We review your drawings or requirement and visit the premises.",
      },
      {
        title: "Quotation",
        text: "Scope, inclusions and exclusions are set out trade by trade.",
      },
      {
        title: "Programme and works",
        text: "Trades are sequenced so the space progresses without rework.",
      },
      {
        title: "Inspection and handover",
        text: "Workmanship is checked and snagging closed before handover.",
      },
    ],
    faqs: [
      {
        q: "Do you do the design, or only the build?",
        a: "We carry out the works. Where you have a designer or consultant we build to their drawings; we do not claim a design service we have not agreed with you.",
      },
      {
        q: "Can you fit out an occupied building?",
        a: "Yes, with the working hours and access arrangements your building management requires.",
      },
      {
        q: "Does a fit-out in Dubai need approvals?",
        a: "Usually the landlord, developer or building management must approve the scope, and some works need authority approval. We help you understand the requirement for your premises.",
      },
      {
        q: "Can I appoint you for one trade only?",
        a: "Yes. Ceilings, painting, flooring or MEP can each be a standalone scope.",
      },
    ],
    related: [
      "false-ceiling-contractor-dubai",
      "glass-aluminium-works-dubai",
      "mep-contractor-dubai",
    ],
    whatsappMessage:
      "Hello Trio Built Gulf, I would like a quote for interior fit-out in Dubai.",
  },
  {
    slug: "false-ceiling-contractor-dubai",
    h1: { lead: "False ceiling contractor", accent: "in Dubai" },
    metaTitle: "False Ceiling Contractor Dubai | Gypsum & Partition Works",
    metaDescription:
      "False ceiling and light partition installation in Dubai. Suspended gypsum ceilings, partitions and lighting coordination for offices, retail, villas and apartments.",
    label: "False Ceiling Contractor",
    summary:
      "Suspended ceiling systems and light partitions installed to line, level and specification.",
    image: "/images/proj-facilities.jpg",
    imageAlt: "Modern interior with a lined ceiling and partitions",
    intro: [
      "A false ceiling does more than hide services. It sets the lighting layout, affects acoustics, creates access to ductwork and wiring, and defines how a room feels. Done poorly, it shows: uneven lines, sagging boards, cracks at joints and lights that do not align.",
      "Trio Built Gulf installs false ceilings and light partitions for offices, retail spaces, hospitality areas and homes in Dubai, coordinated with the HVAC, electrical and lighting that sit above them.",
    ],
    scope: [
      {
        title: "Suspended ceilings",
        text: "Framed and boarded ceiling systems installed to line and level.",
      },
      {
        title: "Light partitions",
        text: "Lightweight partition walls for dividing offices, rooms and retail units.",
      },
      {
        title: "Services coordination",
        text: "Openings and access panels planned with HVAC and electrical so nothing is cut in later.",
      },
      {
        title: "Lighting integration",
        text: "Ceiling layouts that take downlights and fittings cleanly.",
      },
      {
        title: "Repair & alteration",
        text: "Repair of damaged ceilings and changes to existing layouts.",
      },
      {
        title: "Finishing",
        text: "Jointing, plaster and painting to leave a finished surface.",
      },
    ],
    whenTitle: "What to settle before a ceiling goes up",
    when: [
      "Where HVAC diffusers, lights and sprinklers sit, and who is responsible for each opening.",
      "Where access panels are needed for future maintenance.",
      "The ceiling height and any drops or bulkheads in the design.",
      "The finish specification — paint, plaster and any special treatments.",
    ],
    approach: [
      {
        title: "Review layout",
        text: "We check the ceiling plan against services and lighting.",
      },
      {
        title: "Set out",
        text: "Levels and lines are marked before framing begins.",
      },
      {
        title: "Install",
        text: "Framing, boarding and openings are completed in sequence with services.",
      },
      {
        title: "Finish",
        text: "Joints are finished and the surface is prepared for painting.",
      },
    ],
    faqs: [
      {
        q: "Can you install a false ceiling around existing HVAC and lighting?",
        a: "Yes. We plan openings and access with the installed services and coordinate with the trades involved.",
      },
      {
        q: "Do you do partitions as well as ceilings?",
        a: "Yes, light partitions are part of the same licensed activity.",
      },
      {
        q: "Can you repair a damaged or stained ceiling?",
        a: "Yes. We repair the ceiling and finish it. Where a stain comes from a leak, we recommend fixing the leak first.",
      },
      {
        q: "Will painting be included?",
        a: "It can be. Tell us whether you want ceilings supplied and finished, or ready for another painter.",
      },
    ],
    related: [
      "interior-fit-out-dubai",
      "hvac-services-dubai",
      "electrical-maintenance-dubai",
    ],
    whatsappMessage:
      "Hello Trio Built Gulf, I would like a quote for a false ceiling in Dubai.",
  },
  {
    slug: "glass-aluminium-works-dubai",
    h1: { lead: "Glass & aluminium works", accent: "in Dubai" },
    metaTitle: "Glass & Aluminium Works Dubai | Doors, Windows, Partitions",
    metaDescription:
      "Glass and aluminium installation and maintenance in Dubai: partitions, doors, windows and shopfronts for offices, retail and residential buildings.",
    label: "Glass & Aluminium",
    summary:
      "Installation and maintenance of glass and aluminium doors, windows, partitions and shopfronts.",
    image: "/images/proj-commercial.jpg",
    imageAlt: "Contemporary building with a glass and metal panel facade",
    intro: [
      "Glass and aluminium shape how a building looks and how it performs: daylight, privacy, security, sound and weather resistance all depend on how they are specified and installed.",
      "Trio Built Gulf carries out glass and aluminium installation and maintenance for offices, retail units, hospitality spaces and homes in Dubai.",
    ],
    scope: [
      {
        title: "Glass partitions",
        text: "Office and meeting-room partitions that bring in light and keep spaces defined.",
      },
      {
        title: "Doors & windows",
        text: "Aluminium and glass doors and windows, installed and adjusted.",
      },
      {
        title: "Shopfronts",
        text: "Storefront glazing and entrances for retail units.",
      },
      {
        title: "Repair & replacement",
        text: "Replacement of broken glass and repair of frames, hardware and seals.",
      },
      {
        title: "Sealing & weatherproofing",
        text: "Sealant renewal and checks to reduce leaks and drafts.",
      },
      {
        title: "Planned maintenance",
        text: "Periodic checks for buildings with significant glazing.",
      },
    ],
    whenTitle: "When glass and aluminium work is needed",
    when: [
      "You are fitting out an office and want glass partitions and doors.",
      "A shopfront is being refurbished or replaced.",
      "Doors and windows no longer close properly or let in water and noise.",
      "Glass or hardware has been damaged and needs replacing.",
    ],
    approach: [
      {
        title: "Survey and measure",
        text: "Accurate measurements and site conditions are recorded.",
      },
      {
        title: "Specify",
        text: "We agree the glass type, frame finish and hardware with you.",
      },
      {
        title: "Install",
        text: "Installation is carried out with protection for surrounding finishes.",
      },
      {
        title: "Check",
        text: "Operation, alignment and sealing are checked before handover.",
      },
    ],
    faqs: [
      {
        q: "Do you supply and install, or install only?",
        a: "Either can be agreed for the project. Tell us what you already have and we will scope accordingly.",
      },
      {
        q: "Can you replace a broken pane or faulty door hardware?",
        a: "Yes. Repair and replacement are part of our glass and aluminium maintenance work.",
      },
      {
        q: "Can glass partitions be coordinated with a fit-out?",
        a: "Yes. We coordinate with ceilings, flooring and electrical so partitions go in at the right point in the programme.",
      },
      {
        q: "Is this covered by your trade licence?",
        a: "Glass and aluminium installation and maintenance is one of our licensed activities. Licence details are available on request.",
      },
    ],
    related: [
      "interior-fit-out-dubai",
      "false-ceiling-contractor-dubai",
      "building-maintenance-dubai",
    ],
    whatsappMessage:
      "Hello Trio Built Gulf, I would like a quote for glass and aluminium works in Dubai.",
  },
  {
    slug: "building-maintenance-dubai",
    h1: { lead: "Building maintenance", accent: "in Dubai" },
    metaTitle: "Building Maintenance Dubai | AMC & Technical Services",
    metaDescription:
      "Building maintenance and annual maintenance contracts in Dubai: HVAC, electrical, plumbing and general technical services for commercial and residential properties.",
    label: "Building Maintenance",
    summary:
      "Preventive and corrective maintenance across HVAC, electrical, plumbing and building fabric.",
    image: "/images/proj-facilities.jpg",
    imageAlt: "Interior corridor of a maintained commercial building",
    intro: [
      "Buildings degrade quietly. Filters clog, seals fail, fittings loosen and small leaks spread. A planned approach to maintenance protects the asset, reduces emergency call-outs and keeps occupants comfortable.",
      "Trio Built Gulf provides building maintenance and technical services in Dubai: HVAC, electrical, plumbing, ceilings, glass and finishing repairs, with one team to call.",
    ],
    scope: [
      {
        title: "HVAC maintenance",
        text: "Scheduled servicing and repair of air-conditioning and ventilation.",
      },
      {
        title: "Electrical maintenance",
        text: "Fittings, fixtures, lighting and fault repair.",
      },
      {
        title: "Plumbing maintenance",
        text: "Leak repair, fixture replacement and drainage checks.",
      },
      {
        title: "Building fabric",
        text: "Repairs to ceilings, partitions, painting, tiling, glass and aluminium.",
      },
      {
        title: "Planned maintenance schedules",
        text: "Recurring visits set out in a plan you can see and review.",
      },
      {
        title: "Annual maintenance contracts",
        text: "A defined scope for a fixed term, covering the services you choose.",
      },
    ],
    whenTitle: "Who benefits from a maintenance contract",
    when: [
      "Property managers and facilities teams who want one contractor for several trades.",
      "Owners of offices, retail units and villas who prefer planned costs to surprise repairs.",
      "Tenants responsible for maintaining their fit-out.",
      "Anyone tired of chasing a different contractor for each fault.",
    ],
    approach: [
      {
        title: "Walk the property",
        text: "We survey the building and list the systems that need support.",
      },
      {
        title: "Define the scope",
        text: "You choose the trades and visit frequency; inclusions and exclusions are written down.",
      },
      {
        title: "Deliver",
        text: "Planned visits and call-outs are carried out and recorded.",
      },
      {
        title: "Review",
        text: "We highlight repeated faults and recommend lasting fixes.",
      },
    ],
    faqs: [
      {
        q: "What does an annual maintenance contract (AMC) cover?",
        a: "Whatever is agreed in writing. Typically that is scheduled preventive visits for chosen systems plus a process for corrective call-outs. We set the scope with you after surveying the property.",
      },
      {
        q: "Can you maintain a property that is mainly leased to tenants?",
        a: "Yes. Tell us who is responsible for what and we will define the scope accordingly.",
      },
      {
        q: "Do you handle emergency repairs?",
        a: "Contact us with the problem and we will respond as quickly as practicable. We do not publish response-time guarantees until they are part of an agreed contract.",
      },
      {
        q: "Can maintenance be added to a fit-out we did with you?",
        a: "Yes. The same team that installed the works can maintain them after handover.",
      },
    ],
    related: [
      "hvac-maintenance-dubai",
      "electrical-maintenance-dubai",
      "plumbing-services-dubai",
    ],
    whatsappMessage:
      "Hello Trio Built Gulf, I would like to discuss building maintenance in Dubai.",
  },
];

export const servicePageBySlug = (slug: string) =>
  servicePages.find((p) => p.slug === slug);
