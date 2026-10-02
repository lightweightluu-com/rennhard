import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seed } from "../content/seed";
import { firebaseEnabled } from "./firebase";
import type { SiteContent } from "./types";

interface Ctx {
  content: SiteContent;
  reload: () => Promise<void>;
}
const ContentContext = createContext<Ctx | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(seed);

  const reload = useCallback(async () => {
    if (!firebaseEnabled) return;
    try {
      // Firestore wird erst bei Bedarf nachgeladen, damit die Startseite schlank bleibt.
      const { loadContent } = await import("./repo");
      setContent(await loadContent());
    } catch (err) {
      console.warn("Inhalte konnten nicht geladen werden, Fallback aktiv:", err);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(() => ({ content, reload }), [content, reload]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent außerhalb von ContentProvider");
  return ctx;
}
