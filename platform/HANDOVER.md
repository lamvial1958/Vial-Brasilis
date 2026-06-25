# Handover — Plataforma VIAL Brasilis PLE

Estado em 2026-06-25 (fim de sessão ~tarde). Retome daqui sem perder contexto.

---

## Stack (não muda)

- **Frontend + API routes**: Next.js 16.2.9 no Vercel (plano Spark — gratuito)
- **Auth + DB**: Firebase Auth + Firestore (plano Spark — gratuito)
- **Sem Firebase Admin SDK no Next.js** — substituído por REST APIs (`lib/firebase/auth-rest.ts`)
- **Sem Firebase Blaze** até captação de clientes pagantes

---

## URLs

- **Produção**: https://platform-henna-nine.vercel.app
- **Vercel project**: luiz-antonio-m-vials-projects / platform-br
- **Firebase project**: portugues-brasil-ple

---

## Estado atual — tudo funcional

### Auth
- Google Sign-In funcionando (popup)
- Email/senha funcionando
- Sem gate de verificação de e-mail (removido — Firebase Spark não entrega bem)
- Admin role via custom claim Firebase (`scripts/set-admin-claim.ts`)
- Sessão via cookie JWT HS256 (5 dias)

### Conta admin
- `viallamv@gmail.com` — email verificado, role=admin configurado

### Conteúdo
- PRE-A1 → B2: 50 lições geradas
- Pipeline: `docs/conteudo/**/*.md` → `scripts/build-content.ts` → `content/generated/**/*.json`
- Vercel usa os JSONs pré-gerados (docs/ não sobe para produção)
- Para regenerar após editar markdown: `npx tsx scripts/build-content.ts` (dentro de `platform/`)

### Brand
- Nome: **VIAL Brasilis**, marca **V&M** (Vial & Monticelli)
- Domínio futuro: vialbrasilis
- Logo: `platform/public/logo.png` (coração com listras)
- Cores: navy `#0f2744`, blue `#2f7fc1`, coral `#d9624a`, green `#1a6b3a`

---

## Limpeza de conteúdo feita nesta sessão

Aplicado em todos os 50 arquivos de lição:

1. `notaIntro` removido da renderização do aluno (bloco interno pedagógico)
2. Metadados SRS `(N itens, tag level.X)` removidos do markdown
3. "chunks" → "expressões prontas/fixas" (English jargon eliminado)
4. Diálogos reformatados: `> **Falante:** texto` → `**Falante:** - texto` com parágrafo por fala
   - Notas, regras, textos de estímulo mantidos como blockquote (`> **Nota:**`, `> **Regra:**`, etc.)

---

## Correções pontuais de conteúdo

### PRE-A1.1 (01-primeiro-contato.md)
- Pergunta "Que horário do dia é a cena?" → "A que horas é a janta?" / resposta "À noite"

### PRE-A1.0 (00-ferramentas-basicas-i.md)
- "Tom: - Pode, sim." → "Tom: - Posso sim." (verbo primeira pessoa)
- "cento e dez vírgula cinquenta se pagar em dinheiro" → "cento e dez e cinquenta, se pagar em dinheiro"

---

## Variáveis de ambiente no Vercel

```
FIREBASE_ADMIN_PROJECT_ID         = portugues-brasil-ple
FIREBASE_ADMIN_CLIENT_EMAIL       = firebase-adminsdk-fbsvc@portugues-brasil-ple.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY        = [chave RSA configurada no Vercel]
SESSION_SECRET                    = [configurado]
NEXT_PUBLIC_FIREBASE_API_KEY      = AIzaSyC0HCqsCIdaBf4M_Quj2kHQ32BTokysRR4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN  = portugues-brasil-ple.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID   = portugues-brasil-ple
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      = portugues-brasil-ple.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 199410587722
NEXT_PUBLIC_FIREBASE_APP_ID       = 1:199410587722:web:329850cbcd27c43a1a2eb3
```

---

## Arquitetura server-side

```
Browser                    Next.js (Vercel)              Google APIs
  |                              |                             |
  |-- POST /api/auth/session --> |                             |
  |   { idToken }               |-- verifyIdToken() --------> |
  |                             |<-- cert + jwt.verify() -----|
  |<-- Set-Cookie session ------|                             |
  |   (HS256 JWT, 5 dias)       |                             |
```

**Arquivos chave**:
- `lib/firebase/auth-rest.ts` — auth server-side + `getAccessToken()` (scopes: firebase, identitytoolkit, datastore)
- `lib/firebase/firestore-rest.ts` — leitura/escrita no Firestore via REST
- `lib/firebase/session.ts` — helpers de sessão (`requireAdmin`, `getSessionUser`)
- `lib/firebase/client.ts` — Firebase client SDK (somente browser)
- `lib/firebase/admin.ts` — VAZIO (não importar)

---

## Firestore — Regras de segurança

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

## O que ainda não foi construído

- Áudio TTS/STT
- Upload de produção oral
- Testes automatizados
- Sistema de pagamento / acesso por matrícula
