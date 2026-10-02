import { useState, type ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { useContent } from "../../lib/content";
import { removeItem, saveDoc, saveItem, type CollectionName } from "../../lib/repo";
import type { DayHours, Hours } from "../../lib/types";
import { FieldGrid, type FieldDef } from "./fields";

type Row = Record<string, unknown>;

/** Kleiner Hook: führt Speichern aus, meldet Status und lädt anschliessend den Seiteninhalt neu. */
function useSave() {
  const { reload } = useContent();
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "ok" | "err"; msg?: string }>({ kind: "idle" });
  const run = async (fn: () => Promise<unknown>) => {
    setStatus({ kind: "busy" });
    try {
      await fn();
      await reload();
      setStatus({ kind: "ok", msg: "Gespeichert." });
    } catch (e) {
      setStatus({ kind: "err", msg: (e as Error).message });
    }
  };
  return { status, run };
}

function SaveBar({ status, onSave, label = "Speichern" }: { status: ReturnType<typeof useSave>["status"]; onSave: () => void; label?: string }) {
  return (
    <div className="mt-6 flex items-center gap-4">
      <Button small variant="accent" onClick={onSave} disabled={status.kind === "busy"}>{status.kind === "busy" ? "Speichert …" : label}</Button>
      <span role="status" className={status.kind === "err" ? "font-semibold text-accent-ink" : "text-muted"}>{status.msg}</span>
    </div>
  );
}

export const Card = ({ title, children }: { title?: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-line bg-[#fbf9f3] p-6">
    {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
    {children}
  </section>
);

/** Einzeldokument (Firma, Seitentexte, Rechtliches). */
export function DocEditor({ title, path, initial, fields, folder = "pages" }: { title: string; path: [string, string]; initial: object; fields: FieldDef[]; folder?: string }) {
  const [draft, setDraft] = useState<Row>(initial as Row);
  const { status, run } = useSave();
  return (
    <Card title={title}>
      <FieldGrid fields={fields} value={draft} onChange={setDraft} folder={folder} />
      <SaveBar status={status} onSave={() => run(() => saveDoc(path, draft))} />
    </Card>
  );
}

/** Sortierbare Sammlung (Leistungen, Team, Occasionen). */
export function ListEditor({ name, items, fields, blank, titleKey, folder }: { name: CollectionName; items: { id: string }[]; fields: FieldDef[]; blank: Row; titleKey: string; folder: string }) {
  const [rows, setRows] = useState<Row[]>(items as unknown as Row[]);
  const [open, setOpen] = useState<string | null>(null);
  const { status, run } = useSave();

  const update = (id: string, next: Row) => setRows((r) => r.map((x) => (x.id === id ? next : x)));
  const add = () => {
    const id = `${name[0]}${Date.now().toString(36)}`;
    setRows((r) => [...r, { ...blank, id, order: r.length + 1 }]);
    setOpen(id);
  };
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const j = i + d;
      if (j < 0 || j >= r.length) return r;
      const copy = [...r];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy.map((x, k) => ({ ...x, order: k + 1 }));
    });
  const remove = (id: string) => {
    if (!confirm("Eintrag wirklich löschen?")) return;
    setRows((r) => r.filter((x) => x.id !== id).map((x, k) => ({ ...x, order: k + 1 })));
    void run(() => removeItem(name, id));
  };
  const saveAll = () =>
    run(async () => {
      for (const { id, ...rest } of rows as (Row & { id: string })[]) await saveItem(name, id, rest);
    });

  return (
    <div className="grid gap-3">
      {rows.length === 0 && <p className="text-muted">Noch keine Einträge.</p>}
      {rows.map((r, i) => {
        const id = String(r.id);
        const isOpen = open === id;
        return (
          <Card key={id}>
            <div className="flex flex-wrap items-center gap-3">
              <button className="min-h-11 flex-1 text-left text-lg font-semibold" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : id)}>
                {String(r[titleKey] || "Neuer Eintrag")} {r.visible === false && <span className="ml-2 text-sm font-normal text-muted">(versteckt)</span>}
              </button>
              <Button small variant="ghost" aria-label="Nach oben" onClick={() => move(i, -1)} disabled={i === 0}>↑</Button>
              <Button small variant="ghost" aria-label="Nach unten" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>↓</Button>
              <Button small variant="ghost" onClick={() => remove(id)}>Löschen</Button>
            </div>
            {isOpen && (
              <div className="mt-5 border-t border-line pt-5">
                <FieldGrid fields={fields} value={r} onChange={(n) => update(id, n)} folder={folder} />
              </div>
            )}
          </Card>
        );
      })}
      <div className="flex flex-wrap items-center gap-3">
        <Button small variant="ghost" onClick={add}>+ Hinzufügen</Button>
      </div>
      <SaveBar status={status} onSave={saveAll} label="Alle speichern" />
    </div>
  );
}

