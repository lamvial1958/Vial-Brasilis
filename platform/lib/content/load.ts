import "server-only";
import { readFileSync } from "fs";
import { join } from "path";
import type { Nivel, NivelIndex, UnitContent } from "./schema";

const GENERATED_DIR = join(process.cwd(), "content", "generated");

export function getIndiceGeral(): NivelIndex[] {
  const raw = readFileSync(join(GENERATED_DIR, "index.json"), "utf8");
  return JSON.parse(raw);
}

export function getNivelIndex(nivel: Nivel): NivelIndex | undefined {
  return getIndiceGeral().find((n) => n.nivel === nivel);
}

export function getUnit(nivel: Nivel, slug: string): UnitContent {
  const raw = readFileSync(join(GENERATED_DIR, nivel, `${slug}.json`), "utf8");
  return JSON.parse(raw);
}
