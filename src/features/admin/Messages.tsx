import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { deleteMessage, listMessages, markRead } from "../../lib/repo";

type Msg = Awaited<ReturnType<typeof listMessages>>[number];

export function Messages() {
  const [items, setItems] = useState<Msg[] | null>(null);
  const [err, setErr] = useState("");
  const load = () => listMessages().then(setItems).catch((e) => setErr((e as Error).message));
  useEffect(() => { void load(); }, []);

  if (err) return <p role="alert" className="font-semibold text-accent-ink">{err}</p>;
  if (!items) return <p role="status" className="text-muted">Lädt …</p>;
  if (!items.length) return <p className="text-muted">Keine Nachrichten.</p>;
  return (
    <ul className="grid list-none gap-3">
      {items.map((m) => (
        <li key={m.id} className={`rounded-2xl border p-5 ${m.read ? "border-line" : "border-ink bg-[#fbf9f3]"}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold">{m.name}{m.company ? `, ${m.company}` : ""}{!m.read && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white">neu</span>}</p>
            <time className="text-sm text-muted">{m.createdAt?.toLocaleString("de-CH")}</time>
          </div>
          <p className="mt-1 text-sm"><a className="link" href={`mailto:${m.email}`}>{m.email}</a>{m.phone && <> · <a className="link" href={`tel:${m.phone}`}>{m.phone}</a></>}</p>
          <p className="mt-3 whitespace-pre-line">{m.message}</p>
          <div className="mt-4 flex gap-3">
            <Button small variant="ghost" onClick={async () => { await markRead(m.id, !m.read); await load(); }}>{m.read ? "Als ungelesen" : "Als gelesen"}</Button>
            <Button small variant="ghost" onClick={async () => { if (confirm("Nachricht löschen?")) { await deleteMessage(m.id); await load(); } }}>Löschen</Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