const DAYS_DEFAULT: DayHours = { day: "", closed: false, slots: [{ from: "07:30", to: "12:00" }, { from: "13:30", to: "17:30" }] };

export function HoursEditor() {
  const { content } = useContent();
  const [hours, setHours] = useState<Hours>(structuredClone(content.hours));
  const { status, run } = useSave();

  const setDay = (i: number, d: DayHours) => setHours((h) => ({ ...h, weekly: h.weekly.map((x, k) => (k === i ? d : x)) }));
  const time = "field !min-h-11 !w-28";

  return (
    <div className="grid gap-6">
      <Card title="Reguläre Öffnungszeiten">
        <div className="grid gap-5">
          {hours.weekly.map((d, i) => (
            <fieldset key={d.day} className="grid gap-3 border-b border-line pb-5 last:border-0 sm:grid-cols-[8rem_1fr] sm:items-center">
              <legend className="sr-only">{d.day}</legend>
              <span className="font-semibold" aria-hidden="true">{d.day}</span>
              <div className="flex flex-wrap items-center gap-3">
                <label className="mr-2 flex items-center gap-2">
                  <input type="checkbox" className="h-5 w-5 accent-[var(--color-accent)]" checked={d.closed} onChange={(e) => setDay(i, { ...d, closed: e.target.checked, slots: e.target.checked || d.slots.length ? d.slots : DAYS_DEFAULT.slots })} />
                  Geschlossen
                </label>
                {!d.closed && d.slots.map((s, k) => (
                  <span key={k} className="flex items-center gap-2">
                    <input aria-label={`${d.day} Slot ${k + 1} von`} type="time" className={time} value={s.from} onChange={(e) => setDay(i, { ...d, slots: d.slots.map((x, n) => (n === k ? { ...x, from: e.target.value } : x)) })} />
                    –
                    <input aria-label={`${d.day} Slot ${k + 1} bis`} type="time" className={time} value={s.to} onChange={(e) => setDay(i, { ...d, slots: d.slots.map((x, n) => (n === k ? { ...x, to: e.target.value } : x)) })} />
                    <button className="px-2 text-muted hover:text-ink" aria-label="Zeitfenster entfernen" onClick={() => setDay(i, { ...d, slots: d.slots.filter((_, n) => n !== k) })}>×</button>
                  </span>
                ))}
                {!d.closed && <Button small variant="ghost" onClick={() => setDay(i, { ...d, slots: [...d.slots, { from: "08:00", to: "12:00" }] })}>+ Zeitfenster</Button>}
              </div>
            </fieldset>
          ))}
        </div>
      </Card>
      <Card title="Ausnahmen (Betriebsferien, Feiertage)">
        <p className="mb-4 text-muted">An diesen Tagen zeigt die Website «geschlossen» an.</p>
        <div className="grid gap-3">
          {hours.exceptions.map((e) => (
            <div key={e.id} className="flex flex-wrap items-end gap-3">
              <div><label className="label" htmlFor={`d${e.id}`}>Datum</label><input id={`d${e.id}`} type="date" className="field !w-auto" value={e.date} onChange={(ev) => setHours((h) => ({ ...h, exceptions: h.exceptions.map((x) => (x.id === e.id ? { ...x, date: ev.target.value } : x)) }))} /></div>
              <div className="min-w-48 flex-1"><label className="label" htmlFor={`l${e.id}`}>Bezeichnung</label><input id={`l${e.id}`} className="field" value={e.label} placeholder="z. B. Betriebsferien" onChange={(ev) => setHours((h) => ({ ...h, exceptions: h.exceptions.map((x) => (x.id === e.id ? { ...x, label: ev.target.value } : x)) }))} /></div>
              <Button small variant="ghost" onClick={() => setHours((h) => ({ ...h, exceptions: h.exceptions.filter((x) => x.id !== e.id) }))}>Entfernen</Button>
            </div>
          ))}
          <div><Button small variant="ghost" onClick={() => setHours((h) => ({ ...h, exceptions: [...h.exceptions, { id: String(Date.now()), date: "", label: "" }] }))}>+ Ausnahme</Button></div>
        </div>
      </Card>
      <SaveBar status={status} onSave={() => run(() => saveDoc(["settings", "hours"], { ...hours, exceptions: hours.exceptions.filter((e) => e.date) }))} />
    </div>
  );
}
