import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import { Button } from "../../components/ui/Button";
import { Reveal } from "../../components/ui/Reveal";
import { useContent } from "../../lib/content";
import { firebaseEnabled } from "../../lib/firebase";
import { CtaBand, InfoStrip, MapEmbed, PageHead, ServiceList } from "./Sections";

export function Home() {
  const { content } = useContent();
  const { home } = content.pages;
  const team = content.team.filter((t) => t.visible);
  return (
    <>
      <section className="container-x pb-16 pt-14 md:pb-24 md:pt-24">
        <p className="eyebrow">{home.eyebrow}</p>
        <h1 className="display mt-5 max-w-[16ch]">{home.headline}</h1>
        <div className="mt-10 grid items-end gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="max-w-[48ch] text-xl text-muted">{home.lead}</p>
            <p className="serif-i mt-6 text-3xl text-accent-ink">{home.body}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="accent" to="/kontakt">Anfrage senden</Button>
              <Button variant="ghost" to="/angebot">Unser Angebot</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x mb-20" aria-label="Foto der Werkstatt">
        <Reveal>
          <img
            src={home.image}
            alt="Werkstattgebäude der Dorfgarage Rennhard in Stetten mit Firmenschild"
            width={1200}
            height={800}
            fetchPriority="high"
            className="aspect-[4/3] w-full rounded-2xl object-cover md:aspect-[21/9]"
          />
        </Reveal>
      </section>

      <InfoStrip />

      <section className="container-x mt-32 grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-20">
        <div>
          <p className="eyebrow">Leistungen</p>
          <h2 className="h2 mt-4">Alles rund ums Auto.</h2>
          <p className="mt-6 text-muted">Für alle Marken – sorgfältig, termintreu und zu fairen Preisen.</p>
          <p className="mt-8"><Button variant="ghost" to="/angebot" small>Alle Leistungen</Button></p>
        </div>
        <ServiceList limit={6} />
      </section>

      <section className="container-x mt-32">
        <p className="eyebrow">Team</p>
        <h2 className="h2 mt-4 max-w-[14ch]">Persönlich, weil wir wenige sind.</h2>
        <TeamGrid items={team} />
      </section>

      <CtaBand />
    </>
  );
}

