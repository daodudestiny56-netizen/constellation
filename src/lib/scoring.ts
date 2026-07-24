/**
 * Phenotype overlap scoring.
 *
 * Score = fraction of a condition's known phenotype markers that appear
 * in the patient's twin data, weighted by how often each phenotype is
 * seen in confirmed cases. Simple enough to explain on stage, transparent
 * enough for a clinician to trust.
 */

import type { CandidateCondition } from './candidates';

const FREQUENCY_WEIGHT = {
  very_frequent: 1.0,
  frequent: 0.7,
  occasional: 0.4,
} as const;

export type PhenotypeMatch = {
  hpoId: string;
  label: string;
  system: string;
  sourceEventId?: string;
};

export type ScoredCondition = {
  condition: CandidateCondition;
  score: number;                       // 0-1
  matchedFindings: PhenotypeMatch[];
  unmatchedExpected: string[];         // condition phenotypes not found in patient
  novelFindings: PhenotypeMatch[];     // patient phenotypes not in condition profile
  systemCoverage: Record<string, number>;
};

export function scorePhenotypeOverlap(
  patientPhenotypes: PhenotypeMatch[],
  condition: CandidateCondition
): ScoredCondition {
  const patientHpoIds = new Set(patientPhenotypes.map((p) => p.hpoId));
  const conditionHpoIds = new Set(condition.phenotypeProfile.map((p) => p.hpoId));

  let weightedMatched = 0;
  let weightedTotal = 0;
  const matchedFindings: PhenotypeMatch[] = [];
  const unmatchedExpected: string[] = [];

  for (const phenotype of condition.phenotypeProfile) {
    const weight = FREQUENCY_WEIGHT[phenotype.frequency];
    weightedTotal += weight;

    if (patientHpoIds.has(phenotype.hpoId)) {
      weightedMatched += weight;
      const patientMatch = patientPhenotypes.find((p) => p.hpoId === phenotype.hpoId);
      if (patientMatch) matchedFindings.push(patientMatch);
    } else {
      unmatchedExpected.push(phenotype.hpoId);
    }
  }

  const novelFindings = patientPhenotypes.filter((p) => !conditionHpoIds.has(p.hpoId));
  const score = weightedTotal > 0 ? weightedMatched / weightedTotal : 0;

  // per-system coverage: does the patient have at least one hit in each system?
  const systemCoverage: Record<string, number> = {};
  for (const system of condition.systems) {
    const systemFindings = matchedFindings.filter((f) => f.system === system);
    const expectedInSystem = condition.phenotypeProfile.filter((p) => {
      const match = patientPhenotypes.find((pp) => pp.hpoId === p.hpoId);
      return match?.system === system;
    });
    systemCoverage[system] = expectedInSystem.length > 0 ? 1 : 0;
    if (systemFindings.length > 0) systemCoverage[system] = 1;
  }

  return { condition, score, matchedFindings, unmatchedExpected, novelFindings, systemCoverage };
}

/** Score all candidates and sort by match strength (descending). */
export function scoreAllCandidates(
  patientPhenotypes: PhenotypeMatch[],
  candidates: CandidateCondition[]
): ScoredCondition[] {
  return candidates
    .map((c) => scorePhenotypeOverlap(patientPhenotypes, c))
    .sort((a, b) => b.score - a.score);
}
