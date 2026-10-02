import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { app, getStorageInstance } from "./firebase";
import { seed } from "../content/seed";
import type { ContactMessage, SiteContent } from "./types";

type Doc = Record<string, unknown>;
const db = app ? getFirestore(app) : null;
const need = <T>(x: T | null): T => {
  if (!x) throw new Error("Firebase ist nicht konfiguriert (.env fehlt).");
  return x;
};

/** Einzeldokumente (Pfad "gruppe/name") und Sammlungen, die zusammen den Seiteninhalt ergeben. */
const SINGLES = [
  ["settings", "company", "company"],
  ["settings", "hours", "hours"],
] as const;
const PAGE_KEYS = Object.keys(seed.pages) as (keyof SiteContent["pages"])[];
const LEGAL_KEYS = ["imprint", "privacy", "cookies"] as const;
export const COLLECTIONS = ["services", "team", "vehicles"] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/** Lädt alle Inhalte aus Firestore und legt sie über die Seed-Daten. Fehlende Dokumente fallen auf den Seed zurück. */
export async function loadContent(): Promise<SiteContent> {
  const store = need(db);
  const out: SiteContent = structuredClone(seed);
  const read = async (path: [string, string]) => {
    const snap = await getDoc(doc(store, ...path));
    return snap.exists() ? (snap.data() as Doc) : null;
  };

  await Promise.all([
    ...SINGLES.map(async ([col, id, key]) => {
      const d = await read([col, id]);
      if (d) Object.assign(out[key], d);
    }),
    ...PAGE_KEYS.map(async (k) => {
      const d = await read(["pages", k]);
      if (d) Object.assign(out.pages[k], d);
    }),
    ...LEGAL_KEYS.map(async (k) => {
      const d = await read(["legal", k]);
      if (d) Object.assign(out.legal[k], d);
    }),
    read(["legal", "credits"]).then((d) => {
      if (typeof d?.text === "string") out.legal.credits = d.text;
    }),
    ...COLLECTIONS.map(async (name) => {
      const snap = await getDocs(collection(store, name));
      // Eine existierende (auch leere) Sammlung gilt erst, wenn sie Dokumente enthält — sonst Seed.
      if (!snap.empty) (out[name] as unknown[]) = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder as never);
    }),
  ]);
  return out;
}

export const saveDoc = (path: [string, string], data: object) => setDoc(doc(need(db), ...path), data);
export const saveItem = (name: CollectionName, id: string, data: object) => setDoc(doc(need(db), name, id), data);
export const removeItem = (name: CollectionName, id: string) => deleteDoc(doc(need(db), name, id));

export async function uploadImage(file: File, folder: string): Promise<string> {
  const { getDownloadURL, ref, uploadBytes } = await import("firebase/storage");
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const r = ref(await getStorageInstance(), `${folder}/${Date.now()}-${safe}`);
  await uploadBytes(r, file, { contentType: file.type });
  return getDownloadURL(r);
}

export async function sendMessage(msg: ContactMessage) {
  await addDoc(collection(need(db), "messages"), { ...msg, read: false, createdAt: serverTimestamp() });
}

export async function listMessages() {
  const snap = await getDocs(collection(need(db), "messages"));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Doc), createdAt: (d.data().createdAt?.toDate?.() as Date | undefined) ?? null }))
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)) as (ContactMessage & {
    id: string;
    read: boolean;
    createdAt: Date | null;
  })[];
}
export const markRead = (id: string, read: boolean) => setDoc(doc(need(db), "messages", id), { read }, { merge: true });
export const deleteMessage = (id: string) => deleteDoc(doc(need(db), "messages", id));

/** Schreibt die kompletten Seed-Inhalte nach Firestore (Erstmigration). */
export async function migrateSeed() {
  const s = seed;
  await saveDoc(["settings", "company"], s.company);
  await saveDoc(["settings", "hours"], s.hours);
  for (const k of PAGE_KEYS) await saveDoc(["pages", k], s.pages[k]);
  for (const k of LEGAL_KEYS) await saveDoc(["legal", k], s.legal[k]);
  await saveDoc(["legal", "credits"], { text: s.legal.credits });
  for (const name of COLLECTIONS)
    for (const { id, ...rest } of s[name] as { id: string }[]) await saveItem(name, id, rest);
}
