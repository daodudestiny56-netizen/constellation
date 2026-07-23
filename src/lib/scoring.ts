/**
 * Phenotype overlap scoring.
 *
 * One-sentence explanation:
 * "Score = the fraction of this condition's known phenotype markers
 *  that we found in the patient's twin data, weighted by how
 *  frequently each phenotype is seen in confirmed cases."
 *
 * This is a weighted variant of set overlap — simple enough to narrate
 * live on stage, transparent enough for a skeptical clinician.
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
  score: number;                       // 0–1
  matchedFindings: PhenotypeMatch[];   // which patient phenotypes matched
  unmatchedExpected: string[];         // condition phenotypes NOT found in patient
  novelFindings: PhenotypeMatch[];     // patient phenotypes not in condition profile
  systemCoverage: Record<string, number>; // % match per body system
};

/**
 * Score how well a patient's resolved phenotype set overlaps with
 * a candidate condition's known profile.
 */
export function scorePhenotypeOverlap(
  patientPhenotypes: PhenotypeMatch[],
  condition: CandidateCondition
): ScoredCondition {
  const patientHpoIds = new Set(patientPhenotypes.map((p) => p.hpoId));
  const conditionHpoIds = new Set(condition.phenotypeProfile.map((p) => p.hpoId));

  // Weighted numerator: sum of weights for matched phenotypes
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
      if (patientMatch) {
        matchedFindings.push(patientMatch);
      }
    } else {
      unmatchedExpected.push(phenotype.hpoId);
    }
  }

  // Novel findings: patient phenotypes not in condition profile
  const novelFindings = patientPhenotypes.filter((p) => !conditionHpoIds.has(p.hpoId));

  // Score: weighted overlap fraction
  const score = weightedTotal > 0 ? weightedMatched / weightedTotal : 0;

  // System coverage: how many of the condition's systems have at least one match
  const systemCoverage: Record<string, number> = {};
  for (const system of condition.systems) {
    const systemFindings = matchedFindings.filter((f) => f.system === system);
    const expectedInSystem = condition.phenotypeProfile.filter((p) => {
      // check if this phenotype maps to this system
      const match = patientPhenotypes.find((pp) => pp.hpoId === p.hpoId);
      return match?.system === system;
    });
    systemCoverage[system] = expectedInSystem.length > 0 ? 1 : 0;
    // Also count partial coverage
    if (systemFindings.length > 0) {
      systemCoverage[system] = 1;
    }
  }

  return {
    condition,
    score,
    matchedFindings,
    unmatchedExpected,
    novelFindings,
    systemCoverage,
  };
}

/**
 * Score all candidates and return sorted by score descending.
 */
export function scoreAllCandidates(
  patientPhenotypes: PhenotypeMatch[],
  candidates: CandidateCondition[]
): ScoredCondition[] {
  return candidates
    .map((c) => scorePhenotypeOverlap(patientPhenotypes, c))
    .sort((a, b) => b.score - a.score);
}
