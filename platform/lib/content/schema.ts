export type Nivel = "pre-a1" | "a1" | "a2" | "b1" | "b2";

export interface VocabItem {
  termo: string;
  definicao: string;
  exemplo: string;
}

export interface ExercicioItem {
  enunciado: string;
  resposta: string;
}

export interface GlossarioItem {
  termo: string;
  significado: string;
}

export interface UnitSection {
  ordem: number;
  titulo: string;
  markdown: string;
}

export interface UnitContent {
  nivel: Nivel;
  slug: string;
  ordem: number;
  codigo: string;
  titulo: string;
  tipo: "licao" | "simulado";
  notaIntro: string | null;
  secoes: UnitSection[];
  vocabulario: VocabItem[];
  tagsVocabulario: string[];
  exercicios: ExercicioItem[];
  glossario: GlossarioItem[];
  tempoSugeridoMin: number;
}

export interface NivelIndex {
  nivel: Nivel;
  unidades: { slug: string; ordem: number; codigo: string; titulo: string; tipo: "licao" | "simulado" }[];
}
