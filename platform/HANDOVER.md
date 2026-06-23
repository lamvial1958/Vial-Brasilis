# Handover — Plataforma PLE (Português Brasil)

Estado em 2026-06-23. Este documento existe para que a próxima sessão (ou o
próprio Luiz) retome o trabalho sem perder contexto. A autorização para
construir a plataforma de ponta a ponta (não só desenhar a arquitetura) foi
dada explicitamente pelo usuário nesta sessão; ver `docs/ARQUITETURA_TI.md`
para as decisões de stack já fechadas.

## O que já está pronto e commitado

- **Conteúdo pedagógico**: 50 lições (PRE-A1 → B2) em `docs/conteudo/`,
  commitadas antes desta sessão.
- **`platform/`**: app Next.js 16 (App Router) completo, descrito abaixo.
- **Infraestrutura real provisionada** no projeto Firebase
  `portugues-brasil-ple` (Firestore habilitado, regras de segurança
  deployadas, Storage configurado em código mas bucket ainda não criado —
  ver "Pendências manuais").

## Arquitetura implementada

- **Conteúdo**: pipeline `npm run build:content` (roda automaticamente em
  `predev`/`prebuild`) lê os 50 `.md` em `../docs/conteudo/{nivel}/*.md` e
  gera JSON em `platform/content/generated/` (gitignored, reconstruído a
  cada build). Parser em `lib/content/parse.ts` é deliberadamente
  best-effort/genérico (não um schema rígido por arquivo) para tolerar a
  variação de formatação entre os 50 arquivos escritos à mão.
- **Auth**: Firebase Auth (e-mail/senha + verificação de e-mail) no cliente
  (`lib/firebase/client.ts`), trocado por um cookie de sessão httpOnly via
  `POST /api/auth/session` (`lib/firebase/session.ts`), lido nas Server
  Components/rotas protegidas via `getSessionUser()` / `requireAdmin()`.
  Papel (`role: admin|student`) fica em **custom claims** do Firebase Auth,
  não em Firestore — então promover/revogar admin exige rodar
  `scripts/set-admin-claim.ts` (Admin SDK), não dá para fazer pelo painel.
- **Autorização**: dupla camada — guarda no servidor (`requireAdmin`,
  `layout.tsx` de `/licoes`, `/revisao`, `/admin`) **e** Firestore Security
  Rules (`firestore.rules`, já deployadas) usando
  `request.auth.token.role`.
- **Bloqueio de conta**: usa o campo nativo `disabled` do Firebase Auth
  (não um campo customizado), mais `revokeRefreshTokens` para invalidar
  sessões já emitidas. Ver `app/api/admin/students/[uid]/block/route.ts`.
- **Lições**: `app/licoes/[nivel]/[slug]/page.tsx` renderiza as seções de
  cada unidade (Markdown genérico) exceto "Exercícios", que usa
  `<ExerciciosReveal>` (toggle de gabarito por item). Botão "Marcar
  concluída" (`components/MarcarConcluida.tsx`) grava em
  `progress/{uid}` **e** semeia `srsItems/{uid}/items/{id}` a partir do
  vocabulário da unidade.
- **SRS (revisão espaçada)**: algoritmo puro tipo SM-2 em
  `lib/srs/engine.ts`. UI em `app/revisao/page.tsx` — busca itens com
  `proximaRevisaoEm <= agora` em `srsItems/{uid}/items`, mostra flashcard,
  e ao avaliar (Não lembrei/Difícil/Bom/Fácil) recalcula e grava a próxima
  data de revisão.
- **Simulados cronometrados**: unidades com `tipo: "simulado"` (detectado
  por regex no título/slug) ganham `<SimuladoCronometro>` na página da
  unidade. O tempo sugerido total é somado automaticamente a partir das
  tabelas "Tempo sugerido" do Markdown (`extrairTempoSugeridoMin` em
  `lib/content/parse.ts`). **Decisão deliberada**: por causa da grande
  variação estrutural entre os 4 arquivos de simulado existentes (B1.11,
  B1.12, B2.09, B2.10), não tentei extrair tarefa-por-tarefa — o aluno
  escreve tudo em um único campo de texto livre, que é salvo em
  `simuladoSubmissions/{uid}/attempts/{attemptId}` ao finalizar.
