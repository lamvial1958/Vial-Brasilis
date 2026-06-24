# Handover — Plataforma PLE (Português Brasil)

Estado em 2026-06-24. Retome daqui sem perder contexto.

---

## Stack decidida (não muda)

- **Frontend + API routes**: Next.js 16 no Vercel (plano gratuito)
- **Auth + DB**: Firebase Auth + Firestore (plano Spark — gratuito)
- **Sem Firebase Blaze** até captação de clientes pagantes
- **Sem outros bancos** (Neon, Supabase, etc.) — só Firestore

---

## URLs

- **Produção**: https://platform-br.vercel.app
- **Vercel project**: luiz-antonio-m-vials-projects / platform-br
- **Firebase project**: portugues-brasil-ple

---

## O que foi feito nesta sessão

### Deploy realizado
- App Next.js deployado no Vercel com todas as rotas funcionando no build
- Homepage real implementada em `app/page.tsx` (hero + features + CTA)
- Projeto renomeado de "platform" para "platform-br" no Vercel
- Env vars configuradas no Vercel (todas as `NEXT_PUBLIC_FIREBASE_*` estão OK)
- `content/generated/` removido do `.gitignore` e commitado (50 JSONs pré-gerados)
- `next.config.ts` com `outputFileTracingIncludes` para incluir os JSONs no bundle serverless
- `scripts/build-content.ts` tolerante à ausência de `docs/conteudo/` (ambiente Vercel)

### Problema em aberto: Admin SDK não inicializa em produção

**Sintoma**: `DELETE /api/auth/session` e `GET /licoes` retornam 500.

**Causa raiz confirmada**: `FIREBASE_ADMIN_PRIVATE_KEY` está chegando com formato inválido ao `cert()` do Firebase Admin SDK. O erro exato no log do Vercel é:
```
Error: Failed to parse private key.
[cause]: Error: error:1E08010C:DECODER routines::unsupported
code: ERR_OSSL_UNSUPPORTED
```

**Tentativas feitas**:
- Corrigido BOM UTF-8 injetado pelo PowerShell 5.1 (usando ASCII encoding + stripBom no código)
- Normalização de CRLF → LF já implementada em `lib/firebase/admin.ts`
- Admin SDK refatorado para inicialização lazy (Proxy) — DELETE já não falha por causa do import

**O que falta para resolver**: o usuário precisa gerar uma **nova chave de serviço** do Firebase e colar no Vercel manualmente:

### PRÓXIMA SESSÃO — Passo a passo imediato

**1. Gerar nova chave de serviço (2 min)**
- Firebase Console → Project Settings → Service Accounts
- "Generate new private key" → baixa um `.json`

**2. Atualizar variáveis no Vercel (3 min)**
- Vercel → project platform-br → Settings → Environment Variables
- Deletar e recriar as 3 variáveis abaixo com os valores do JSON baixado:
  - `FIREBASE_ADMIN_PROJECT_ID` ← campo `project_id` do JSON
  - `FIREBASE_ADMIN_CLIENT_EMAIL` ← campo `client_email` do JSON
  - `FIREBASE_ADMIN_PRIVATE_KEY` ← campo `private_key` do JSON (colar valor inteiro)
- Também atualizar `.env.local` local com a nova chave

**3. Pedir deploy**
- Dizer "deploy" no chat — o agente dispara `vercel deploy --prod`

**4. Após deploy funcionar: promover admin**
- Cadastrar em https://platform-br.vercel.app/cadastro
- Rodar: `npx tsx scripts/set-admin-claim.ts viallamv@gmail.com`
- Fazer logout/login para o custom claim valer

---

## Arquitetura implementada (resumo)

- **Auth**: Firebase Auth email/senha no cliente → cookie httpOnly via `POST /api/auth/session`
- **Autorização**: `requireAdmin()` / `getSessionUser()` em Server Components + Firestore Security Rules
- **Lições**: 50 unidades (PRE-A1→B2) em JSON pré-gerado em `content/generated/`
- **SRS**: algoritmo SM-2 em `lib/srs/engine.ts`, UI em `app/revisao/`
- **Simulados**: campo texto livre, submissão salva no Firestore, correção manual pelo admin
- **Admin panel**: `/admin` lista alunos, `/admin/alunos/[uid]` mostra simulados e permite nota+feedback

## O que NÃO foi construído ainda

- Google Sign-In (Auth habilitado no Firebase mas sem botão na UI)
- Áudio TTS/STT
- Upload de produção oral
- Testes automatizados

## Como rodar localmente

```bash
cd platform
npm install
# .env.local já existe com credenciais — atualizar FIREBASE_ADMIN_PRIVATE_KEY após nova chave
npm run dev
```

## Como fazer deploy

```bash
cd platform
npx vercel deploy --prod
npx vercel alias set <url-gerada> platform-br.vercel.app
```
