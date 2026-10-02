import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { User } from "firebase/auth";
import { Button } from "../../components/ui/Button";
import { useContent } from "../../lib/content";
import { firebaseEnabled, getAuthInstance } from "../../lib/firebase";
import { migrateSeed } from "../../lib/repo";
import { Card, DocEditor, HoursEditor, ListEditor } from "./editors";
import type { FieldDef } from "./fields";
import { Messages } from "./Messages";

const F = {
  company: [
    { key: "name", label: "Firmenname" }, { key: "street", label: "Strasse" }, { key: "zip", label: "PLZ" }, { key: "city", label: "Ort" },
    { key: "phone", label: "Telefon" }, { key: "email", label: "E-Mail (Anzeige und Empfänger)" }, { key: "owner", label: "Vertretungsberechtigte Person" },
    { key: "ownerRole", label: "Funktion" }, { key: "uid", label: "UID" }, { key: "mapsQuery", label: "Adresse für die Karte" }, { key: "tagline", label: "Claim" },
  ] satisfies FieldDef[],
  home: [
    { key: "eyebrow", label: "Kleine Zeile über dem Titel" }, { key: "headline", label: "Titel", type: "textarea" }, { key: "lead", label: "Einleitung", type: "textarea" },
    { key: "body", label: "Hervorgehobener Satz" }, { key: "image", label: "Hauptbild", type: "image" },
  ] satisfies FieldDef[],
  offer: [{ key: "headline", label: "Titel" }, { key: "intro", label: "Einleitung", type: "textarea" }, { key: "outro", label: "Text über der Liste", type: "textarea" }] satisfies FieldDef[],
  about: [{ key: "headline", label: "Titel" }, { key: "intro", label: "Text", type: "textarea" }, { key: "image", label: "Bild", type: "image" }] satisfies FieldDef[],
  vehicles: [{ key: "headline", label: "Titel" }, { key: "emptyText", label: "Text wenn keine Occasionen", type: "textarea" }] satisfies FieldDef[],
  contact: [{ key: "headline", label: "Titel" }, { key: "intro", label: "Einleitung", type: "textarea" }] satisfies FieldDef[],
  legal: [{ key: "title", label: "Titel" }, { key: "body", label: "Text", type: "textarea" }] satisfies FieldDef[],
  service: [{ key: "title", label: "Bezeichnung" }, { key: "description", label: "Beschreibung (optional)", type: "textarea" }, { key: "visible", label: "Auf der Website anzeigen", type: "checkbox" }] satisfies FieldDef[],
  team: [{ key: "name", label: "Name" }, { key: "role", label: "Funktion" }, { key: "photo", label: "Foto", type: "image" }, { key: "visible", label: "Auf der Website anzeigen", type: "checkbox" }] satisfies FieldDef[],
  vehicle: [
    { key: "title", label: "Marke und Modell" }, { key: "year", label: "Jahrgang" }, { key: "km", label: "Kilometerstand" }, { key: "priceCHF", label: "Preis (CHF)" },
    { key: "description", label: "Beschreibung", type: "textarea" }, { key: "image", label: "Bild", type: "image" }, { key: "visible", label: "Auf der Website anzeigen", type: "checkbox" },
  ] satisfies FieldDef[],
};

type Tab = "texte" | "zeiten" | "leistungen" | "team" | "occasionen" | "firma" | "recht" | "nachrichten";
const TABS: { id: Tab; label: string }[] = [
  { id: "texte", label: "Seitentexte" }, { id: "zeiten", label: "Öffnungszeiten" }, { id: "leistungen", label: "Leistungen" }, { id: "team", label: "Team" },
  { id: "occasionen", label: "Occasionen" }, { id: "firma", label: "Firma & Kontakt" }, { id: "recht", label: "Rechtliches" }, { id: "nachrichten", label: "Nachrichten" },
];

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="container-x max-w-3xl py-16">{children}</div>
    </div>
  );
}

function Setup() {
  return (
    <Shell>
      <p className="eyebrow">Admin</p>
      <h1 className="h2 mt-3">Firebase ist noch nicht verbunden.</h1>
      <ol className="mt-8 grid list-decimal gap-3 pl-6 text-lg">
        <li>Firebase-Projekt anlegen, <strong>Authentication</strong> (E-Mail/Passwort), <strong>Firestore</strong> und <strong>Storage</strong> aktivieren.</li>
        <li>Web-App registrieren und die Werte in <code>.env</code> eintragen (Vorlage: <code>.env.example</code>).</li>
        <li>Einen Admin-Benutzer in Authentication anlegen und in Firestore ein Dokument <code>admins/&lt;UID&gt;</code> erstellen.</li>
        <li><code>firebase deploy --only firestore:rules,storage</code> ausführen und neu starten.</li>
      </ol>
      <p className="mt-8 text-muted">Bis dahin zeigt die Website die übernommenen Inhalte der alten Seite (<code>src/content/seed.ts</code>).</p>
      <p className="mt-8"><Button to="/" variant="ghost">Zur Website</Button></p>
    </Shell>
  );
}

