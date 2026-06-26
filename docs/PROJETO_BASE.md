# Projeto Base — Curso de Português do Brasil para Estrangeiros (PLE)

> Documento de referência da arquitetura pedagógica do curso. Toda decisão estrutural validada até o momento está registrada aqui. Antes de propor qualquer mudança de estrutura, leia este documento primeiro.

**Status:** Pedagogicamente validado para os níveis PRE-A1 a B2. Conteúdo de lição completo construído para todos os níveis do escopo atual (PRE-A1 → B2). Camada de TI/plataforma em implementação incremental — ver Seção 11.
**Última atualização:** 2026-06-26

---

## 1. Missão e Persona do Projeto

Para este projeto, atua-se como a maior sumidade global em Engenharia Pedagógica, Design Instrucional e Aquisição de Segunda Língua (SLA) — especialista renomado na criação de plataformas de ensino digital de alta performance, capaz de transformar metodologias complexas em experiências de aprendizado intuitivas, escaláveis e altamente eficazes.

**Missão:** estruturar o esqueleto completo de um novo curso de Português do Brasil para Estrangeiros (PLE), priorizando a arquitetura pedagógica antes de qualquer decisão de tecnologia/TI.

---

## 2. Fontes de Benchmarking

**Interno:** projeto `piattaforma-italiano-v2` — usado como referência de arquitetura de informação, UX pedagógica e lógica de exercícios. Stack legado: HTML/CSS/JS vanilla + Tailwind, Firebase (Auth+Firestore), Vercel. Reescrita V2 em React/Vite, com motor de exercícios orientado a dados (`exercises.json`), TTS/STT nativos, e sistema de roles (admin/instructor/student).

**Externo:** pesquisa de mercado e literatura acadêmica cobrindo Duolingo, Babbel, Busuu (incluindo estudo comparativo Busuu 2025 e estudo Cambridge SLA sobre Duolingo), Input Hypothesis de Krashen e suas críticas recentes (neuro-ecológicas), Task-Based Language Teaching, frameworks CEFR e ACTFL (can-do statements), e o sistema oficial brasileiro de certificação CELPE-Bras (MEC/INEP).

---

## 3. Crítica Severa ao Modelo de Referência

### Pontos fortes a preservar
- Ciclo Corso → Esercizi → Test por nível (presentation-practice-production sólido).
- Integração nativa de TTS/STT (diferencial real — maioria dos apps de mercado foca em compreensão, não produção).
- Motor de exercícios orientado a dados (JSON), escalável para autoria de conteúdo.

### Falhas estruturais identificadas
1. **Níveis são "containers", não espinha pedagógica.** PRE-A1→C2 é rótulo de pastas, sem objetivos can-do, progressão funcional ou backward design a partir de tarefas reais.
2. **"Mini-Corsi" desconectados da trilha principal.** Ensinar gramática em blocos temáticos isolados e paralelos (todo o verbo, todo o substantivo...) contraria a evidência de task-based teaching — gramática deve servir a uma função comunicativa do nível, não existir como trilha concorrente.
3. **Risco da "armadilha Duolingo".** Pesquisa confirma usuários com streaks de 1.000+ dias incapazes de manter conversa básica. Sem produção oral/escrita estruturada, alta retenção pode coexistir com baixa proficiência real.
4. **Ignora o ativo estratégico do português: o CELPE-Bras.** Diferente do italiano (CILS/CELI/PLIDA certificam desde A1), o único certificado oficial brasileiro (CELPE-Bras, MEC/INEP) **só certifica a partir do B1** (Intermediário=B1, Intermediário Superior=B2, Avançado=C1, Avançado Superior=C2). Copiar uma estrutura simétrica de níveis desperdiça a maior alavanca de motivação extrínseca disponível.
5. **Ambiguidade de modelo de negócio/identidade pedagógica.** Legado fortemente gated (anti-pirataria, autorização por role) vs. reescrita V2 anunciada como gratuita/open-source — contradição não resolvida que afetaria decisões pedagógicas (conteúdo livre vs. sequencial/bloqueado).
6. **Sem tratamento explícito de registro e variação sociolinguística.** Para português brasileiro isso é núcleo, não acessório: distância grande entre formal/informal, predominância oral de "você" vs. paradigmas formais com "tu", forte variação regional.
7. **Sem motor de repetição espaçada (SRS).** Banco de exercícios estático, sem revisão adaptativa — um dos poucos fatores com evidência consistente de impacto em retenção de longo prazo.

