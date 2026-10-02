import type { SiteContent } from "../lib/types";

const weekday = (day: string) => ({
  day,
  closed: false,
  slots: [
    { from: "07:30", to: "12:00" },
    { from: "13:30", to: "17:30" },
  ],
});

/** Inhalte der bisherigen Website (Jimdo), 1:1 übernommen. Dient als Fallback und als Migrationsquelle. */
export const seed: SiteContent = {
  company: {
    name: "Dorfgarage Rennhard GmbH",
    street: "Werkstrasse 6",
    zip: "5608",
    city: "Stetten AG",
    phone: "056 496 52 26",
    email: "info@dorfgarage-rennhard.ch",
    uid: "CHE-315.483.005",
    owner: "Marco Rennhard",
    ownerRole: "Geschäftsleiter",
    mapsQuery: "Werkstrasse 6, 5608 Stetten AG",
    tagline: "Persönlich – kompetent – fair. Ihre Autogarage für alle Marken.",
  },
  hours: {
    weekly: [
      weekday("Montag"),
      weekday("Dienstag"),
      weekday("Mittwoch"),
      weekday("Donnerstag"),
      weekday("Freitag"),
      { day: "Samstag", closed: true, slots: [] },
      { day: "Sonntag", closed: true, slots: [] },
    ],
    exceptions: [],
  },
  pages: {
    home: {
      eyebrow: "Autogarage in Stetten AG",
      headline: "Dein Partner für alle Automarken in der Region.",
      lead: "Wir erledigen für dein Auto anstehende Wartungsarbeiten sowie sämtliche Reparaturarbeiten, und das zu günstigen Preisen!",
      body: "Bei uns ist dein Auto in guten Händen.",
      image: "/img/garage.jpg",
    },
    offer: {
      headline: "Unser Angebot",
      intro:
        "Dein kompetenter Servicepartner rund um Dein Fahrzeug. In unserer Werkstatt in Stetten werden alle Arbeiten „rund ums Auto“ von gut ausgebildeten Mitarbeitern fachmännisch und mit grösster Sorgfalt ausgeführt.",
      outro: "Wir arbeiten mit hohen Qualitätsanforderungen zu günstigen Preisen und empfehlen uns für folgende Dienstleistungen:",
    },
    about: {
      headline: "Wir – die Dorfgarage Rennhard GmbH",
      intro:
        "Wir bieten unseren Kunden besten Service zu immer fairen Preisen. Dank qualifizierten Mitarbeitern und der neusten Technik können wir jederzeit schnellsten Ersatzteilservice und professionelle Dienstleistungen wie Wartung und Reparaturen Deines Fahrzeugs garantieren.",
      image: "/img/garage.jpg",
    },
    vehicles: {
      headline: "Occasionen",
      emptyText:
        "Zurzeit haben wir keine Occasionen. Gerne können Sie uns Ihren Wunsch äussern und wir finden Ihr Traumauto für Sie.",
    },
    contact: {
      headline: "Schreiben Sie uns …",
      intro: "Persönlich – kompetent – fair. Ihre Autogarage für alle Marken.",
    },
  },
  services: [
    "Service und Reparaturen aller Marken",
    "Elektronik-Diagnose",
    "Klimaservice und Klimadesinfektion",
    "Bremsrevisionen",
    "Abgaswartung",
    "MFK Bereitstellung und MFK Vorführung",
    "Frontscheibe ersetzen",
    "Pneu Service mit Reifen- / Radeinlagerung",
    "Unfallinstandsetzung",
    "Fahrzeugaufbereitung aussen und innen",
    "Tuning und Zubehör",
  ].map((title, i) => ({ id: `s${i + 1}`, title, description: "", order: i + 1, visible: true })),
  team: [
    { id: "t1", name: "Marco Rennhard", role: "Inhaber, Automobilfachmann EFZ", photo: "/img/team1.jpg", order: 1, visible: true },
    { id: "t2", name: "Tiffany Rennhard", role: "Administration und Kundenbetreuung", photo: "/img/team2.jpg", order: 2, visible: true },
    { id: "t3", name: "Mia", role: "Sicherheitsbeauftragte", photo: "/img/team3.jpg", order: 3, visible: true },
  ],
  vehicles: [],
  legal: {
    imprint: {
      title: "Impressum",
      body: "Inhaber der Webseite / Herausgeber / verantwortlich für Inhalt / Autor / Kontakt\nDorfgarage Rennhard GmbH, Werkstrasse 6, 5608 Stetten AG / Schweiz, Tel. 056 496 52 26\n\nVertretungsberechtigte Person\nMarco Rennhard, Geschäftsleiter\n\nHandelsregistereintrag\nUID: CHE-315.483.005",
    },
    privacy: {
      title: "Datenschutz",
      body: "PLATZHALTER – Bitte den Volltext der bisherigen Datenschutzerklärung hier einfügen (Admin → Rechtliches).\n\nKontaktformular: Die im Formular eingegebenen Daten (Name, Kontaktangaben, Nachricht) werden ausschliesslich zur Bearbeitung Ihrer Anfrage verwendet und nicht an Dritte weitergegeben.\n\nGoogle Maps: Die Karte wird erst nach Ihrer ausdrücklichen Zustimmung von Google geladen. Dabei werden Daten (z. B. IP-Adresse) an Google übermittelt.",
    },
    cookies: {
      title: "Cookie-Richtlinie",
      body: "Diese Website setzt selbst keine Tracking-Cookies. Die Einwilligung zum Laden von Google Maps wird lokal in Ihrem Browser gespeichert und kann jederzeit über den Link «Karte laden» bzw. durch Löschen der Websitedaten widerrufen werden.",
    },
    credits:
      "Bilder: Fotos Dorfgarage Rennhard GmbH. Die bisher verwendeten Adobe-Stock-Bilder (#210270056, #35580903, #122888420, #95846352, #138853595) sind hier nicht eingebunden.",
  },
};