- **Painel do admin** (`/admin`): lista alunos (e-mail, datas, unidades
  concluídas, status), com ações de bloquear/desbloquear e excluir
  (`components/admin/AlunoActions.tsx`). Página de detalhe
  `/admin/alunos/[uid]` lista os simulados enviados por aquele aluno e
  permite atribuir nota (0–10) + feedback em texto livre
  (`components/admin/CorrecaoTentativa.tsx`), que grava `status:
  "corrigido"` na tentativa. Não há correção automática — é sempre o
  admin que avalia, dado que as produções são texto livre.

## O que NÃO foi construído (fora do escopo desta sessão)

- Áudio de TTS/STT via Vercel AI Gateway (mencionado na arquitetura, mas
  nenhum endpoint de áudio foi implementado ainda).
- Upload de produção oral do aluno (`storage.rules` já prevê
  `/producao-oral/{uid}/**`, mas não há UI nem bucket criado ainda).
- Rate limiting / proteção anti-bot além do Firebase App Check (cujo
  site key ainda não foi registrado — ver pendências).
- Testes automatizados (nenhum framework de teste foi configurado).
- Deploy no Vercel (acesso MCP confirmado funcionando, mas nenhum deploy
  foi disparado ainda).

## Pendências manuais (exigem ação humana com navegador/pagamento)

Estas são as únicas três coisas que eu, agindo de forma autônoma, não pude
resolver — todas exigem uma sessão de navegador real ou dados de pagamento,
que estão fora do que devo fazer sem confirmação explícita:

1. **Habilitar Firebase Authentication pelo Console.**
   Acesse https://console.firebase.google.com/project/portugues-brasil-ple/authentication
   e clique em "Get started" (ativa o provedor E-mail/Senha — já vem
   habilitado por padrão depois desse clique; se não vier, habilite
   manualmente "E-mail/senha"). Sem isso, login/cadastro no app falham
   com erro de configuração.

2. **Upgrade para o plano Blaze (faturamento) para habilitar o Storage.**
   O bucket de Storage não existe ainda porque a criação via API retornou
   `billing account ... disabled`. Acesse
   https://console.firebase.google.com/project/portugues-brasil-ple/usage/details
   e faça upgrade para Blaze (tem nível gratuito generoso; só cobra acima
   da cota). Depois disso, peça para eu rodar
   `npx firebase deploy --only storage --project portugues-brasil-ple`
   (o arquivo `storage.rules` já está escrito e pronto).

3. **Registrar o site key do Firebase App Check (anti-bot).**
   Acesse https://console.firebase.google.com/project/portugues-brasil-ple/appcheck
   e registre o app Web com reCAPTCHA v3 (ou Enterprise). Copie o site key
   para `NEXT_PUBLIC_APPCHECK_SITE_KEY` em `platform/.env.local` (e nas
   env vars do Vercel, quando o deploy existir). Até lá, App Check fica
   inativo (`lib/firebase/app-check.ts` é um no-op enquanto a chave
   estiver vazia) — o app funciona, só sem essa camada extra anti-bot.

## Como rodar localmente

```
cd platform
npm install        # se ainda não rodou
cp .env.example .env.local   # e preencha com as credenciais reais
                              # (peça ao Luiz ou veja o Firebase Console
                              # em Configurações do projeto > Geral, e
                              # Contas de serviço para o Admin SDK)
npm run dev
```

## Como promover o primeiro admin

1. Cadastre-se normalmente em `/cadastro` com o e-mail que será admin.
2. Rode: `npx tsx scripts/set-admin-claim.ts seu-email@exemplo.com`
3. Faça logout/login de novo (custom claims só valem em um novo token).

## Próximos passos sugeridos (não iniciados)

- Deploy no Vercel (`mcp__plugin_vercel_vercel__deploy_to_vercel` já
  testado e funcionando para a conta do Luiz — time "Luiz Antonio M
  Vial's projects"). Precisa configurar as env vars de `.env.example` no
  projeto Vercel antes do primeiro deploy.
- Depois do Storage habilitado (pendência #2), implementar upload de
  produção oral e TTS de exemplos de pronúncia via Vercel AI Gateway.
- Considerar paginação em `/admin` se a base de alunos crescer muito
  (hoje lista todos via `listUsers(1000)`, sem paginação).