---

## 4. Linha Pedagógica Adotada

Síntese deliberada de quatro correntes, cada uma mitigando a fraqueza da outra:

| Corrente | Contribuição | Falha que mitiga |
|---|---|---|
| CEFR Action-Oriented (can-do statements) | Cada unidade definida por uma tarefa real, não um tópico de gramática | #1 |
| Task-Based Language Teaching (TBLT) | Gramática/vocabulário a serviço de uma tarefa comunicativa | #2 |
| Comprehensible Input (i+1) + Produção Estruturada | Input compreensível combinado obrigatoriamente com produção ativa | #3 |
| Spiral Curriculum + SRS | Léxico e estruturas reciclados ciclicamente, vocabulário em repetição espaçada | #7 |

**Decisão estrutural central:** abandono do modelo "nível + mini-corsi paralelo". Adoção de **4 strands transversais** em toda unidade de todo nível:
1. Função & Gramática-em-contexto
2. Léxico & Repetição Espaçada (SRS)
3. Som & Compreensão (fonética/nasalização/listening)
4. Produção Oral & Escrita

O equivalente aos "Mini-Corsi" sobrevive apenas como camada de referência/revisão cross-linked às unidades — nunca como pilar estrutural concorrente.

---

## 5. Correção Estratégica: o Eixo B1/CELPE-Bras

Hipótese inicial **rejeitada** após verificação: visto de trabalho no Brasil **não exige** CELPE-Bras/B1 como regra geral (concessão baseada em qualificação profissional e contrato, não em proficiência linguística). Exigências de CELPE-Bras por conselhos profissionais específicos (ex.: medicina) são pontuais e em retração.

**Motivador real e verificado para o B1:** o CELPE-Bras Intermediário (B1) é o nível mínimo de proficiência **oficialmente exigido para naturalização brasileira (cidadania)**, e é amplamente exigido para **ingresso em universidades brasileiras** por estrangeiros. Esse é o motivador a comunicar ao aluno — não "visto de trabalho".

O B1 permanece o eixo gravitacional do curso (primeiro marco com validação institucional externa real), agora com a alavanca motivacional correta.

---

## 6. Escopo do Curso

**Construído agora:** PRE-A1 → B2.
**Congelado:** C1 e C2 — não serão desenvolvidos, planejados ou esboçados neste momento. Só entram em pauta mediante solicitação formal futura, tratados como extensão pontual, sem retrabalho da estrutura existente.

| Nível | Nome interno | Foco motivacional | Marco de saída |
|---|---|---|---|
| PRE-A1 | Sobrevivência | Uso imediato (chegar, se apresentar, pedir ajuda) | Checkpoint de portfólio |
| A1 | Conexão | Rotina, necessidades básicas, primeiras relações | Checkpoint de portfólio |
| A2 | Autonomia | Resolver situações do dia a dia sem ajuda | Checkpoint de portfólio + ponte para B1 |
| B1 | Integração (Gate CELPE-Bras) | Naturalização brasileira e ingresso acadêmico | Simulado oficial CELPE-Bras (Intermediário) |
| B2 | Fluência social | Argumentar, narrar, registro formal/informal | Simulado CELPE-Bras (Intermediário Superior) |
| ~~C1~~ | ~~Domínio profissional/acadêmico~~ | — | **Fora de escopo** |
| ~~C2~~ | ~~Maestria~~ | — | **Fora de escopo** |

---

## 7. Esqueleto de Unidades (50 unidades, PRE-A1 → B2)

