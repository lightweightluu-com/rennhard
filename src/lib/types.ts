export interface Company {
  name: string;
  street: string;
  zip: string;
  city: string;
  phone: string;
  email: string;
  uid: string;
  owner: string;
  ownerRole: string;
  mapsQuery: string;
  tagline: string;
}

export interface DayHours {
  day: string;
  closed: boolean;
  slots: { from: string; to: string }[];
}
export interface HoursException {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
}
export interface Hours {
  weekly: DayHours[];
  exceptions: HoursException[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  order: number;
  visible: boolean;
}
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  order: number;
  visible: boolean;
}
export interface Vehicle {
  id: string;
  title: string;
  year: string;
  km: string;
  priceCHF: string;
  description: string;
  image: string;
  order: number;
  visible: boolean;
}

export interface Pages {
  home: { eyebrow: string; headline: string; lead: string; body: string; image: string };
  offer: { headline: string; intro: string; outro: string };
  about: { headline: string; intro: string; image: string };
  vehicles: { headline: string; emptyText: string };
  contact: { headline: string; intro: string };
}
export interface LegalDoc {
  title: string;
  body: string;
}
export interface Legal {
  imprint: LegalDoc;
  privacy: LegalDoc;
  cookies: LegalDoc;
  credits: string;
}

export interface SiteContent {
  company: Company;
  hours: Hours;
  pages: Pages;
  legal: Legal;
  services: Service[];
  team: TeamMember[];
  vehicles: Vehicle[];
}

export interface ContactMessage {
  name: string;
  company?: string;
  phone?: string;
  email: string;
  message: string;
}
