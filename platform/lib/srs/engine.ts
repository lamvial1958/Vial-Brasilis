/** Agendamento de revisão tipo SM-2. Qualidade: 0 (errou tudo) a 5 (perfeito). */
export interface SrsState {
  repeticoes: number;
  intervaloDias: number;
  fatorFacilidade: number;
}

export interface SrsResultado extends SrsState {
  proximaRevisaoEm: Date;
}

export function estadoInicialSrs(): SrsState {
  return { repeticoes: 0, intervaloDias: 0, fatorFacilidade: 2.5 };
}

export function calcularProximaRevisao(estado: SrsState, qualidade: number, agora = new Date()): SrsResultado {
  const q = Math.min(5, Math.max(0, qualidade));

  let { repeticoes, intervaloDias, fatorFacilidade } = estado;

  if (q < 3) {
    repeticoes = 0;
    intervaloDias = 1;
  } else {
    repeticoes += 1;
    if (repeticoes === 1) intervaloDias = 1;
    else if (repeticoes === 2) intervaloDias = 6;
    else intervaloDias = Math.round(intervaloDias * fatorFacilidade);
  }

  fatorFacilidade = Math.max(
    1.3,
    fatorFacilidade + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  const proximaRevisaoEm = new Date(agora.getTime() + intervaloDias * 24 * 60 * 60 * 1000);

  return { repeticoes, intervaloDias, fatorFacilidade, proximaRevisaoEm };
}