> **Detalhamento completo (ficha de unidade por unidade, seguindo o template da Seção 8) disponível em `docs/unidades/`:** [pre-a1.md](unidades/pre-a1.md) · [a1.md](unidades/a1.md) · [a2.md](unidades/a2.md) · [b1.md](unidades/b1.md) · [b2.md](unidades/b2.md). As tabelas abaixo são o resumo executivo; os arquivos por nível são a fonte de verdade.

### PRE-A1 — Sobrevivência (8 unidades)

| # | Unidade | Objetivo Can-Do | Foco funcional |
|---|---|---|---|
| 0 | Ferramentas Básicas I | Sei soletrar, contar (0–1.000+) e usar o sistema métrico | Alfabeto, sílabas, números/decimais, metro/quilo/litro/grau Celsius |
| 1 | Primeiro Contato | Sei me apresentar e saudar | Pronúncia-base, nasalização inicial |
| 2 | Chegando ao Brasil | Sei passar pela imigração e pedir transporte | Frases fixas, perguntas sim/não, direções básicas |
| 3 | Na Acomodação | Sei resolver problemas práticos de hospedagem | Pedidos com "por favor/preciso de", vocabulário de quarto/hotel |
| 4 | Comendo e Bebendo | Sei pedir e pagar em restaurante/padaria | Números (preços), cardápio, expressões de cortesia |
| 4b | Ferramentas Básicas II | Sei marcar uma data e descrever objetos pela cor | Dias da semana, meses do ano, cores básicas |
| 5 | Ajuda e Emergência | Sei pedir socorro e entender uma resposta | Frases de emergência, telefones úteis, compreensão auditiva curta |
| 6 | Pequenas Compras | Sei comprar, perguntar preço, agradecer/desculpar-me | Mercado/farmácia, marcadores de polidez |

### A1 — Conexão (10 unidades)

| # | Unidade | Objetivo Can-Do | Foco funcional |
|---|---|---|---|
| 1 | Quem Sou Eu | Sei me apresentar de forma completa | Verbo ser, nacionalidade, profissão |
| 2 | Família e Amigos | Sei descrever pessoas próximas | Possessivos, parentesco, adjetivos descritivos |
| 3 | Minha Rotina | Sei contar minha rotina diária | Presente do indicativo regular, horários |
| 4 | Casa e Bairro | Sei descrever onde moro | Preposições de lugar, mobília |
| 5 | Tempo e Estações | Sei falar do clima e me vestir adequadamente | Vocabulário climático, "estar com frio/calor" |
| 6 | Trabalho e Estudos | Sei falar da minha ocupação | Profissões, vocabulário escolar |
| 7 | Lazer e Fim de Semana | Sei falar do que gosto de fazer | Verbos de preferência (gostar de, preferir) |
| 8 | Saúde Básica | Sei explicar um sintoma e pedir ajuda médica | Corpo humano, "estar com dor", farmácia |
| 9 | Planos e Convites | Sei convidar, aceitar e recusar | Futuro perifrástico (ir + infinitivo) |
| 10 | Projeto Integrador A1 | Apresento-me em vídeo/áudio de forma fluente | Revisão cumulativa + celebração de marco |

### A2 — Autonomia (10 unidades)

| # | Unidade | Objetivo Can-Do | Foco funcional |
|---|---|---|---|
| 1 | Contando o que Aconteceu | Sei narrar um evento passado simples | Pretérito perfeito regular |
| 2 | Verbos Irregulares no Passado | Sei narrar com os verbos mais frequentes | Ser, ir, ter, fazer, estar no perfeito |
| 3 | Comparando e Avaliando | Sei comparar e dar opinião simples | Comparativo/superlativo |
| 4 | Instruções e Indicações | Sei dar e seguir instruções | Imperativo, indicações de rua |
| 5 | Burocracia do Dia a Dia | Sei resolver banco, correio, documentos | Vocabulário institucional, linguagem formal básica |
| 6 | Saúde e Bem-Estar | Sei detalhar uma consulta médica | Sintomas, recomendações, "deveria/precisa" |
| 7 | Viagens pelo Brasil | Sei planejar e relatar uma viagem | Transporte, geografia, reservas |
| 8 | Comida e Cultura à Mesa | Sei pedir e comentar pratos regionais | Vocabulário gastronômico regional |
| 9 | Lembranças e Hábitos Passados | Sei comparar passado e presente | Pretérito imperfeito |
| 10 | Ponte para o B1 | Narro uma experiência (oral + escrita) combinando perfeito/imperfeito | Diagnóstico de prontidão para B1 |

