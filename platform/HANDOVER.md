# Handover — Plataforma VIAL Brasilis PLE

Estado em 2026-06-26 (fim de sessão). Retome daqui sem perder contexto.

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

## Estado atual — tudo funcional (2026-06-26)

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

---

## Design visual (2026-06-26)

Inspiração: `piattaforma-italiano-v2` (estrutura de grid + hero card com borda esquerda).
Paleta: cores da bandeira do Brasil — verde-amarelo dominante, azul como apoio.

### Paleta por nível

| Nível | Cor hex   | Uso                                      |
|-------|-----------|------------------------------------------|
| PRE-A1 | `#FFDF00` | Amarelo bandeira — borda, badge, hover  |
| A1     | `#3DA35D` | Verde médio                             |
| A2     | `#009C3B` | Verde bandeira                          |
| B1     | `#002776` | Azul bandeira (marco CELPE-Bras)        |
| B2     | `#1351B4` | Azul médio                              |

**Regra de contraste:**  
- Texto *sobre fundo branco* (`textoDestaqueHex`): cor do nível para verde/azul; **preto** `#1a1a1a` para amarelo.  
- Texto *sobre fundo da cor do nível* (`textoSobreNivelHex`): branco para verde/azul; **preto** `#1a1a1a` para amarelo.  
- CSS variable `--cor-nivel-texto` injetada via `<style>` no Server Component da lição — usada para cabeçalhos de tabela.

### Arquivos de design

| Arquivo | Responsabilidade |
|---------|-----------------|
| `app/licoes/[nivel]/page.tsx` | Grid 4 colunas de cards quadrados + hero card com borda esquerda colorida |
| `app/licoes/[nivel]/[slug]/page.tsx` | Cards por seção com h2 colorido + hero da lição |
| `app/globals.css` | Estilos de `.conteudo-licao`: tabelas, blockquotes, texto em negrito |
| `components/MarcarConcluida.tsx` | Botão verde pill-shaped com sombra |
| `components/ExerciciosReveal.tsx` | Cards brancos com botão gabarito bicolor + SttPronuncia por exercício |

### Fundo de página

`bg-gradient-to-br from-[#f3f8f4] to-[#eef3fa]` — gradiente muito sutil verde→azul, evoca a bandeira sem distrair.

---

## Limpeza de conteúdo feita em sessão anterior

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

## TTS/STT — Web Speech API (2026-06-26)

### Componentes

| Componente | Arquivo | Função |
|---|---|---|
| `TtsButton` | `components/TtsButton.tsx` | Lê seção em voz alta (pt-BR, rate 0.88) |
| `SttPronuncia` | `components/SttPronuncia.tsx` | Microfone no exercício — transcreve e compara com gabarito |

### Como funciona o TtsButton

1. Se existir `/public/audio/[nivel]/[slug]/secao-N.mp3` → toca o arquivo (voz gravada)
2. Se não existir → usa `window.speechSynthesis` (síntese do browser)
3. O Server Component faz `fs.existsSync` para passar `audioUrl` apenas quando o arquivo existe

### Para usar sua própria voz gravada

Grave um MP3 de qualquer aplicativo (Audacity, gravador do celular, etc.) e salve em:
```
platform/public/audio/[nivel]/[slug]/secao-N.mp3
```
Exemplo: `public/audio/pre-a1/00-ferramentas-basicas-i/secao-1.mp3`

O botão "Ouvir" detecta e toca automaticamente. Sem configuração adicional.

### Limitações da Web Speech API

- **TTS**: qualidade de voz depende do OS (Windows: vozes Microsoft Maria/Daniel; Mac: vozes Apple)
- **STT** (`SttPronuncia`): só funciona em Chrome/Edge — não disponível em Firefox/Safari
- STT renderiza `null` automaticamente em browsers sem suporte

### Upgrade futuro (quando houver alunos pagantes)

Trocar o provider no `TtsButton` por OpenAI TTS (`tts-1`, voz `nova`) via API route — sem mudar a interface do componente.

---

## Produção escrita (2026-06-26)

Aluno envia texto livre nas seções "Tarefa de Produção Final" de cada lição. Professor corrige via painel admin.

### Firestore

Coleção: `producaoEscrita/{uid}/submissions/{submissaoId}`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nivel` | string | Ex.: `"pre-a1"` |
| `slug` | string | Ex.: `"00-ferramentas-basicas-i"` |
| `secaoOrdem` | number | Número da seção dentro da lição |
| `secaoTitulo` | string | Título exibido na lição |
| `texto` | string | Texto do aluno |
| `enviadoEm` | timestamp | Data do envio (serverTimestamp) |
| `status` | `"pendente"` \| `"corrigido"` | |
| `nota` | number \| null | 0–10 (opcional) |
| `feedback` | string | Comentário do professor |
| `feedbackEm` | string \| null | ISO date da correção |

O `submissaoId` é determinístico: `${nivel}-${slug}-secao${secaoOrdem}`. Um aluno tem **uma submissão por seção**; reenvio sobrescreve e volta para `"pendente"`.

### Componentes

| Arquivo | Responsabilidade |
|---------|-----------------|
| `components/ProducaoEscritaForm.tsx` | Formulário cliente: lê/escreve no Firestore SDK; mostra textarea, contador de palavras, feedback quando corrigido |
| `components/admin/CorrecaoProducao.tsx` | Card admin: exibe texto do aluno, campos nota + feedback, botão salvar |
| `app/api/admin/producao/[uid]/[submissaoId]/route.ts` | `PATCH` — admin atualiza nota + feedback + status |
| `lib/admin/producao.ts` | `listarSubmissoes(uid)` — query server-side via REST |

### Fluxo

1. Aluno abre lição → seção "Tarefa de Produção Final" exibe a tarefa + `ProducaoEscritaForm` abaixo
2. Aluno escreve e clica "Enviar para correção" → `setDoc` no Firestore com `status: "pendente"`
3. Admin acessa `/admin/alunos/[uid]` → lista todas as produções (pendentes em destaque)
4. Admin preenche nota + feedback → `PATCH /api/admin/producao/[uid]/[submissaoId]` → `status: "corrigido"`
5. Aluno reabre a lição → vê "Corrigido", nota e feedback; pode reenviar nova versão

---

## Testes automatizados (Playwright E2E) — concluído 2026-06-26

11 testes passando contra produção (`PLAYWRIGHT_BASE_URL=https://platform-henna-nine.vercel.app`).

| Arquivo | Cobertura |
|---------|-----------|
| `tests/e2e/auth.spec.ts` | Login, redirecionamento sem auth, página de login acessível |
| `tests/e2e/lesson.spec.ts` | Navegação de lições, gabarito reveal, formulário de produção escrita |

Para rodar: `npm run test:e2e` (dentro de `platform/`).  
Para criar o usuário de teste: `npx tsx scripts/create-test-user.ts`.

---

## O que ainda não foi construído

- Sistema de pagamento / acesso por matrícula (fora do escopo atual)
- SRS ativo (repetição espaçada — os itens são estruturados mas não há motor de revisão)
