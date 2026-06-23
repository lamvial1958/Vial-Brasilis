# Arquitetura de TI — Esboço (Draft)

> Documento de referência da arquitetura técnica do curso de PLE. Complementa `PROJETO_BASE.md` (arquitetura pedagógica, já validada para PRE-A1 → B2). Este documento está em fase de **esboço/discussão** — nenhuma linha de código foi escrita ainda. Decisões marcadas como "fechada" foram validadas em conversa com o responsável pelo projeto; o resto é proposta sujeita a revisão.

**Status:** Esboço inicial, em discussão.
**Última atualização:** 2026-06-23 (stack de dados/auth revisada para Firebase)

---

## 1. Decisões Já Fechadas

| Decisão | Resolução |
|---|---|
| Modelo de acesso | Gratuito, cadastro aberto por e-mail (sem convite, sem aprovação manual por padrão) |
| Verificação de conta | E-mail precisa ser confirmado antes da conta ficar ativa |
| Defesa contra bots/spam | Verificação de e-mail + CAPTCHA leve no cadastro (via Firebase App Check) + rate limiting por IP no endpoint de cadastro |
| Papel de administrador | Uma única conta (a do responsável pelo projeto) com papel `admin`; todo o restante é `student` por padrão |
| Capacidades do admin | Visualizar lista de inscritos, acompanhar progresso individual (unidades concluídas, notas de simulado, etc.), bloquear acesso e eliminar conta |
| Abordagem de stack | Stack desenhado para as necessidades específicas deste projeto. Reaproveita o Firebase do `piattaforma-italiano-v2` (Auth + Firestore + Storage), mas não herda o restante daquela stack (front-end, modelo de exercícios, etc.) |

---

## 2. Stack Recomendado

| Camada | Escolha recomendada | Por quê |
|---|---|---|
| Framework/hosting | **Next.js (App Router) na Vercel** | Renderização híbrida (conteúdo estático das lições + áreas autenticadas dinâmicas), deploy/preview integrados, ecossistema maduro para o que vem a seguir (auth, storage, IA). |
| Autenticação | **Firebase Auth** | Cadastro por e-mail com verificação nativa, claims customizadas (para o papel `admin`/`student` e o status `ativo`/`bloqueado`), já validado em produção no projeto de referência italiano — reduz risco de adoção. |
| Banco de dados | **Firestore** | Progresso do aluno, estado do SRS, tentativas de simulado, metadados de conta. Modelo de documento por aluno é natural para progresso/SRS; consultas de admin (listar/filtrar inscritos) exigem modelar índices compostos desde o início — ver nota abaixo. |
| Armazenamento de mídia | **Firebase Storage** | Áudio de TTS pré-gerado (diálogos/listening) e eventualmente gravações de produção oral dos alunos. |
| Defesa contra bots no cadastro | **Firebase App Check** (com reCAPTCHA/Turnstile como provedor de atestação) | Implementa a defesa de CAPTCHA decidida na Seção 1, integrada nativamente ao Auth/Firestore — sem precisar orquestrar um serviço de CAPTCHA separado. |
| Camada de IA (TTS/STT, e futuramente correção assistida) | **Vercel AI Gateway** como ponto único de acesso a provedores | Evita amarrar o projeto a um único fornecedor de TTS/STT desde o início; troca de provedor sem reescrever a aplicação. Continua na Vercel mesmo com dados/auth no Firebase — são camadas independentes. |

**Nota sobre Firestore para o painel do admin:** como o Firestore é NoSQL, a consulta "listar todos os inscritos, com status e progresso resumido" precisa de uma coleção própria pensada para isso (ex.: um documento-resumo por aluno, atualizado a cada mudança de progresso), em vez de agregar em tempo real sobre os dados detalhados de cada aluno. É uma decisão de modelagem a tomar na hora de implementar, não um bloqueio.

---

## 3. Camada de Conteúdo — De Markdown a Dados

As 60 lições já escritas (`docs/conteudo/**/*.md`) seguem um template rígido e consistente (diálogo/cenário → vocabulário → gramática/função → pronúncia → exercícios com gabarito → listening/leitura → produção final → glossário). Isso é uma vantagem real: **o conteúdo não precisa ser reescrito**, só convertido.