### B1 — Integração / Gate CELPE-Bras (12 unidades)

Unidades desenhadas para espelhar os gêneros textuais reais do exame (carta/e-mail, fórum de opinião, entrevista oral).

| # | Unidade | Objetivo Can-Do | Foco funcional |
|---|---|---|---|
| 1 | Entendendo a Tarefa Integrada | Compreendo o formato ouvir/ler→responder por escrito do exame | Orientação de tarefa, treino de formato |
| 2 | E-mail e Carta Pessoal | Escrevo para dar/pedir notícias a um amigo | Gênero carta informal |
| 3 | Reclamando e Resolvendo | Escrevo uma reclamação formal eficaz | Carta formal, vocabulário de serviços |
| 4 | Opinião em Fóruns | Defendo um ponto de vista por escrito | Conectores argumentativos |
| 5 | Narrando uma Experiência | Combino tempos verbais ao narrar | Perfeito + imperfeito, marcadores temporais |
| 6 | Subjuntivo Presente | Expresso desejo, dúvida e recomendação | Subjuntivo em pedidos/conselhos |
| 7 | Linguagem de Notícia | Compreendo textos jornalísticos | Voz passiva, leitura interpretativa |
| 8 | **Registro Formal vs. Informal** | Adapto minha linguagem ao contexto | Strand sociolinguístico em foco total — ver unidade-piloto detalhada na Seção 8 |
| 9 | Debatendo Temas Sociais | Argumento sobre temas atuais do Brasil | Vocabulário de atualidade, conectores |
| 10 | Entrevista Oral | Interajo numa entrevista oral simulada | Simulação da parte oral (interação, não monólogo) |
| 11 | Simulado Completo #1 | Realizo o exame completo como diagnóstico | Identificação de lacunas |
| 12 | Revisão Direcionada + Simulado #2 | Atinjo o nível de aprovação do CELPE-Bras Intermediário | **Marco de saída B1** |

### B2 — Fluência Social (10 unidades)

| # | Unidade | Objetivo Can-Do | Foco funcional |
|---|---|---|---|
| 1 | Hipóteses e Condições | Falo de situações hipotéticas | Subjuntivo passado/futuro, condicional |
| 2 | Discurso Indireto | Relato o que outra pessoa disse | Transposição de discurso direto→indireto |
| 3 | Argumentação Avançada | Construo um texto dissertativo coeso | Conectores argumentativos avançados |
| 4 | Variação Regional do PT-BR | Compreendo sotaques e vocabulário regional | Strand sociolinguístico avançado |
| 5 | Português no Trabalho | Participo de reuniões e e-mails corporativos | Registro profissional |
| 6 | Mídia e Atualidades | Interpreto notícia, podcast, debate | Compreensão auditiva avançada |
| 7 | Humor, Ironia e Linguagem Figurada | Entendo duplo sentido e expressões idiomáticas | Pragmática, idiomatismos |
| 8 | Cultura Brasileira em Texto e Música | Leio/escuto com apreciação crítica | Literatura adaptada, letras de música como input |
| 9 | Simulado Completo #1 | Realizo o exame Intermediário Superior como diagnóstico | Identificação de lacunas |
| 10 | Revisão Direcionada + Simulado #2 | Atinjo o nível de aprovação do CELPE-Bras Intermediário Superior | **Marco de saída B2 — fim do escopo atual** |

---

## 8. Template Padrão de Unidade (Ficha de Unidade)

Validado através da unidade-piloto **B1.8 — "Registro Formal vs. Informal"**, usada como prova de conceito e modelo replicável para as 50 unidades.

### 8.1 Estrutura da Ficha