function TeamGrid({ items }: { items: { id: string; name: string; role: string; photo: string }[] }) {
  return (
    <ul className="mt-12 grid list-none gap-8 sm:grid-cols-2 md:grid-cols-3">
      {items.map((m, i) => (
        <Reveal as="li" key={m.id} delay={i * 80}>
          <figure className="group">
            <div className="overflow-hidden rounded-2xl bg-ink">
              <img src={m.photo} alt={`Porträt ${m.name}`} loading="lazy" width={800} height={505}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-out-soft)] group-hover:scale-[1.04]" />
            </div>
            <figcaption className="mt-4">
              <span className="block text-xl font-semibold tracking-tight">{m.name}</span>
              <span className="text-muted">{m.role}</span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </ul>
  );
}

export function Offer() {
  const { offer } = useContent().content.pages;
  return (
    <>
      <PageHead eyebrow="Angebot" title={offer.headline} lead={offer.intro} />
      <section className="container-x grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-20">
        <p className="max-w-[34ch] text-lg text-muted">{offer.outro}</p>
        <ServiceList />
      </section>
      <CtaBand />
    </>
  );
}

export function About() {
  const { content } = useContent();
  const { about } = content.pages;
  return (
    <>
      <PageHead eyebrow="Über uns" title={about.headline} lead={about.intro} />
      <section className="container-x">
        <TeamGrid items={content.team.filter((t) => t.visible)} />
      </section>
      <section className="container-x mt-24">
        <Reveal>
          <img src={about.image} alt="Die Werkstatt in Stetten" loading="lazy" width={1200} height={800}
            className="aspect-[4/3] w-full rounded-2xl object-cover md:aspect-[21/9]" />
        </Reveal>
      </section>
      <CtaBand />
    </>
  );
}

export function Vehicles() {
  const { content } = useContent();
  const { vehicles: page } = content.pages;
  const items = content.vehicles.filter((v) => v.visible);
  return (
    <>
      <PageHead eyebrow="Occasionen" title={page.headline} lead={items.length ? undefined : page.emptyText} />
      <section className="container-x">
        {items.length === 0 ? (
          <Button to="/kontakt">Wunschauto anfragen</Button>
        ) : (
          <ul className="grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((v, i) => (
              <Reveal as="li" key={v.id} delay={i * 60}>
                <article className="group overflow-hidden rounded-2xl border border-line bg-paper transition-colors hover:border-ink">
                  {v.image && (
                    <div className="overflow-hidden">
                      <img src={v.image} alt={v.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold tracking-tight">{v.title}</h2>
                    <p className="mt-1 text-muted">{[v.year, v.km && `${v.km} km`].filter(Boolean).join(" · ")}</p>
                    {v.description && <p className="mt-3">{v.description}</p>}
                    {v.priceCHF && <p className="mt-4 text-2xl font-semibold">CHF {v.priceCHF}</p>}
                    <p className="mt-4"><Link className="link font-semibold" to="/kontakt">Anfrage senden →</Link></p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        )}
      </section>
      <CtaBand />
    </>
  );
}

type FormState = "idle" | "sending" | "done" | "error";

export function Contact() {
  const { content } = useContent();
  const { contact } = content.pages;
  const [state, setState] = useState<FormState>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website")) return; // Honeypot
    const str = (k: string) => String(fd.get(k) ?? "").trim();
    const msg = { name: str("name"), company: str("company"), phone: str("phone"), email: str("email"), message: str("message") };
    if (!firebaseEnabled) {
      // Ohne Backend: Mail-Programm als Fallback
      const body = `${msg.message}\n\n${msg.name}${msg.company ? `, ${msg.company}` : ""}\n${msg.phone}\n${msg.email}`;
      window.location.href = `mailto:${content.company.email}?subject=${encodeURIComponent("Anfrage über die Website")}&body=${encodeURIComponent(body)}`;
      return;
    }
    setState("sending");
    try {
      const { sendMessage } = await import("../../lib/repo");
      await sendMessage(msg);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <PageHead eyebrow="Kontakt" title={contact.headline} lead={contact.intro} />
      <section className="container-x grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
        {state === "done" ? (
          <div role="status" className="rounded-2xl bg-paper-2 p-10">
            <h2 className="h2">Danke für deine Nachricht.</h2>
            <p className="mt-4 text-muted">Wir melden uns so rasch wie möglich bei dir.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" aria-label="Kontaktformular">
            <p className="sr-only"><label>Nicht ausfüllen <input name="website" tabIndex={-1} autoComplete="off" /></label></p>
            <Field label="Name *" name="name" autoComplete="name" required />
            <Field label="Firma" name="company" autoComplete="organization" />
            <Field label="Telefon" name="phone" type="tel" autoComplete="tel" />
            <Field label="E-Mail *" name="email" type="email" autoComplete="email" required />
            <div className="sm:col-span-2">
              <label className="label" htmlFor="message">Nachricht *</label>
              <textarea id="message" name="message" className="field" required minLength={5} />
            </div>
            <p className="text-sm text-muted sm:col-span-2">
              Mit * markierte Felder sind Pflicht. Es gilt die <Link className="link text-ink" to="/datenschutz">Datenschutzerklärung</Link>.
            </p>
            <div className="sm:col-span-2">
              <Button type="submit" variant="accent" disabled={state === "sending"}>{state === "sending" ? "Wird gesendet …" : "Nachricht senden"}</Button>
              {state === "error" && <p role="alert" className="mt-4 font-semibold text-accent-ink">Das hat leider nicht geklappt. Bitte ruf uns an oder schreib an {content.company.email}.</p>}
            </div>
          </form>
        )}
        <aside className="space-y-8">
          <div>
            <h2 className="eyebrow">Werkstatt</h2>
            <address className="mt-3 not-italic">{content.company.name}<br />{content.company.street}<br />{content.company.zip} {content.company.city}</address>
          </div>
          <div>
            <h2 className="eyebrow">Direkt</h2>
            <p className="mt-3">
              <a className="link text-2xl font-semibold" href={`tel:${content.company.phone.replace(/\s/g, "")}`}>{content.company.phone}</a><br />
              <a className="link text-muted" href={`mailto:${content.company.email}`}>{content.company.email}</a>
            </p>
          </div>
        </aside>
      </section>
      <section className="container-x mt-24"><MapEmbed /></section>
    </>
  );
}

function Field({ label, name, ...rest }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="field" {...rest} />
    </div>
  );
}

export function Legal({ doc }: { doc?: "imprint" | "privacy" | "cookies" }) {
  const { legal } = useContent().content;
  const { slug } = useParams();
  const key = doc ?? (slug as "imprint");
  const d = legal[key];
  return (
    <>
      <PageHead title={d.title} />
      <section className="container-x">
        <div className="max-w-[68ch] whitespace-pre-line leading-relaxed">{d.body}</div>
        {key === "imprint" && <p className="mt-10 max-w-[68ch] whitespace-pre-line text-sm text-muted">{legal.credits}</p>}
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <>
      <PageHead eyebrow="404" title="Diese Seite gibt es nicht." />
      <section className="container-x"><Button to="/">Zur Startseite</Button></section>
    </>
  );
}
