import type { VocabItem } from "./schema";

/** Builds the conjugacao.com.br URL slug for a Portuguese verb infinitive.
 *  Strips diacritics: "almoçar" → "almocar", "trabalhar" → "trabalhar"
 */
export function slugVerbo(infinitivo: string): string {
  return infinitivo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Extracts verb infinitives from a lesson's vocabulary list.
 *  Strips reflexive markers like "(-se)" before filtering.
 *  A term is treated as a verb if it has no slash or space and ends in -ar/-er/-ir/-or.
 */
export function extrairVerbos(vocabulario: VocabItem[]): string[] {
  const verbos = vocabulario
    .map(item => item.termo.replace(/\s*\(.*?\)\s*$/, "").trim())
    .filter(
      termo =>
        !termo.includes("/") &&
        !termo.includes(" ") &&
        termo.length >= 2 &&
        /^[a-zA-Záéíóúâêîôûãõç]*[aeiouAEIOU]r$/i.test(termo),
    );
  return [...new Set(verbos)];
}