1. **Ficha geral**: nível/posição, pré-requisitos (links de spiral curriculum), projeção futura, tempo estimado, razão de existir (link à evidência/critério de exame quando aplicável)
2. **Objetivos Can-Do**: 2–3 enunciados de capacidade real
3. **Cenário motivador**: tarefa real, idealmente dupla/contrastiva (espelha o formato de tarefas do CELPE-Bras a partir do B1)
4. **Os 4 strands**: Função & Gramática-em-contexto / Léxico & SRS / Som & Compreensão / Produção Oral & Escrita
5. **Sequência didática**: noticing → input explícito → prática controlada → prática comunicativa → listening/input autêntico → tarefa final integradora → reflexão metalinguística
6. **Rubrica de avaliação**: critérios com peso, alinhados aos critérios reais de correção do CELPE-Bras quando o nível for B1+

### 8.2 Unidade-Piloto Completa — B1.8 "Registro Formal vs. Informal"

**Ficha geral**
- Pré-requisitos: recicla B1.2 (E-mail/Carta pessoal informal) e B1.3 (Reclamação formal)
- Projeta para: B2.4 (Variação Regional do PT-BR)
- Tempo estimado: 4–5 sessões
- Por que existe: o CELPE-Bras penaliza diretamente descompasso de registro na correção — esta unidade ataca esse critério de avaliação

**Objetivos Can-Do**
- Reconheço marcadores de formalidade em textos orais e escritos.
- Adapto pronome de tratamento, vocabulário e estrutura de frase ao grau de formalidade exigido.
- Transito entre registro coloquial falado e registro formal escrito sem perder coerência.

**Cenário motivador (tarefa dupla):** vazamento no apartamento do aluno — relatar o mesmo fato ao amigo (informal) e à administradora do prédio (formal).

**Os 4 strands**
- *Função & Gramática*: pronomes de tratamento (você/tu regional/o(a) senhor(a)); cortesia ("Poderia/Gostaria/Seria possível" vs. "Dá pra/Cê pode"); reduções da fala informal (cê, tá, pra, né, tipo) vs. forma escrita plena; aberturas/fechos formais vs. informais; imperativo cortês vs. direto.
- *Léxico & SRS*: 25–30 pares lexicais formal↔informal (ex.: imóvel/apê; lamento informar/que saco), tag `registro`, cruzando vocabulário das unidades B1.2 e B1.3.
- *Som & Compreensão*: par de áudios autênticos contrastantes sobre o mesmo fato (ligação formal a central de atendimento vs. áudio informal de WhatsApp); tarefa de identificação de registro por marcas linguísticas.
- *Produção*: escrita de mensagem informal ao amigo + e-mail formal à administradora (tarefa-espelho); oral — role-play simulando ligação formal de reporte.

**Sequência didática**
1. Noticing (comparar transcrição informal vs. e-mail formal sobre o mesmo fato)
2. Input explícito (tabela de contraste)
3. Prática controlada (transformação informal↔formal)
4. Prática comunicativa (diálogo guiado em pares)
5. Listening contrastivo com tarefa de identificação
6. Tarefa final integradora (a tarefa dupla)
7. Reflexão metalinguística (quando usar cada registro em situações reais)

**Rubrica**
| Critério | Peso |
|---|---|
| Adequação ao registro exigido pela tarefa | Alto |
| Cumprimento da tarefa comunicativa | Alto |
| Coerência e coesão do texto | Médio |
| Correção gramatical | Médio |

---

## 9. Decisões Pendentes / Próximos Passos

