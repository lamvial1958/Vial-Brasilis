/**
 * Cria um aluno de teste no Firebase Auth via REST (sem credenciais admin)
 * e escreve platform/.env.test.local com as credenciais + URL de produção.
 *
 * Uso: npx tsx scripts/create-test-user.ts
 */

import { writeFileSync, existsSync } from "fs";
import { join } from "path";

const API_KEY = "AIzaSyC0HCqsCIdaBf4M_Quj2kHQ32BTokysRR4";
const PROJECT_ID = "portugues-brasil-ple";
const BASE_URL = "https://identitytoolkit.googleapis.com/v1";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const TEST_EMAIL = "aluno-teste@vialbrasilis.com";
const TEST_PASSWORD = "TestVial2026!";
const PROD_URL = "https://platform-henna-nine.vercel.app";

async function main() {
  let uid: string;
  let idToken: string;

  // Tenta criar o usuário; se já existir, faz login
  console.log(`Criando usuário de teste: ${TEST_EMAIL}`);
  const signUpRes = await fetch(`${BASE_URL}/accounts:signUp?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: true }),
  });
  const signUpData = (await signUpRes.json()) as Record<string, unknown>;

  if (!signUpRes.ok) {
    const errMsg = (signUpData?.error as Record<string, unknown>)?.message as string;
    if (errMsg !== "EMAIL_EXISTS") {
      throw new Error(`Criação falhou: ${JSON.stringify(signUpData.error)}`);
    }
    console.log("Usuário já existe — fazendo login...");
    const signInRes = await fetch(`${BASE_URL}/accounts:signInWithPassword?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: true }),
    });
    const signInData = (await signInRes.json()) as Record<string, unknown>;
    if (!signInRes.ok) throw new Error(`Login falhou: ${JSON.stringify(signInData.error)}`);
    uid = signInData.localId as string;
    idToken = signInData.idToken as string;
  } else {
    uid = signUpData.localId as string;
    idToken = signUpData.idToken as string;
    console.log(`Criado: uid=${uid}`);
  }

  // Cria o documento Firestore /users/{uid} com role=student (usando token do próprio aluno)
  const docRes = await fetch(`${FIRESTORE_URL}/users?documentId=${uid}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({
      fields: {
        email: { stringValue: TEST_EMAIL },
        role: { stringValue: "student" },
        criadoEm: { timestampValue: new Date().toISOString() },
      },
    }),
  });

  if (docRes.ok) {
    console.log("Documento Firestore /users criado.");
  } else {
    const docErr = (await docRes.json()) as Record<string, unknown>;
    const status = (docErr?.error as Record<string, unknown>)?.status as string;
    if (status === "ALREADY_EXISTS") {
      console.log("Documento Firestore já existe — OK.");
    } else {
      console.warn("Aviso ao criar documento:", JSON.stringify(docErr?.error));
    }
  }

  // Escreve .env.test.local
  const envPath = join(process.cwd(), ".env.test.local");
  const conteudo = [
    `TEST_USER_EMAIL=${TEST_EMAIL}`,
    `TEST_USER_PASSWORD=${TEST_PASSWORD}`,
    `# Testes rodam contra produção (sem precisar de dev server local)`,
    `PLAYWRIGHT_BASE_URL=${PROD_URL}`,
    "",
  ].join("\n");

  writeFileSync(envPath, conteudo, "utf-8");
  console.log(`\nEscrito: .env.test.local`);
  console.log(`  EMAIL:    ${TEST_EMAIL}`);
  console.log(`  BASE_URL: ${PROD_URL}`);
  console.log(`\nPronto! Rode: npm run test:e2e`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
