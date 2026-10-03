/** The slice of company contact data that client components need (serialisable). */
export type SiteContact = {
  city: string;
  country: string;
  location: string;
  email: string;
  phone: { label: string; href: string; whatsapp: string };
};