- [x] Detalhamento completo (ficha de unidade) das 49 unidades restantes, seguindo o template da Seção 8 — ver `docs/unidades/`.
- [x] Conteúdo de lição completo (diálogo, vocabulário, pronúncia, exercícios com gabarito, listening, tarefa final, glossário final da unidade) do nível **PRE-A1** (8 unidades, incluindo as unidades de apoio transversal PRE-A1.0 e PRE-A1.4b) — ver `docs/conteudo/pre-a1/`. Serve de prova de conceito do nível de detalhe antes de replicar para A1, A2, B1 e B2.
- [x] Conteúdo de lição completo do nível **A1** (10 unidades) — ver `docs/conteudo/a1/`. Introduz a seção extra "Gramática em Foco" no template de lição (validada na A1.1), necessária a partir daqui porque a A1 tem gramática produtiva (a PRE-A1 era só "chunks"). Todas as lições (PRE-A1 e A1) agora terminam com um "Glossário da Unidade" consolidando e alfabetizando todo o vocabulário usado (diálogo + listening + exercícios), não só o introduzido na seção de Vocabulário.
- [x] Conteúdo de lição completo do nível **A2** (10 unidades) — ver `docs/conteudo/a2/`. Consolida o pretérito perfeito (regular e irregular) e introduz comparativos/superlativos, imperativo, futuro perifrástico+perfeito e pretérito imperfeito; A2.10 é unidade de checkpoint/diagnóstico sem item gramatical novo, preparando o gate do B1.
- [x] Conteúdo de lição completo do nível **B1** (12 unidades) — ver `docs/conteudo/b1/`. A partir deste nível as unidades espelham os gêneros textuais reais do CELPE-Bras (e-mail/carta, reclamação formal, fórum de opinião, notícia, entrevista oral); B1.8 reutiliza fielmente a unidade-piloto da Seção 8.2; B1.11/B1.12 adaptam o template padrão para o formato de simulado/remediação direcionada, com o Simulado #2 do B1.12 servindo como marco formal de saída do nível.
- [x] Conteúdo de lição completo do nível **B2** (10 unidades) — ver `docs/conteudo/b2/`. Último nível do escopo atual: introduz subjuntivo imperfeito/futuro+condicional (hipóteses), discurso indireto, argumentação dissertativa avançada, variação regional (reconhecimento, não produção), registro profissional consolidado, discurso relatado jornalístico, humor/ironia/linguagem figurada e leitura crítica de produção cultural (música/conto); B2.9/B2.10 seguem o formato de simulado/remediação direcionada do B1.11/B1.12, com o Simulado #2 do B2.10 servindo como marco formal de saída do nível B2 e do escopo atual do curso (PRE-A1 → B2 completo).
- [x] Início da camada de arquitetura de TI/plataforma — funcionalidades de UX em implementação incremental; ver Seção 11.
- C1/C2: permanecem congelados; só serão retomados mediante solicitação formal futura do responsável pelo projeto.

## 10. Conteúdo de Lição Detalhado

Onde a Seção 7 traz a *ficha* de cada unidade (objetivos, strands, foco funcional), esta seção aponta para o **conteúdo de lição pronto para uso** — diálogos, listas de vocabulário com exemplos, blocos de pronúncia, exercícios com gabarito, scripts de listening com perguntas, e a tarefa de produção final com checklist de autoavaliação.

