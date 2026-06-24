import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { parseUnitMarkdown } from "../lib/content/parse";
import type { Nivel, NivelIndex } from "../lib/content/schema";

const NIVEIS: Nivel[] = ["pre-a1", "a1", "a2", "b1", "b2"];
const CONTEUDO_DIR = join(__dirname, "..", "..", "docs", "conteudo");
const OUT_DIR = join(__dirname, "..", "content", "generated");

if (!existsSync(CONTEUDO_DIR)) {
  console.log("[content] docs/conteudo não encontrado — usando arquivos pré-gerados em content/generated/");
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });

const indiceGeral: NivelIndex[] = [];

for (const nivel of NIVEIS) {
  const dir = join(CONTEUDO_DIR, nivel);
  const arquivos = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  mkdirSync(join(OUT_DIR, nivel), { recursive: true });

  const unidadesIndex: NivelIndex["unidades"] = [];

  arquivos.forEach((arquivo, i) => {
    const slug = arquivo.replace(/\.md$/, "");
    const raw = readFileSync(join(dir, arquivo), "utf8");
    const unidade = parseUnitMarkdown({ nivel, slug, ordem: i + 1, raw });

    writeFileSync(join(OUT_DIR, nivel, `${slug}.json`), JSON.stringify(unidade, null, 2), "utf8");

    unidadesIndex.push({
      slug: unidade.slug,
      ordem: unidade.ordem,
      codigo: unidade.codigo,
      titulo: unidade.titulo,
      tipo: unidade.tipo,
    });
  });

  indiceGeral.push({ nivel, unidades: unidadesIndex });
  console.log(`[content] ${nivel}: ${unidadesIndex.length} unidades processadas`);
}

writeFileSync(join(OUT_DIR, "index.json"), JSON.stringify(indiceGeral, null, 2), "utf8");
console.log(`[content] índice geral escrito em ${join(OUT_DIR, "index.json")}`);
