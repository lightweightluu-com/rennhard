import type { Hours } from "./types";

const DAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export interface OpenStatus {
  open: boolean;
  label: string;
}

/** Berechnet "jetzt geöffnet" inkl. Ausnahmen (Ferien/Feiertage) in Schweizer Zeit. */
export function openStatus(hours: Hours, now = new Date()): OpenStatus {
  const local = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Zurich" }));
  const exception = hours.exceptions.find((e) => e.date === isoDate(local));
  if (exception) return { open: false, label: `Heute geschlossen – ${exception.label}` };

  const today = hours.weekly.find((d) => d.day === DAYS[local.getDay()]);
  const minutes = local.getHours() * 60 + local.getMinutes();
  if (today && !today.closed) {
    for (const s of today.slots) {
      if (minutes >= toMin(s.from) && minutes < toMin(s.to)) return { open: true, label: `Geöffnet bis ${s.to} Uhr` };
    }
    const next = today.slots.find((s) => toMin(s.from) > minutes);
    if (next) return { open: false, label: `Öffnet heute um ${next.from} Uhr` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = new Date(local);
    d.setDate(d.getDate() + i);
    if (hours.exceptions.some((e) => e.date === isoDate(d))) continue;
    const entry = hours.weekly.find((w) => w.day === DAYS[d.getDay()]);
    if (entry && !entry.closed && entry.slots.length)
      return { open: false, label: `Öffnet ${i === 1 ? "morgen" : entry.day} um ${entry.slots[0].from} Uhr` };
  }
  return { open: false, label: "Zurzeit geschlossen" };
}

/** Fasst aufeinanderfolgende Tage mit gleichen Zeiten zusammen: "Montag – Freitag". */
export function groupedHours(hours: Hours) {
  const groups: { days: string[]; text: string }[] = [];
  for (const d of hours.weekly) {
    const text = d.closed || !d.slots.length ? "Geschlossen" : d.slots.map((s) => `${s.from} – ${s.to}`).join(" | ");
    const last = groups[groups.length - 1];
    if (last && last.text === text) last.days.push(d.day);
    else groups.push({ days: [d.day], text });
  }
  return groups.map((g) => ({
    label: g.days.length > 1 ? `${g.days[0]} – ${g.days[g.days.length - 1]}` : g.days[0],
    text: g.text === "Geschlossen" ? g.text : `${g.text} Uhr`,
    closed: g.text === "Geschlossen",
  }));
}