**Pipeline proposto:**
1. Um script de build (rodado uma vez, e re-executado a cada edição de conteúdo) faz o parse de cada `.md` e gera um JSON estruturado por unidade, seguindo um schema fixo (`dialogo`, `vocabulario[]` com tags para o SRS, `gramatica[]`, `exercicios[]` com gabarito, `listening{script, perguntas}`, `producaoFinal{tarefa, checklist}`, `glossario[]`).
2. Esse JSON é o que a aplicação efetivamente consome — o Markdown continua sendo a fonte de verdade/autoria, o JSON é artefato de build (parecido com o papel do `exercises.json` no projeto de referência italiano, só que gerado automaticamente em vez de escrito à mão).
3. Conteúdo é estático e versionado no Git — não precisa de banco de dados para as lições em si, só para o progresso de cada aluno sobre elas.

**Ponto de atenção:** as unidades de simulado (B1.11/12, B2.9/10 e equivalentes) têm uma estrutura diferente (estímulo → comando, script de listening, roteiro de entrevista, rubrica, relatório de lacunas) — o schema precisa de uma variante própria para esse tipo de unidade, não cabe no schema das lições regulares.

---

## 4. Módulos Funcionais

### 4.1 Motor de Exercícios
Componentes genéricos de UI por tipo de exercício (completar lacuna, transformação, escolha/classificação, associação) que leem o array `exercicios[]` do JSON da unidade e mostram o gabarito após resposta — generaliza o padrão já presente em todas as 60 lições.

### 4.2 Motor de SRS (repetição espaçada)
O vocabulário já vem etiquetado por unidade/tema desde a autoria (`tag b2.1`, `tag registro`, `tag regional`, etc.). O motor de SRS usa essas tags para agendar revisões por aluno (algoritmo tipo SM-2: cada item tem `próxima revisão`, `fator de facilidade`, ajustados pela resposta do aluno). Estado fica no Firestore, num documento por aluno.

### 4.3 Motor de Simulado
Fluxo cronometrado e multi-etapa (Tarefa Escrita 1 → Tarefa Escrita 2 → Compreensão Oral Integrada → Parte Oral), com o tempo controlado **no servidor** (não só no navegador, para não dar pra "pausar" recarregando a página). Submissões ficam salvas; a correção inicial é manual (o admin/instrutor vê e pontua pela rubrica já definida em cada unidade de simulado); correção assistida por IA é uma evolução possível, não obrigatória no MVP.

### 4.4 Painel do Admin
Rota protegida (`papel = admin`), com:
- Lista de inscritos (busca/filtro)
- Progresso individual por aluno (unidades concluídas, SRS, notas de simulado)
- Ações: bloquear (reversível) e eliminar conta (decisão pendente — ver Seção 5)

### 4.5 TTS/STT
- **TTS**: geração em lote (não em tempo real) do áudio de diálogos e scripts de listening — roda uma vez por unidade, fica armazenado no Vercel Blob, não gera custo/latência por aluno.
- **STT**: uso ao vivo, para as tarefas de produção oral e para o role-play/parte oral dos simulados — aqui sim é por aluno, em tempo real.

---

## 5. Decisões Pendentes (próxima rodada de validação)

| Decisão | Opções a pesar |
|---|---|
| Provedor de TTS para PT-BR | Qualidade de voz neutra vs. necessidade de sotaques regionais (relevante para a B2.4 — variação regional) |
| Provedor de STT para PT-BR | Precisão para fala de não-nativos/sotaque estrangeiro é o critério mais importante aqui, não só custo |
| "Eliminar" conta = apagar de fato ou desativar mantendo histórico? | Apagar de fato é mais simples de implementar mas é irreversível; desativar preserva dado para reverter, exige decisão sobre retenção |
| Escopo da correção do simulado no MVP | Só manual (admin/instrutor pontua) vs. já incluir sugestão assistida por IA desde o início |
| Algoritmo exato do SRS | SM-2 clássico vs. uma variante simplificada própria do projeto |

---

## 6. Fora de Escopo do Esboço Atual

- Qualquer decisão de monetização futura (o modelo atual é gratuito; se isso mudar, billing entra como camada nova, não retrabalho desta arquitetura)
- C1/C2 (congelados, conforme `PROJETO_BASE.md`)
