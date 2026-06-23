"use client";

import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { firebaseApp } from "./client";

let initialized = false;

/** Inicializa o App Check no navegador. Sem efeito se a site key ainda não foi configurada (ver .env.local). */
export function ensureAppCheck() {
  const siteKey = process.env.NEXT_PUBLIC_APPCHECK_SITE_KEY;
  if (initialized || !siteKey || typeof window === "undefined") return;
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  initialized = true;
}
