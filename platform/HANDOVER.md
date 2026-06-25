# Handover — Plataforma PLE (Português Brasil)

Estado em 2026-06-25 (fim de sessão ~09h). Retome daqui sem perder contexto.

---

## Stack decidida (não muda)

- **Frontend + API routes**: Next.js 16 no Vercel (plano Spark — gratuito)
- **Auth + DB**: Firebase Auth + Firestore (plano Spark — gratuito)
- **Sem Firebase Admin SDK no Next.js** — substituído por REST APIs
- **Sem Firebase Blaze** até captação de clientes pagantes

---

## URLs

- **Produção**: https://platform-henna-nine.vercel.app  (alias de platform-br.vercel.app)
- **Vercel project**: luiz-antonio-m-vials-projects / platform-br
- **Firebase project**: portugues-brasil-ple

---

## O que foi resolvido nesta sessão (2026-06-25)

### 1. BOM UTF-8 nas variáveis de ambiente (RESOLVIDO)
`NEXT_PUBLIC_FIREBASE_API_KEY` e possivelmente outras vars tinham um BOM (`﻿`, `%EF%BB%BF`) no início do valor. O Firebase SDK incluía o BOM num header HTTP → browser rejeitava o fetch com "String contains non ISO-8859-1 code point" → wrappado como `auth/network-request-failed`.

**Como foi diagnosticado**: interceptor de `fetch` no Console mostrou `key=%EF%BB%BFAIzaSy...` na URL.

**Fix**: todas as 6 vars `NEXT_PUBLIC_FIREBASE_*` recriadas no Vercel UI sem BOM. Redeploy feito.

### 2. Firestore não havia sido criado (RESOLVIDO)
O banco não existia no projeto Firebase. `setDoc` ficava pendurado infinitamente.

**Fix**: Firestore criado em modo nativo, região us-central. As regras de segurança já estavam corretas no código (ver seção de regras abaixo).

### 3. Conta viallamv@gmail.com criada com sucesso
Confirmado no Firebase Console → Authentication → Users. A conta existe, e-mail ainda não verificado.

---

## PRÓXIMA SESSÃO — Retome exatamente aqui

### Problema 1 — Frontend trava em "Criando..." após cadastro (PRIORIDADE)

**Causa identificada**: `sendEmailVerification` está sendo `await`-ado antes do `router.push`. Se `sendEmailVerification` demorar ou falhar silenciosamente, a página never avança.

**Fix a aplicar em `platform/app/(auth)/cadastro/page.tsx`**:

```ts
// ANTES (trava se sendEmailVerification demorar):
await sendEmailVerification(cred.user);
router.push("/verificar-email");

// DEPOIS (fire-and-forget — não bloqueia a navegação):
sendEmailVerification(cred.user).catch(() => {});
router.push("/verificar-email");
```

### Problema 2 — E-mail de verificação não chegou

O e-mail de confirmação enviado para `viallamv@gmail.com` não foi recebido.

**Passos para investigar**:
1. Verificar pasta de **spam/lixo eletrônico** no Gmail
2. No Firebase Console → Authentication → Users → `viallamv@gmail.com` → "Enviar e-mail de redefinição de senha" (alternativa para entrar)
3. Se o e-mail de verificação nunca chega: Firebase Console → Authentication → Templates → confirmar que o template de verificação está configurado
4. Tentar usar o botão "Reenviar e-mail de confirmação" em https://platform-henna-nine.vercel.app/verificar-email

### Passo 3 — Entrar na conta após verificação

Após verificar o e-mail, fazer login em https://platform-henna-nine.vercel.app/login com `viallamv@gmail.com`.

### Passo 4 — Definir papel admin

Após login com sucesso, rodar no terminal:
```
npx tsx platform/scripts/set-admin-claim.ts viallamv@gmail.com
```
Depois fazer logout e login novamente para o custom claim valer.

### Passo 5 — Verificar painel admin
Acessar https://platform-henna-nine.vercel.app/admin — deve listar alunos.

### Passo 6 — Testar lições
Acessar https://platform-henna-nine.vercel.app/licoes — deve funcionar sem erro 500.

### Passo 7 (opcional) — Google Sign-In
Firebase Auth já tem Google habilitado. Falta apenas:
- Adicionar botão "Entrar com Google" nas páginas `/cadastro` e `/login`
- Usar `signInWithPopup(auth, new GoogleAuthProvider())` no cliente

---

## Variáveis de ambiente no Vercel (estado atual — todas limpas, sem BOM)

```
FIREBASE_ADMIN_PROJECT_ID        = portugues-brasil-ple
FIREBASE_ADMIN_CLIENT_EMAIL      = firebase-adminsdk-fbsvc@portugues-brasil-ple.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY       = [chave RSA configurada no Vercel]
SESSION_SECRET                   = [configurado]
NEXT_PUBLIC_FIREBASE_API_KEY     = AIzaSyC0HCqsCIdaBf4M_Quj2kHQ32BTokysRR4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = portugues-brasil-ple.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID  = portugues-brasil-ple
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     = portugues-brasil-ple.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 199410587722
NEXT_PUBLIC_FIREBASE_APP_ID      = 1:199410587722:web:329850cbcd27c43a1a2eb3
```

---

## Firestore — Regras de segurança (configuradas e corretas)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return isSignedIn() && request.auth.token.role == 'admin'; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }

    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create: if isOwner(uid) && request.resource.data.role == 'student';
      allow update: if (isOwner(uid) && request.resource.data.role == resource.data.role) || isAdmin();
      allow delete: if isAdmin();
    }
    match /progress/{uid} {
      allow read, write: if isOwner(uid) || isAdmin();
    }
    match /srsItems/{uid}/items/{itemId} {
      allow read, write: if isOwner(uid) || isAdmin();
    }
    match /simuladoSubmissions/{uid}/attempts/{attemptId} {
      allow read: if isOwner(uid) || isAdmin();
      allow create: if isOwner(uid);
      allow update: if isAdmin();
    }
  }
}
```

---

## Arquitetura server-side (sem firebase-admin)

```
Browser                    Next.js (Vercel)              Google APIs
  |                              |                             |
  |-- POST /api/auth/session --> |                             |
  |   { idToken }               |-- verifyIdToken() --------> |
  |                             |   (googleapis.com/          |
  |                             |    robot/v1/metadata/x509)  |
  |                             |<-- cert + jwt.verify() -----|
  |                             |-- getUser() --------------> |
  |                             |   (identitytoolkit REST)    |
  |<-- Set-Cookie session ------| createSessionCookieSync()   |
  |   (HS256 JWT, 5 dias)       |   (jsonwebtoken HS256)      |
```

**Arquivos chave**:
- `lib/firebase/auth-rest.ts` — toda a lógica de auth server-side
- `lib/firebase/firestore-rest.ts` — leitura/escrita no Firestore
- `lib/firebase/session.ts` — helpers de sessão (requireAdmin, getSessionUser)
- `lib/firebase/client.ts` — Firebase client SDK (somente browser)
- `lib/firebase/admin.ts` — VAZIO (não importar)

---

## Como rodar localmente

```bash
cd platform
npm install
# .env.local precisa ter as variáveis FIREBASE_ADMIN_* e NEXT_PUBLIC_FIREBASE_*
npm run dev
```

---

## O que NÃO foi construído ainda

- Google Sign-In (botão na UI — Auth já habilitado no Firebase)
- Áudio TTS/STT
- Upload de produção oral
- Testes automatizados
