/**
 * Uso único: promove uma conta existente (já cadastrada via /signup) a admin.
 * Rodar com: npx tsx scripts/set-admin-claim.ts email@exemplo.com
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
const adminAuth = getAuth();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx scripts/set-admin-claim.ts email@exemplo.com");
    process.exit(1);
  }

  const user = await adminAuth.getUserByEmail(email);
  await adminAuth.setCustomUserClaims(user.uid, { role: "admin" });
  console.log(`OK: ${email} (uid=${user.uid}) agora tem o papel "admin".`);
  console.log("O usuário precisa fazer logout/login de novo para o claim valer na sessão.");
}

main();
