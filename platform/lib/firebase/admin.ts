import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function buildAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const privateKey = rawKey?.replace(/\\n/g, "\n");

  console.log("[admin] projectId:", projectId);
  console.log("[admin] clientEmail:", clientEmail);
  console.log("[admin] rawKey present:", !!rawKey, "length:", rawKey?.length);
  console.log("[admin] privateKey starts with:", privateKey?.slice(0, 40));

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Credenciais do Firebase Admin SDK ausentes. Configure FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL e FIREBASE_ADMIN_PRIVATE_KEY em .env.local."
    );
  }

  try {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } catch (e) {
    console.error("[admin] initializeApp error:", e);
    throw e;
  }
}

export const adminApp = buildAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
