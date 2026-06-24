import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let _app: App | undefined;
let _initError: unknown;

function getAdminApp(): App {
  if (_app) return _app;
  if (_initError) throw _initError;

  try {
    if (getApps().length) {
      _app = getApps()[0]!;
      return _app;
    }

    const raw = (v: string | undefined) =>
      (v ?? "").replace(/^﻿/, "").trim();

    const projectId = raw(process.env.FIREBASE_ADMIN_PROJECT_ID);
    const clientEmail = raw(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
    const privateKey = raw(process.env.FIREBASE_ADMIN_PRIVATE_KEY).replace(
      /\\n/g,
      "\n"
    );

    console.log("[admin] projectId:", JSON.stringify(projectId));
    console.log("[admin] privateKey first 50:", JSON.stringify(privateKey.slice(0, 50)));

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Firebase Admin: credenciais ausentes");
    }

    _app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    return _app;
  } catch (e) {
    console.error("[admin] init failed:", e);
    _initError = e;
    throw e;
  }
}

export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getAuth(getAdminApp()) as any)[prop];
  },
});

export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getFirestore(getAdminApp()) as any)[prop];
  },
});
