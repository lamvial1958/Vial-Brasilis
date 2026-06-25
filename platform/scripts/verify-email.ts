/**
 * Uso único: marca o e-mail de uma conta como verificado sem precisar do link de e-mail.
 * Rodar com: npx tsx scripts/verify-email.ts email@exemplo.com
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    }),
  });
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx scripts/verify-email.ts email@exemplo.com");
    process.exit(1);
  }
  const adminAuth = getAuth();
  const user = await adminAuth.getUserByEmail(email);
  await adminAuth.updateUser(user.uid, { emailVerified: true });
  console.log(`OK: ${email} (uid=${user.uid}) marcado como verificado.`);
  console.log("Pode fazer login normalmente agora.");
}

main();