- **PRE-A1 (completo):** [`docs/conteudo/pre-a1/`](conteudo/pre-a1/) — 01-primeiro-contato.md, 02-chegando-ao-brasil.md, 03-na-acomodacao.md, 04-comendo-e-bebendo.md, 05-ajuda-e-emergencia.md, 06-pequenas-compras.md (projeto integrador do nível)
- **A1 (completo):** [`docs/conteudo/a1/`](conteudo/a1/) — 01-quem-sou-eu.md, 02-familia-e-amigos.md, 03-minha-rotina.md, 04-casa-e-bairro.md, 05-tempo-e-estacoes.md, 06-trabalho-e-estudos.md, 07-lazer-e-fim-de-semana.md, 08-saude-basica.md, 09-planos-e-convites.md, 10-projeto-integrador.md. A partir daqui, cada lição inclui a seção "Gramática em Foco" (input explícito), ausente na PRE-A1 por ser um nível só de chunks fixos.
- **A2 (completo):** [`docs/conteudo/a2/`](conteudo/a2/) — 01-contando-o-que-aconteceu.md, 02-verbos-irregulares-no-passado.md, 03-comparando-e-avaliando.md, 04-instrucoes-e-indicacoes.md, 05-burocracia-do-dia-a-dia.md, 06-saude-e-bem-estar.md, 07-viagens-pelo-brasil.md, 08-comida-e-cultura-a-mesa.md, 09-lembrancas-e-habitos-passados.md, 10-ponte-para-o-b1.md (checkpoint/diagnóstico, sem item gramatical novo). Inclui `preview.html`.
- **B1 (completo):** [`docs/conteudo/b1/`](conteudo/b1/) — 01-entendendo-a-tarefa-integrada.md, 02-email-e-carta-pessoal.md, 03-reclamando-e-resolvendo.md, 04-opiniao-em-foruns.md, 05-narrando-uma-experiencia.md, 06-subjuntivo-presente.md, 07-linguagem-de-noticia.md, 08-registro-formal-vs-informal.md (unidade-piloto, Seção 8.2), 09-debatendo-temas-sociais.md, 10-entrevista-oral.md, 11-simulado-completo-1.md, 12-revisao-direcionada-e-simulado-2.md (marco de saída do nível). Inclui `preview.html`.
- **B2 (completo):** [`docs/conteudo/b2/`](conteudo/b2/) — 01-hipoteses-e-condicoes.md, 02-discurso-indireto.md, 03-argumentacao-avancada.md, 04-variacao-regional-pt-br.md, 05-portugues-no-trabalho.md, 06-midia-e-atualidades.md, 07-humor-ironia-e-linguagem-figurada.md, 08-cultura-brasileira-em-texto-e-musica.md, 09-simulado-completo-1.md, 10-revisao-direcionada-e-simulado-2.md (marco de saída do nível B2 e do escopo atual do curso). Inclui `preview.html`. Com o B2, o percurso PRE-A1 → B2 está com todo o conteúdo de lição construído; C1/C2 permanecem congelados.

---

## 11. Funcionalidades de Plataforma Implementadas

Registro incremental das funcionalidades de UX/plataforma entregues na camada de TI. Todas as decisões de stack permanecem dentro das restrições definidas: Vercel (gratuito), Firebase Spark, sem serviços pagos.

### 11.1 Impressão de lições (2026-06-26)

Alunos podem imprimir qualquer lição diretamente pelo navegador.

- **Botão "Imprimir lição"** no hero da lição (`BotaoImprimir.tsx`) — chama `window.print()`, oculto na impressão via `print:hidden`.
- **Elementos interativos ocultados** na impressão: NavBar, botões TTS, seção "Marcar como concluída", navegação de volta, botão STT dos exercícios.
- **Gabarito dos exercícios** revelado automaticamente na impressão (span `print:inline` com a resposta), substituindo o botão "ver gabarito".
- **CSS `@media print`** em `globals.css`: fundo branco, sombras removidas, `break-inside: avoid` por seção, `print-color-adjust: exact` nos cabeçalhos de tabela coloridos.

### 11.2 Links de conjugação de verbos (2026-06-26)

Verbos infinitivos do vocabulário de cada lição são linkados automaticamente para o [conjugacao.com.br](https://www.conjugacao.com.br/) (7Graus/Dicio), abrindo em nova aba.

- **`lib/content/verbos.ts`**: extrai infinitivos do array `vocabulario` da lição (filtra termos terminados em `-ar`/`-er`/`-ir`/`-or`, sem barra ou espaço, stripa marcador reflexivo `(-se)`). Gera o slug da URL removendo diacríticos (`almoçar` → `almocar`).
- **`SectionMarkdown.tsx`**: pré-processa o markdown linha a linha, substituindo ocorrências de infinitivos por links Markdown `[verbo](url)`. Lookbehind `(?<!\[)` e guarda de linha (`conjugacao.com.br`) evitam double-link. Links estilizados com `underline decoration-dotted`, abrem em `target="_blank"`.
- **Escopo de linking**: todas as seções de conteúdo (Diálogo, Vocabulário, Gramática, Pronúncia, Listening, Produção). Exercícios excluídos por já usarem `ExerciciosReveal`, não `SectionMarkdown`.
- **Impressão**: links de conjugação sem sublinhado na impressão (`print-color-adjust` via `globals.css`).
- **Decisão de referência externa**: linking é legalmente seguro (Marco Civil da Internet; a página é pública e indexável); beneficia o site referenciado (tráfego/receita de anúncios); não reproduz conteúdo deles.
