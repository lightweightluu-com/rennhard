# Dorfgarage Rennhard – Website & CMS

React 19 · Vite · Tailwind v4 · Firebase (Auth, Firestore, Storage, Hosting)

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

## Ohne Firebase
Ohne `.env` läuft die Seite mit den übernommenen Inhalten aus `src/content/seed.ts`. `/admin` zeigt dann die Einrichtungsanleitung, das Kontaktformular öffnet das Mailprogramm.

## Firebase einrichten
1. Projekt anlegen; **Authentication** (E-Mail/Passwort), **Firestore**, **Storage** aktivieren.
2. `.env.example` → `.env` kopieren und die Web-App-Werte eintragen.
3. Benutzer in Authentication anlegen, danach in Firestore ein Dokument `admins/<UID>` erstellen (Feld beliebig). Nur diese Benutzer dürfen schreiben.
4. `firebase deploy --only firestore:rules,storage` und `npm run build && firebase deploy --only hosting`.
5. Unter `/admin` anmelden → *Seitentexte* → **Inhalte in Datenbank übernehmen** (einmalige Migration).

## Deployment (Cloudflare Workers)
Push auf `main` baut und deployt über `.github/workflows/deploy.yml` (`wrangler.jsonc`, Custom Domain `rennhard.lightweightluu.com`).
Nötig: Repository-Secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`; die Firebase-Werte optional als Repository-Variablen `VITE_FIREBASE_*`.

## Aufbau
```
src/features/site     öffentliche Seiten (Layout, Sections, pages)
src/features/admin    geschütztes CMS (lazy geladen), generische Editoren
src/lib               Firebase, Repository, Öffnungszeiten-Logik, Typen
src/content/seed.ts   Inhalte der bisherigen Website
```
Datenmodell: `settings/{company,hours}`, `pages/{home,offer,about,vehicles,contact}`, `legal/{imprint,privacy,cookies,credits}`, Sammlungen `services`, `team`, `vehicles`, `messages` (nur Admin lesbar).

## Offen
- Datenschutzerklärung: Volltext der alten Seite einfügen (Admin → Rechtliches).
- Adobe-Stock-Bilder der alten Seite sind bewusst nicht übernommen (Lizenz).
