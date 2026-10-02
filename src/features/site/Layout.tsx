import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useContent } from "../../lib/content";
import { groupedHours, openStatus } from "../../lib/hours";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/angebot", label: "Angebot" },
  { to: "/occasionen", label: "Occasionen" },
  { to: "/ueber-uns", label: "Über uns" },
  { to: "/kontakt", label: "Kontakt" },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `link py-2 font-medium ${isActive ? "text-accent-ink [background-size:100%_1.5px]" : ""}`;

export function Wordmark() {
  const { content } = useContent();
  return (
    <Link to="/" className="flex items-baseline gap-2 leading-none" aria-label={`${content.company.name} – Startseite`}>
      <span className="text-xl font-semibold tracking-tight">Dorfgarage</span>
      <span className="serif-i text-xl text-accent-ink">Rennhard</span>
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { content } = useContent();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="container-x flex h-[4.5rem] items-center justify-between">
        <Wordmark />
        <nav aria-label="Hauptnavigation" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={navClass}>
              {n.label}
            </NavLink>
          ))}
          <a className="btn btn-sm" href={`tel:${content.company.phone.replace(/\s/g, "")}`}>
            {content.company.phone}
          </a>
        </nav>
        <button
          className="grid h-11 w-11 place-items-center rounded-full border border-line md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Menü schliessen" : "Menü öffnen"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-3 w-5" aria-hidden="true">
            <span className={`absolute left-0 top-0 h-0.5 w-5 bg-ink transition-transform duration-300 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`absolute left-0 bottom-0 h-0.5 w-5 bg-ink transition-transform duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      <nav
        id="mobile-nav"
        aria-label="Mobilnavigation"
        hidden={!open}
        className="fixed inset-x-0 top-[4.5rem] bottom-0 z-30 overflow-auto bg-paper md:hidden"
      >
        <ul className="container-x flex flex-col py-6">
          {NAV.map((n) => (
            <li key={n.to} className="border-b border-line">
              <NavLink to={n.to} end={n.end} className="block py-5 text-3xl font-semibold tracking-tight">
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="container-x pb-10">
          <a className="btn btn-accent w-full justify-center" href={`tel:${content.company.phone.replace(/\s/g, "")}`}>
            {content.company.phone}
          </a>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  const { content } = useContent();
  const { company, hours } = content;
  return (
    <footer className="mt-32 bg-ink text-paper">
      <div className="container-x grid gap-14 py-20 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display !text-[clamp(2.2rem,5vw,4rem)]">
            Dein Auto in <span className="serif-i text-[#f08a63]">guten</span> Händen.
          </p>
        </div>
        <address className="not-italic">
          <h2 className="eyebrow !text-paper/70">Adresse</h2>
          <p className="mt-4 leading-relaxed">
            {company.name}
            <br />
            {company.street}
            <br />
            {company.zip} {company.city}
          </p>
          <p className="mt-4">
            <a className="link" href={`tel:${company.phone.replace(/\s/g, "")}`}>Tel. {company.phone}</a>
            <br />
            <a className="link" href={`mailto:${company.email}`}>{company.email}</a>
          </p>
        </address>
        <div>
          <h2 className="eyebrow !text-paper/70">Öffnungszeiten</h2>
          <dl className="mt-4 space-y-3">
            {groupedHours(hours).map((g) => (
              <div key={g.label}>
                <dt className="font-semibold">{g.label}</dt>
                <dd className="text-paper/80">{g.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="border-t border-paper/15">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-6 text-sm text-paper/75">
          <p>© {new Date().getFullYear()} {company.name}</p>
          <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link className="link" to="/impressum">Impressum</Link>
            <Link className="link" to="/datenschutz">Datenschutz</Link>
            <Link className="link" to="/cookies">Cookie-Richtlinie</Link>
            <Link className="link" to="/admin">Login</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper">
        Zum Inhalt springen
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

/** Live-Status "Jetzt geöffnet". */
export function OpenBadge() {
  const { content } = useContent();
  const [status, setStatus] = useState(() => openStatus(content.hours));
  useEffect(() => {
    setStatus(openStatus(content.hours));
    const t = setInterval(() => setStatus(openStatus(content.hours)), 60_000);
    return () => clearInterval(t);
  }, [content.hours]);
  return (
    <p className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-0.5 rounded-2xl border border-line bg-paper-2/60 px-4 py-2 text-sm font-semibold" role="status">
      <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${status.open ? "bg-[#2f7d46]" : "bg-accent"}`} aria-hidden="true" />{status.open ? "Jetzt geöffnet" : "Geschlossen"}</span><span className="font-medium text-muted">{status.label}</span>
    </p>
  );
}