function Login() {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setErr("");
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(await getAuthInstance(), String(fd.get("email")), String(fd.get("password")));
    } catch {
      setErr("Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.");
      setBusy(false);
    }
  }
  return (
    <Shell>
      <p className="eyebrow">Admin</p>
      <h1 className="h2 mt-3">Anmelden</h1>
      <form onSubmit={submit} className="mt-8 grid max-w-md gap-5">
        <div><label className="label" htmlFor="email">E-Mail</label><input id="email" name="email" type="email" autoComplete="username" className="field" required /></div>
        <div><label className="label" htmlFor="pw">Passwort</label><input id="pw" name="password" type="password" autoComplete="current-password" className="field" required /></div>
        {err && <p role="alert" className="font-semibold text-accent-ink">{err}</p>}
        <div><Button type="submit" disabled={busy}>Anmelden</Button></div>
      </form>
      <p className="mt-10"><Link className="link text-muted" to="/">← zur Website</Link></p>
    </Shell>
  );
}

function Dashboard({ user }: { user: User }) {
  const { content, reload } = useContent();
  const [tab, setTab] = useState<Tab>("texte");
  const [migrating, setMigrating] = useState("");
  const { pages, legal } = content;

  const panel = {
    texte: (
      <div className="grid gap-6">
        {(["home", "offer", "about", "vehicles", "contact"] as const).map((k) => (
          <DocEditor key={k} title={{ home: "Startseite", offer: "Angebot", about: "Über uns", vehicles: "Occasionen", contact: "Kontakt" }[k]} path={["pages", k]} initial={pages[k]} fields={F[k]} />
        ))}
      </div>
    ),
    zeiten: <HoursEditor />,
    leistungen: <ListEditor name="services" items={content.services} fields={F.service} titleKey="title" folder="services" blank={{ title: "", description: "", visible: true }} />,
    team: <ListEditor name="team" items={content.team} fields={F.team} titleKey="name" folder="team" blank={{ name: "", role: "", photo: "", visible: true }} />,
    occasionen: <ListEditor name="vehicles" items={content.vehicles} fields={F.vehicle} titleKey="title" folder="vehicles" blank={{ title: "", year: "", km: "", priceCHF: "", description: "", image: "", visible: true }} />,
    firma: <DocEditor title="Firmendaten" path={["settings", "company"]} initial={content.company } fields={F.company} />,
    recht: (
      <div className="grid gap-6">
        {(["imprint", "privacy", "cookies"] as const).map((k) => (
          <DocEditor key={k} title={legal[k].title} path={["legal", k]} initial={legal[k]} fields={F.legal} />
        ))}
        <DocEditor title="Bildnachweis" path={["legal", "credits"]} initial={{ text: legal.credits }} fields={[{ key: "text", label: "Text", type: "textarea" }]} />
      </div>
    ),
    nachrichten: <Messages />,
  }[tab];

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="font-semibold">Admin · Dorfgarage Rennhard</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">{user.email}</span>
            <Button small variant="ghost" to="/">Website</Button>
            <Button small variant="ghost" onClick={async () => (await import("firebase/auth")).signOut(await getAuthInstance())}>Abmelden</Button>
          </div>
        </div>
      </header>
      <div className="container-x grid gap-8 py-10 md:grid-cols-[14rem_1fr]">
        <nav aria-label="Admin-Bereiche">
          <ul className="flex list-none gap-2 overflow-x-auto md:flex-col">
            {TABS.map((t) => (
              <li key={t.id}>
                <button aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}
                  className={`min-h-11 w-full whitespace-nowrap rounded-xl px-4 text-left font-medium transition-colors ${tab === t.id ? "bg-ink text-paper" : "hover:bg-paper-2"}`}>
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <main key={tab + content.company.name} className="min-w-0">
          <h1 className="h2 mb-6">{TABS.find((t) => t.id === tab)?.label}</h1>
          {panel}
          {tab === "texte" && (
            <div className="mt-10">
              <Card title="Erstmigration">
                <p className="mb-4 text-muted">Schreibt alle übernommenen Inhalte der alten Website einmalig in die Datenbank. Bestehende Dokumente werden überschrieben.</p>
                <Button small variant="ghost" disabled={Boolean(migrating) && migrating !== "Fertig." && !migrating.startsWith("Fehler")} onClick={async () => {
                  if (!confirm("Alle Inhalte mit den Ursprungsdaten überschreiben?")) return;
                  setMigrating("Läuft …");
                  try { await migrateSeed(); await reload(); setMigrating("Fertig."); } catch (e) { setMigrating(`Fehler: ${(e as Error).message}`); }
                }}>Inhalte in Datenbank übernehmen</Button>
                <p role="status" className="mt-3 text-muted">{migrating}</p>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    document.title = "Admin – Dorfgarage Rennhard";
    if (!firebaseEnabled) return;
    let off = () => {};
    void (async () => {
      const [{ onAuthStateChanged }, auth] = await Promise.all([import("firebase/auth"), getAuthInstance()]);
      off = onAuthStateChanged(auth, setUser);
    })();
    return () => off();
  }, []);

  if (!firebaseEnabled) return <Setup />;
  if (user === undefined) return <Shell><p role="status" className="text-muted">Lädt …</p></Shell>;
  return user ? <Dashboard user={user} /> : <Login />;
}
