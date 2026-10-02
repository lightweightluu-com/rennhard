import { initializeApp } from "firebase/app";

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

/** true, sobald die .env mit echten Firebase-Werten befüllt ist. */
export const firebaseEnabled = Boolean(config.apiKey && config.projectId && config.appId);

export const app = firebaseEnabled ? initializeApp(config) : null;

/** Auth und Storage werden nur im Admin gebraucht und deshalb erst dort nachgeladen. */
export async function getAuthInstance() {
  if (!app) throw new Error("Firebase ist nicht konfiguriert (.env fehlt).");
  const { getAuth } = await import("firebase/auth");
  return getAuth(app);
}
export async function getStorageInstance() {
  if (!app) throw new Error("Firebase ist nicht konfiguriert (.env fehlt).");
  const { getStorage } = await import("firebase/storage");
  return getStorage(app);
}
