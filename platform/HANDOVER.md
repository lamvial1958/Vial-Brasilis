# Handover — Plataforma PLE (Português Brasil)

Estado em 2026-06-24 (fim de sessão ~17h). Retome daqui sem perder contexto.

---

## Stack decidida (não muda)

- **Frontend + API routes**: Next.js 16 no Vercel (plano Spark — gratuito)
- **Auth + DB**: Firebase Auth + Firestore (plano Spark — gratuito)
- **Sem Firebase Admin SDK no Next.js** — substituído por REST APIs (ver abaixo)
- **Sem Firebase Blaze** até captação de clientes pagantes

---

## URLs

- **Produção**: https://platform-henna-nine.vercel.app  (alias de platform-br.vercel.app)
- **Vercel project**: luiz-antonio-m-vials-projects / platform-br
- **Firebase project**: portugues-brasil-ple

---

## Estado atual (fim desta sessão)

### O que foi resolvido nesta sessão

#### 1. ERR_REQUIRE_ESM (bloqueador principal — RESOLVIDO)
O Firebase Admin SDK causava `ERR_REQUIRE_ESM` no Turbopack porque:
- `firebase-admin` → `jwks-rsa` (CJS) → `require('jose')` (ESM-only)
- `serverExternalPackages` não funciona com Turbopack
- Downgrade para v12 não resolveu (jose v4 também é ESM-only)

**Solução**: removido 100% do `firebase-admin` do Next.js. Substituído por REST APIs:
- `platform/lib/firebase/auth-rest.ts` — Auth completo via REST (verifyIdToken, createSessionCookie, getUser, listUsers, updateUser, deleteUser, revokeRefreshTokens)
- `platform/lib/firebase/firestore-rest.ts` — Firestore via REST (getCollection, deleteDoc, updateDocFields, querySubCollection)
- `platform/lib/firebase/admin.ts` — ESVAZIADO (só tem um comentário de stub)
- `scripts/set-admin-claim.ts` — ainda usa firebase-admin, mas roda só localmente via `npx tsx` (não afetado pelo Turbopack)

#### 2. Firebase client SDK inicializando durante SSR (RESOLVIDO)
`getAuth()` era chamado em nível de módulo em `client.ts`, causando `auth/invalid-api-key` durante o prerender do build.

**Solução**: `client.ts` agora inicializa Firebase só no browser via `typeof window !== 'undefined'`.

#### 3. NEXT_PUBLIC_FIREBASE_* vars estavam erradas no Vercel (RESOLVIDO)
As variáveis estavam com valores incorretos ou vazios desde o início. Agora configuradas corretamente:

| Variável | Valor |
|---|---|
| NEXT_PUBLIC_FIREBASE_API_KEY | AIzaSyC0HCqsCIdaBf4M_Quj2kHQ32BTokysRR4 |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | portugues-brasil-ple.firebaseapp.com |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | portugues-brasil-ple |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | portugues-brasil-ple.firebasestorage.app |
| NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | 199410587722 |
| NEXT_PUBLIC_FIREBASE_APP_ID | 1:199410587722:web:329850cbcd27c43a1a2eb3 |

#### 4. Último deploy
- Commit: `f3406ac`
- Status: **READY** — build passou limpo, todas as 12 rotas OK
- URL: https://platform-henna-nine.vercel.app

---

## PRÓXIMA SESSÃO — Retome exatamente aqui

### Passo 1 — Testar cadastro (não confirmado ainda)
Acesse https://platform-henna-nine.vercel.app/cadastro e crie conta com `viallamv@gmail.com`.

Se der erro: abrir DevTools → aba Network → olhar se aparece requisição para `identitytoolkit.googleapis.com` e copiar a mensagem de erro.

Se funcionar: continuar para Passo 2.

### Passo 2 — Definir papel admin
Após criar conta com sucesso, rodar no terminal do Claude Code:
```
! npx tsx platform/scripts/set-admin-claim.ts viallamv@gmail.com
```
Depois fazer logout e login novamente para o custom claim valer.

### Passo 3 — Verificar painel admin
Acessar https://platform-henna-nine.vercel.app/admin — deve listar alunos.

### Passo 4 — Testar lições
Acessar https://platform-henna-nine.vercel.app/licoes — deve funcionar sem erro 500.

### Passo 5 (opcional) — Google Sign-In
Firebase Auth já tem Google habilitado (confirmado nesta sessão). Falta apenas:
- Adicionar botão "Entrar com Google" nas páginas `/cadastro` e `/login`
- Usar `signInWithPopup(auth, new GoogleAuthProvider())` no cliente
- Nenhuma mudança server-side necessária

---

## Variáveis de ambiente no Vercel (estado atual)

Todas configuradas para Production:
```
FIREBASE_ADMIN_PROJECT_ID        = portugues-brasil-ple
FIREBASE_ADMIN_CLIENT_EMAIL      = firebase-adminsdk-fbsvc@portugues-brasil-ple.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY       = [chave gerada em 2026-06-24, configurada no Vercel]
SESSION_SECRET                   = [configurado]
NEXT_PUBLIC_FIREBASE_*           = [6 variáveis — valores na tabela acima]
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

## Commits desta sessão

```
f3406ac  Fix Firebase client init during SSR — only initialize in browser
3267e8f  Remove firebase-admin do Next.js; usa REST APIs para ERR_REQUIRE_ESM
eed2f53  Remove firebase-admin/auth — substitui por REST API + jsonwebtoken
```

---

## O que NÃO foi construído ainda

- Google Sign-In (botão na UI — Auth já habilitado no Firebase)
- Áudio TTS/STT
- Upload de produção oral
- Testes automatizados

---

## Como rodar localmente

```bash
cd platform
npm install
# .env.local precisa ter as variáveis FIREBASE_ADMIN_* e NEXT_PUBLIC_FIREBASE_*
npm run dev
```
