import type {
  ExercicioItem,
  GlossarioItem,
  Nivel,
  UnitContent,
  UnitSection,
  VocabItem,
} from "./schema";

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function parseMarkdownTable(markdown: string): string[][] {
  const linhas = markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));

  const linhasDeDados = linhas.filter((l, i) => {
    // descarta a linha separadora "|---|---|"
    if (i === 1 && /^\|[\s\-:|]+\|$/.test(l)) return false;
    return true;
  });

  return linhasDeDados.map((linha) =>
    linha
      .split("|")
      .slice(1, -1)
      .map((celula) => celula.trim())
  );
}

function extrairSecoes(corpo: string): UnitSection[] {
  const regexSecao = /^##\s+(\d+)\.\s+(.+)$/gm;
  const indices: { ordem: number; titulo: string; start: number; contentStart: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = regexSecao.exec(corpo)) !== null) {
    indices.push({
      ordem: Number(match[1]),
      titulo: match[2].trim(),
      start: match.index,
      contentStart: match.index + match[0].length,
    });
  }

  return indices.map((sec, i) => {
    const fim = i + 1 < indices.length ? indices[i + 1].start : corpo.length;
    return {
      ordem: sec.ordem,
      titulo: sec.titulo,
      markdown: corpo.slice(sec.contentStart, fim).trim(),
    };
  });
}

function extrairVocabulario(secoes: UnitSection[]): { itens: VocabItem[]; tags: string[] } {
  const secao = secoes.find((s) => normalizar(s.titulo).startsWith("vocabulario"));
  if (!secao) return { itens: [], tags: [] };

  const linhas = parseMarkdownTable(secao.markdown).filter(
    (cols) => cols.length >= 2 && normalizar(cols[0]) !== "termo"
  );

  const itens: VocabItem[] = linhas.map((cols) => ({
    termo: cols[0] ?? "",
    definicao: cols[1] ?? "",
    exemplo: cols[2] ?? "",
  }));

  const tags = Array.from(secao.markdown.matchAll(/tags?\s+`([^`]+)`/gi)).map((m) => m[1]);

  return { itens, tags };
}

function extrairExercicios(secoes: UnitSection[]): ExercicioItem[] {
  const secao = secoes.find((s) => normalizar(s.titulo).startsWith("exercicios"));
  if (!secao) return [];

  const itens: ExercicioItem[] = [];
  const partes = secao.markdown
    .split(/\n|·/)
    .map((p) => p.trim())
    .filter(Boolean);

  const padroes: RegExp[] = [
    /^(.*?)→\s*\*\*(.+?)\*\*\.?$/,
    /^(.*?)\(\*\*(.+?)\*\*\)\.?$/,
    /^(.*?)→\s*([^*].+?)\.?$/,
    /^(.*?)\(([^)]+)\)\.?$/,
  ];

  for (const parte of partes) {
    for (const padrao of padroes) {
      const m = parte.match(padrao);
      if (m && m[1].trim().length > 0) {
        itens.push({ enunciado: m[1].trim(), resposta: m[2].trim() });
        break;
      }
    }
  }

  return itens;
}

function extrairTempoSugeridoMin(raw: string): number {
  const regex = /\|\s*(\d+)(?:[–-](\d+))?\s*min(?:utos)?\s*\|/gi;
  let total = 0;
  for (const m of raw.matchAll(regex)) {
    total += Number(m[2] ?? m[1]);
  }
  return total;
}

function extrairGlossario(secoes: UnitSection[]): GlossarioItem[] {
  const secao = secoes.find((s) => normalizar(s.titulo).startsWith("glossario"));
  if (!secao) return [];

  const linhas = parseMarkdownTable(secao.markdown).filter(
    (cols) => cols.length >= 2 && normalizar(cols[0]) !== "palavra/expressao" && normalizar(cols[0]) !== "termo"
  );

  return linhas.map((cols) => ({ termo: cols[0] ?? "", significado: cols[1] ?? "" }));
}

export function parseUnitMarkdown(args: {
  nivel: Nivel;
  slug: string;
  ordem: number;
  raw: string;
}): UnitContent {
  const { nivel, slug, ordem, raw } = args;

  const tituloMatch = raw.match(/^#\s+(.+?)\s+—\s+(.+)$/m);
  const codigo = tituloMatch?.[1]?.trim() ?? slug;
  const titulo = tituloMatch?.[2]?.trim() ?? slug;

  const notaMatch = raw.match(/^\*(.+?)\*$/m);
  const notaIntro = notaMatch ? notaMatch[1].trim() : null;

  const inicioSecoes = raw.search(/^##\s+\d+\./m);
  const corpo = inicioSecoes >= 0 ? raw.slice(inicioSecoes) : "";
  const secoes = extrairSecoes(corpo);

  const tipo: "licao" | "simulado" =
    /simulado|revis(a|ã)o direcionada/i.test(titulo) || /simulado/i.test(slug) ? "simulado" : "licao";

  const { itens: vocabulario, tags: tagsVocabulario } = extrairVocabulario(secoes);
  const exercicios = extrairExercicios(secoes);
  const glossario = extrairGlossario(secoes);
  const tempoSugeridoMin = tipo === "simulado" ? extrairTempoSugeridoMin(raw) : 0;

  return {
    nivel,
    slug,
    ordem,
    codigo,
    titulo,
    tipo,
    notaIntro,
    secoes,
    vocabulario,
    tagsVocabulario,
    exercicios,
    glossario,
    tempoSugeridoMin,
  };
}
