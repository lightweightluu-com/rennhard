import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/Button";
import { Reveal } from "../../components/ui/Reveal";
import { useContent } from "../../lib/content";
import { groupedHours } from "../../lib/hours";
import { OpenBadge } from "./Layout";

export function PageHead({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <section className="container-x pb-14 pt-16 md:pb-20 md:pt-24">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="display mt-4 max-w-[18ch]">{title}</h1>
      {lead && <p className="mt-8 max-w-[56ch] text-xl text-muted">{lead}</p>}
    </section>
  );
}

export function ServiceList({ limit }: { limit?: number }) {
  const { content } = useContent();
  const items = content.services.filter((s) => s.visible).slice(0, limit);
  return (
    <ol className="list-none">
      {items.map((s, i) => (
        <Reveal as="li" key={s.id} delay={Math.min(i, 5) * 40} className="row">
          <span className="num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3 className="text-xl font-medium tracking-tight md:text-2xl">{s.title}</h3>
            {s.description && <p className="mt-1 max-w-[60ch] text-muted">{s.description}</p>}
          </div>
          <span className="tick" aria-hidden="true">→</span>
        </Reveal>
      ))}
    </ol>
  );
}

/** Drei Fakten auf einen Blick: Zeiten, Adresse, Telefon. */
export function InfoStrip() {
  const { content } = useContent();
  const { company, hours } = content;
  return (
    <section className="container-x" aria-label="Kontakt und Öffnungszeiten">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        <div className="bg-paper p-7 md:p-9">
          <h2 className="eyebrow">Öffnungszeiten</h2>
          <div className="mt-5 space-y-3">
            {groupedHours(hours).map((g) => (
              <p key={g.label}>
                <span className="block font-semibold">{g.label}</span>
                <span className="text-muted">{g.text}</span>
              </p>
            ))}
          </div>
          <div className="mt-6"><OpenBadge /></div>
        </div>
        <div className="bg-paper p-7 md:p-9">
          <h2 className="eyebrow">Werkstatt</h2>
          <address className="mt-5 not-italic leading-relaxed">
            {company.street}
            <br />
            {company.zip} {company.city}
          </address>
          <p className="mt-6">
            <Link className="link font-semibold" to="/kontakt#karte">Anfahrt &amp; Karte →</Link>
          </p>
        </div>
        <div className="bg-paper p-7 md:p-9">
          <h2 className="eyebrow">Direkt erreichbar</h2>
          <p className="mt-5">
            <a className="text-3xl font-semibold tracking-tight link" href={`tel:${company.phone.replace(/\s/g, "")}`}>{company.phone}</a>
          </p>
          <p className="mt-3">
            <a className="link text-muted" href={`mailto:${company.email}`}>{company.email}</a>
          </p>
        </div>
      </div>
    </section>
  );
}

const MAP_KEY = "dg-maps-consent";
/** Google Maps wird erst nach Klick geladen (Datenschutz). */
export function MapEmbed() {
  const { content } = useContent();
  const [ok, setOk] = useState(() => {
    try { return localStorage.getItem(MAP_KEY) === "1"; } catch { return false; }
  });
  const q = encodeURIComponent(content.company.mapsQuery);
  const allow = () => {
    setOk(true);
    try { localStorage.setItem(MAP_KEY, "1"); } catch { /* privater Modus */ }
  };
  return (
    <div id="karte" className={`relative overflow-hidden rounded-2xl border border-line bg-paper-2 ${ok ? "aspect-[4/3] md:aspect-[16/7]" : "min-h-[22rem]"}`}>
      {ok ? (
        <iframe
          title={`Karte: ${content.company.mapsQuery}`}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${q}&output=embed`}
        />
      ) : (
        <div className="grid h-full min-h-[22rem] place-items-center p-6 text-center">
          <div className="max-w-md">
            <p className="text-lg font-semibold">{content.company.street}, {content.company.zip} {content.company.city}</p>
            <p className="mt-2 text-muted">
              Die Karte wird von Google bereitgestellt. Beim Laden werden Daten an Google übermittelt –
              siehe <Link className="link text-ink" to="/datenschutz">Datenschutz</Link>.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={allow} small>Karte laden</Button>
              <Button variant="ghost" small href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">In Google Maps öffnen</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CtaBand() {
  const { content } = useContent();
  return (
    <section className="container-x mt-32">
      <div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-paper-2 p-8 md:flex-row md:items-center md:p-14">
        <h2 className="h2 max-w-[16ch]">Fragen zu deinem Auto? <span className="serif-i text-accent-ink">Ruf einfach an.</span></h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="accent" href={`tel:${content.company.phone.replace(/\s/g, "")}`}>{content.company.phone}</Button>
          <Button variant="ghost" to="/kontakt">Nachricht schreiben</Button>
        </div>
      </div>
    </section>
  );
}
