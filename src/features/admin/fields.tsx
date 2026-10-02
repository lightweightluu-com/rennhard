import { useId, useState } from "react";
import { uploadImage } from "../../lib/repo";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "image" | "checkbox" | "number" | "date";
  hint?: string;
};
type Row = Record<string, unknown>;

function ImageField({ label, value, onChange, folder }: { label: string; value: string; onChange: (v: string) => void; folder: string }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="flex items-center gap-4">
        {value ? <img src={value} alt="" className="h-16 w-24 rounded-lg border border-line object-cover" /> : <div className="grid h-16 w-24 place-items-center rounded-lg border border-dashed border-line text-xs text-muted">kein Bild</div>}
        <input
          id={id}
          type="file"
          accept="image/*"
          className="text-sm"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setErr("");
            try { onChange(await uploadImage(file, folder)); } catch (x) { setErr((x as Error).message); }
            setBusy(false);
          }}
        />
        {busy && <span className="text-sm text-muted" role="status">Lade hoch …</span>}
      </div>
      {err && <p role="alert" className="mt-1 text-sm font-semibold text-accent-ink">{err}</p>}
    </div>
  );
}

/** Rendert ein Formular aus Felddefinitionen – gemeinsame Basis für alle Editoren. */
export function FieldGrid({ fields, value, onChange, folder }: { fields: FieldDef[]; value: Row; onChange: (next: Row) => void; folder: string }) {
  const uid = useId();
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });
  return (
    <div className="grid gap-4">
      {fields.map((f) => {
        const id = `${uid}-${f.key}`;
        const v = value[f.key];
        if (f.type === "image") return <ImageField key={f.key} label={f.label} value={String(v ?? "")} onChange={(x) => set(f.key, x)} folder={folder} />;
        if (f.type === "checkbox")
          return (
            <label key={f.key} className="flex items-center gap-3 font-medium">
              <input type="checkbox" className="h-5 w-5 accent-[var(--color-accent)]" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} />
              {f.label}
            </label>
          );
        return (
          <div key={f.key}>
            <label className="label" htmlFor={id}>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea id={id} className="field" value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)} />
            ) : (
              <input
                id={id}
                className="field"
                type={f.type ?? "text"}
                value={String(v ?? "")}
                onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
              />
            )}
            {f.hint && <p className="mt-1 text-sm text-muted">{f.hint}</p>}
          </div>
        );
      })}
    </div>
  );
}
