/**
 * Constellation SDK Layer
 *
 * This module wraps the real @ontomorph/dtp-sdk and normalizes its data shapes
 * for the rest of the app. It also provides mock fallback data for demo mode
 * when no real API key or grant token is available.
 *
 * ARCHITECTURE: The rest of the app imports only from this file — never from
 * @ontomorph/dtp-sdk directly. This keeps the swap surface minimal.
 */

import { DTP as RealDTP } from '@ontomorph/dtp-sdk';
import type {
  HealthEvent,
  StreamHandle as RealStreamHandle,
  DTPConfig,
} from '@ontomorph/dtp-sdk';

// ─── App-Level Types ───────────────────────────────────
// These are what the rest of the app uses. They normalize between
// the real SDK's shapes and our demo fallback.

export type TwinEvent = {
  id: string;
  timestamp: string;
  system: string;
  data: {
    code: string;
    vocabulary: string;
    display: string;
    value?: number;
    unit?: string;
  };
};

export type PhenotypeMapping = {
  sourceCode: string;
  sourceVocabulary: string;
  hpoId: string;
  hpoLabel: string;
  confidence: number;
};

export type ReferenceRange = {
  loincCode: string;
  label: string;
  low: number;
  high: number;
  unit: string;
  source: string;
};

export type StreamHandle = {
  stop: () => void;
};

export type Twin = {
  id: string;
  name: string;
  age: number;
  sex: 'male' | 'female';
  events: {
    list: () => Promise<TwinEvent[]>;
    stream: (opts: Record<string, unknown>, callback: (event: TwinEvent) => void) => StreamHandle;
  };
  flag: (scope: string, data: Record<string, unknown>) => Promise<void>;
};

export type ClinicalConcept = {
  conceptCode: string;
  conceptName: string;
  vocabularyId: string;
  hpoId?: string;
  hpoLabel?: string;
  system?: string;
};

export const CLINICAL_CONCEPTS_DATABASE: ClinicalConcept[] = [
  { conceptCode: 'I42.1', conceptName: 'Obstructive hypertrophic cardiomyopathy', vocabularyId: 'ICD-10', hpoId: 'HP:0001714', hpoLabel: 'Left ventricular hypertrophy', system: 'cardiovascular' },
  { conceptCode: 'I71.2', conceptName: 'Aortic root dilatation / Aortic aneurysm', vocabularyId: 'ICD-10', hpoId: 'HP:0002616', hpoLabel: 'Aortic root dilatation', system: 'cardiovascular' },
  { conceptCode: 'I34.1', conceptName: 'Mitral valve prolapse', vocabularyId: 'ICD-10', hpoId: 'HP:0001634', hpoLabel: 'Mitral valve prolapse', system: 'cardiovascular' },
  { conceptCode: '30934-4', conceptName: 'BNP (B-type Natriuretic Peptide)', vocabularyId: 'LOINC', hpoId: 'HP:0030843', hpoLabel: 'Cardiac amyloidosis signal', system: 'cardiovascular' },
  { conceptCode: 'N18.3', conceptName: 'Chronic kidney disease, stage 3', vocabularyId: 'ICD-10', hpoId: 'HP:0000083', hpoLabel: 'Renal insufficiency', system: 'renal' },
  { conceptCode: '5804-0', conceptName: 'Proteinuria (Protein in Urine)', vocabularyId: 'LOINC', hpoId: 'HP:0000093', hpoLabel: 'Proteinuria', system: 'renal' },
  { conceptCode: '2160-0', conceptName: 'Serum Creatinine (Elevated)', vocabularyId: 'LOINC', hpoId: 'HP:0000083', hpoLabel: 'Renal insufficiency', system: 'renal' },
  { conceptCode: 'G62.9', conceptName: 'Acroparesthesia / Peripheral neuropathy (Burning pain in extremities)', vocabularyId: 'ICD-10', hpoId: 'HP:0002498', hpoLabel: 'Acroparesthesia', system: 'nervous' },
  { conceptCode: 'R25.1', conceptName: 'Hand Tremor / Resting tremor', vocabularyId: 'ICD-10', hpoId: 'HP:0001337', hpoLabel: 'Tremor', system: 'nervous' },
  { conceptCode: 'R27.0', conceptName: 'Ataxia / Difficulty with coordination (Dysarthria)', vocabularyId: 'ICD-10', hpoId: 'HP:0001260', hpoLabel: 'Dysarthria', system: 'nervous' },
  { conceptCode: 'F07.0', conceptName: 'Personality and mood changes', vocabularyId: 'ICD-10', hpoId: 'HP:0000718', hpoLabel: 'Personality changes', system: 'nervous' },
  { conceptCode: 'L81.8', conceptName: 'Angiokeratoma (Dark red skin spots)', vocabularyId: 'ICD-10', hpoId: 'HP:0001019', hpoLabel: 'Angiokeratoma', system: 'dermatological' },
  { conceptCode: 'L52', conceptName: 'Erythema nodosum (Painful red bumps on shins)', vocabularyId: 'ICD-10', hpoId: 'HP:0001045', hpoLabel: 'Erythema nodosum', system: 'dermatological' },
  { conceptCode: 'H18.49', conceptName: 'Cornea verticillata (Whorl-shaped corneal opacity)', vocabularyId: 'ICD-10', hpoId: 'HP:0000629', hpoLabel: 'Cornea verticillata', system: 'ocular' },
  { conceptCode: 'H18.04', conceptName: 'Kayser-Fleischer rings (Greenish-brown iris ring)', vocabularyId: 'ICD-10', hpoId: 'HP:0002172', hpoLabel: 'Kayser-Fleischer ring', system: 'ocular' },
  { conceptCode: 'H20.9', conceptName: 'Uveitis / Eye inflammation', vocabularyId: 'ICD-10', hpoId: 'HP:0000554', hpoLabel: 'Uveitis', system: 'ocular' },
  { conceptCode: 'H27.10', conceptName: 'Ectopia lentis (Displaced eye lens)', vocabularyId: 'ICD-10', hpoId: 'HP:0001083', hpoLabel: 'Ectopia lentis', system: 'ocular' },
  { conceptCode: 'K74.6', conceptName: 'Liver cirrhosis / Liver fibrosis', vocabularyId: 'ICD-10', hpoId: 'HP:0001394', hpoLabel: 'Liver cirrhosis', system: 'hepatic' },
  { conceptCode: '1920-8', conceptName: 'AST / SGOT (Elevated liver enzyme)', vocabularyId: 'LOINC', hpoId: 'HP:0002240', hpoLabel: 'Hepatomegaly', system: 'hepatic' },
  { conceptCode: 'R16.0', conceptName: 'Hepatomegaly (Enlarged liver)', vocabularyId: 'ICD-10', hpoId: 'HP:0002240', hpoLabel: 'Hepatomegaly', system: 'hepatic' },
  { conceptCode: 'R06.0', conceptName: 'Dyspnea / Shortness of breath', vocabularyId: 'ICD-10', hpoId: 'HP:0002094', hpoLabel: 'Dyspnea', system: 'pulmonary' },
  { conceptCode: 'R05', conceptName: 'Persistent dry cough', vocabularyId: 'ICD-10', hpoId: 'HP:0012735', hpoLabel: 'Cough', system: 'pulmonary' },
  { conceptCode: 'D86.0', conceptName: 'Bilateral hilar lymphadenopathy / Pulmonary sarcoidosis', vocabularyId: 'ICD-10', hpoId: 'HP:0002206', hpoLabel: 'Pulmonary fibrosis', system: 'pulmonary' },
  { conceptCode: 'J93.11', conceptName: 'Spontaneous pneumothorax (Collapsed lung)', vocabularyId: 'ICD-10', hpoId: 'HP:0002107', hpoLabel: 'Pneumothorax', system: 'pulmonary' },
  { conceptCode: 'Q67.5', conceptName: 'Pectus excavatum (Sunken chest)', vocabularyId: 'ICD-10', hpoId: 'HP:0000767', hpoLabel: 'Pectus excavatum', system: 'skeletal' },
  { conceptCode: 'M41.9', conceptName: 'Scoliosis (Curved spine)', vocabularyId: 'ICD-10', hpoId: 'HP:0002650', hpoLabel: 'Scoliosis', system: 'skeletal' },
  { conceptCode: 'M13.89', conceptName: 'Arthropathy / Joint pain', vocabularyId: 'ICD-10', hpoId: 'HP:0001369', hpoLabel: 'Arthropathy', system: 'skeletal' },
  { conceptCode: '17861-6', conceptName: 'Serum Calcium (Hypercalcemia)', vocabularyId: 'LOINC', hpoId: 'HP:0003072', hpoLabel: 'Hypercalcemia', system: 'endocrine' },
  { conceptCode: 'E11.9', conceptName: 'Type 2 Diabetes Mellitus', vocabularyId: 'ICD-10', hpoId: 'HP:0000819', hpoLabel: 'Diabetes mellitus', system: 'endocrine' },
];

// ─── Demo Patient Profiles ─────────────────────────────

export type DemoPatient = {
  id: string;
  name: string;
  age: number;
  sex: 'male' | 'female';
  summary: string;
  primarySystems: string[];
  expectedTopMatch: string;
};

export const DEMO_PATIENTS: DemoPatient[] = [
  {
    id: 'patient-fabry',
    name: 'James Okafor',
    age: 38,
    sex: 'male',
    summary: 'Heart, kidney, nerve, and skin problems appearing together',
    primarySystems: ['Cardiovascular', 'Renal', 'Nervous', 'Dermatological'],
    expectedTopMatch: 'Fabry Disease',
  },
  {
    id: 'patient-wilson',
    name: 'Priya Mehta',
    age: 27,
    sex: 'female',
    summary: 'Liver damage with tremors and unusual eye rings',
    primarySystems: ['Hepatic', 'Nervous', 'Ocular'],
    expectedTopMatch: 'Wilson Disease',
  },
  {
    id: 'patient-sarcoidosis',
    name: 'David Müller',
    age: 45,
    sex: 'male',
    summary: 'Breathing issues, eye inflammation, and skin lesions',
    primarySystems: ['Pulmonary', 'Ocular', 'Dermatological', 'Hepatic'],
    expectedTopMatch: 'Sarcoidosis',
  },
  {
    id: 'patient-marfan',
    name: 'Sophie Tremblay',
    age: 22,
    sex: 'female',
    summary: 'Tall build with heart murmur and vision problems',
    primarySystems: ['Cardiovascular', 'Skeletal', 'Ocular'],
    expectedTopMatch: 'Marfan Syndrome',
  },
];

// ─── Helpers ───────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Check if real SDK credentials are configured */
function hasRealCredentials(): boolean {
  const dtpKey = import.meta.env.VITE_DTP_KEY || '';
  const holonKey = import.meta.env.VITE_HOLON_KEY || '';
  const isRealDtp = (dtpKey.startsWith('dtp_live_') || dtpKey.startsWith('dtp_test_')) && !dtpKey.includes('demo_key') && !dtpKey.includes('your_');
  const isRealHolon = holonKey.startsWith('holon_') && !holonKey.includes('your_');
  return isRealDtp || isRealHolon;
}

/** Normalize a real HealthEvent to our app-level TwinEvent */
function normalizeHealthEvent(evt: HealthEvent): TwinEvent {
  const data = evt.data || {};
  return {
    id: evt.id,
    timestamp: evt.occurredAt || evt.recordedAt,
    system: (data.system as string) || 'unknown',
    data: {
      code: (data.code as string) || '',
      vocabulary: (data.vocabulary as string) || '',
      display: evt.title || (data.display as string) || '',
      value: data.value as number | undefined,
      unit: data.unit as string | undefined,
    },
  };
}

// ─── Mock Data (demo fallback) ─────────────────────────
// Used when no real API key is configured. Each patient has different events.

const PATIENT_EVENTS: Record<string, TwinEvent[]> = {
  'patient-fabry': [],
  'patient-wilson': [],
  'patient-sarcoidosis': [
    { id: 'evt-s01', timestamp: '2026-01-20T10:00:00Z', system: 'pulmonary', data: { code: 'R06.0', vocabulary: 'ICD-10', display: 'Shortness of breath' } },
    { id: 'evt-s02', timestamp: '2026-01-20T10:15:00Z', system: 'pulmonary', data: { code: 'R05', vocabulary: 'ICD-10', display: 'Persistent dry cough' } },
    { id: 'evt-s03', timestamp: '2026-02-10T14:00:00Z', system: 'pulmonary', data: { code: 'D86.0', vocabulary: 'ICD-10', display: 'Swollen lymph nodes in chest (bilateral hilar)' } },
    { id: 'evt-s04', timestamp: '2026-02-28T09:00:00Z', system: 'ocular', data: { code: 'H20.9', vocabulary: 'ICD-10', display: 'Eye inflammation (uveitis)' } },
    { id: 'evt-s05', timestamp: '2026-03-10T11:00:00Z', system: 'dermatological', data: { code: 'L52', vocabulary: 'ICD-10', display: 'Painful red bumps on shins (erythema nodosum)' } },
    { id: 'evt-s06', timestamp: '2026-03-25T08:30:00Z', system: 'hepatic', data: { code: '1920-8', vocabulary: 'LOINC', display: 'Liver enzyme (AST)', value: 65, unit: 'U/L' } },
    { id: 'evt-s07', timestamp: '2026-04-01T10:00:00Z', system: 'hepatic', data: { code: 'R16.0', vocabulary: 'ICD-10', display: 'Enlarged liver' } },
    { id: 'evt-s08', timestamp: '2026-04-12T09:00:00Z', system: 'endocrine', data: { code: '17861-6', vocabulary: 'LOINC', display: 'Calcium', value: 11.8, unit: 'mg/dL' } },
    { id: 'evt-s09', timestamp: '2026-04-20T13:00:00Z', system: 'skeletal', data: { code: 'M13.89', vocabulary: 'ICD-10', display: 'Joint pain in ankles and knees' } },
  ],
  'patient-marfan': [
    { id: 'evt-m01', timestamp: '2026-01-05T10:00:00Z', system: 'cardiovascular', data: { code: 'I71.2', vocabulary: 'ICD-10', display: 'Widened aorta (aortic root dilation)' } },
    { id: 'evt-m02', timestamp: '2026-01-05T10:15:00Z', system: 'cardiovascular', data: { code: 'I34.1', vocabulary: 'ICD-10', display: 'Mitral valve prolapse (heart valve problem)' } },
    { id: 'evt-m03', timestamp: '2026-02-12T14:00:00Z', system: 'skeletal', data: { code: 'Q67.5', vocabulary: 'ICD-10', display: 'Sunken chest (pectus excavatum)' } },
    { id: 'evt-m04', timestamp: '2026-02-12T14:15:00Z', system: 'skeletal', data: { code: 'M21.41', vocabulary: 'ICD-10', display: 'Flat feet' } },
    { id: 'evt-m05', timestamp: '2026-03-01T09:00:00Z', system: 'skeletal', data: { code: 'Q87.40', vocabulary: 'ICD-10', display: 'Long limbs relative to body (Marfanoid)' } },
    { id: 'evt-m06', timestamp: '2026-03-15T11:00:00Z', system: 'ocular', data: { code: 'H27.10', vocabulary: 'ICD-10', display: 'Displaced eye lens (ectopia lentis)' } },
    { id: 'evt-m07', timestamp: '2026-03-15T11:15:00Z', system: 'ocular', data: { code: 'H52.1', vocabulary: 'ICD-10', display: 'Severe nearsightedness (myopia)' } },
    { id: 'evt-m08', timestamp: '2026-04-01T10:00:00Z', system: 'skeletal', data: { code: 'M41.9', vocabulary: 'ICD-10', display: 'Curved spine (scoliosis)' } },
    { id: 'evt-m09', timestamp: '2026-04-20T08:30:00Z', system: 'pulmonary', data: { code: 'J93.11', vocabulary: 'ICD-10', display: 'Collapsed lung (spontaneous pneumothorax)' } },
  ],
};

const MOCK_HPO_MAP: Record<string, PhenotypeMapping> = {
  'I42.1': { sourceCode: 'I42.1', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001714', hpoLabel: 'Left ventricular hypertrophy', confidence: 0.92 },
  'N18.3': { sourceCode: 'N18.3', sourceVocabulary: 'ICD-10', hpoId: 'HP:0000083', hpoLabel: 'Renal insufficiency', confidence: 0.95 },
  '5804-0': { sourceCode: '5804-0', sourceVocabulary: 'LOINC', hpoId: 'HP:0000093', hpoLabel: 'Proteinuria', confidence: 0.88 },
  'G62.9': { sourceCode: 'G62.9', sourceVocabulary: 'ICD-10', hpoId: 'HP:0002498', hpoLabel: 'Acroparesthesia', confidence: 0.85 },
  'R25.1': { sourceCode: 'R25.1', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001337', hpoLabel: 'Tremor', confidence: 0.90 },
  'L81.8': { sourceCode: 'L81.8', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001019', hpoLabel: 'Angiokeratoma', confidence: 0.93 },
  'H18.49': { sourceCode: 'H18.49', sourceVocabulary: 'ICD-10', hpoId: 'HP:0000629', hpoLabel: 'Cornea verticillata', confidence: 0.91 },
  'K74.6': { sourceCode: 'K74.6', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001394', hpoLabel: 'Liver cirrhosis', confidence: 0.94 },
  'M13.89': { sourceCode: 'M13.89', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001369', hpoLabel: 'Arthropathy', confidence: 0.80 },
  'E11.9': { sourceCode: 'E11.9', sourceVocabulary: 'ICD-10', hpoId: 'HP:0000819', hpoLabel: 'Diabetes mellitus', confidence: 0.97 },
  'R06.0': { sourceCode: 'R06.0', sourceVocabulary: 'ICD-10', hpoId: 'HP:0002094', hpoLabel: 'Dyspnea', confidence: 0.89 },
  'R27.0': { sourceCode: 'R27.0', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001260', hpoLabel: 'Dysarthria', confidence: 0.82 },
  'F07.0': { sourceCode: 'F07.0', sourceVocabulary: 'ICD-10', hpoId: 'HP:0000718', hpoLabel: 'Personality changes', confidence: 0.78 },
  'H18.04': { sourceCode: 'H18.04', sourceVocabulary: 'ICD-10', hpoId: 'HP:0002172', hpoLabel: 'Kayser-Fleischer ring', confidence: 0.96 },
  'N25.89': { sourceCode: 'N25.89', sourceVocabulary: 'ICD-10', hpoId: 'HP:0000124', hpoLabel: 'Renal tubular dysfunction', confidence: 0.84 },
  'R05': { sourceCode: 'R05', sourceVocabulary: 'ICD-10', hpoId: 'HP:0012735', hpoLabel: 'Cough', confidence: 0.75 },
  'D86.0': { sourceCode: 'D86.0', sourceVocabulary: 'ICD-10', hpoId: 'HP:0002206', hpoLabel: 'Pulmonary fibrosis', confidence: 0.88 },
  'H20.9': { sourceCode: 'H20.9', sourceVocabulary: 'ICD-10', hpoId: 'HP:0000554', hpoLabel: 'Uveitis', confidence: 0.91 },
  'L52': { sourceCode: 'L52', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001045', hpoLabel: 'Erythema nodosum', confidence: 0.90 },
  'R16.0': { sourceCode: 'R16.0', sourceVocabulary: 'ICD-10', hpoId: 'HP:0002240', hpoLabel: 'Hepatomegaly', confidence: 0.87 },
  'I71.2': { sourceCode: 'I71.2', sourceVocabulary: 'ICD-10', hpoId: 'HP:0002616', hpoLabel: 'Aortic root dilatation', confidence: 0.94 },
  'I34.1': { sourceCode: 'I34.1', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001634', hpoLabel: 'Mitral valve prolapse', confidence: 0.93 },
  'Q67.5': { sourceCode: 'Q67.5', sourceVocabulary: 'ICD-10', hpoId: 'HP:0000767', hpoLabel: 'Pectus excavatum', confidence: 0.95 },
  'M21.41': { sourceCode: 'M21.41', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001763', hpoLabel: 'Pes planus', confidence: 0.88 },
  'Q87.40': { sourceCode: 'Q87.40', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001519', hpoLabel: 'Dolichostenomelia', confidence: 0.92 },
  'H27.10': { sourceCode: 'H27.10', sourceVocabulary: 'ICD-10', hpoId: 'HP:0001083', hpoLabel: 'Ectopia lentis', confidence: 0.97 },
  'H52.1': { sourceCode: 'H52.1', sourceVocabulary: 'ICD-10', hpoId: 'HP:0000545', hpoLabel: 'Myopia', confidence: 0.85 },
  'M41.9': { sourceCode: 'M41.9', sourceVocabulary: 'ICD-10', hpoId: 'HP:0002650', hpoLabel: 'Scoliosis', confidence: 0.90 },
  'J93.11': { sourceCode: 'J93.11', sourceVocabulary: 'ICD-10', hpoId: 'HP:0002107', hpoLabel: 'Pneumothorax', confidence: 0.92 },
};

const MOCK_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  '55908-8': { loincCode: '55908-8', label: 'Alpha-galactosidase A activity', low: 2.5, high: 12.0, unit: 'nmol/h/mg', source: 'HOLON' },
  '2160-0': { loincCode: '2160-0', label: 'Creatinine', low: 0.7, high: 1.3, unit: 'mg/dL', source: 'HOLON' },
  '30934-4': { loincCode: '30934-4', label: 'BNP', low: 0, high: 100, unit: 'pg/mL', source: 'HOLON' },
  '1920-8': { loincCode: '1920-8', label: 'AST (SGOT)', low: 10, high: 40, unit: 'U/L', source: 'HOLON' },
  '1751-7': { loincCode: '1751-7', label: 'Albumin', low: 3.5, high: 5.0, unit: 'g/dL', source: 'HOLON' },
  '1742-6': { loincCode: '1742-6', label: 'ALT (SGPT)', low: 7, high: 56, unit: 'U/L', source: 'HOLON' },
  '17861-6': { loincCode: '17861-6', label: 'Calcium', low: 8.5, high: 10.5, unit: 'mg/dL', source: 'HOLON' },
  '2498-4': { loincCode: '2498-4', label: 'Iron (serum)', low: 60, high: 170, unit: 'µg/dL', source: 'HOLON' },
  '2276-4': { loincCode: '2276-4', label: 'Ferritin', low: 12, high: 300, unit: 'ng/mL', source: 'HOLON' },
  '1847-3': { loincCode: '1847-3', label: 'Amyloid A protein', low: 0, high: 6.4, unit: 'mg/L', source: 'HOLON' },
};

// ─── DTP Wrapper Class ─────────────────────────────────
// Uses the real SDK when credentials are configured, falls back to
// mock data for demo mode. The rest of the app doesn't need to know.

export class ConstellationDTP {
  private realDtp: RealDTP | null = null;
  private isReal: boolean;

  constructor() {
    this.isReal = hasRealCredentials();

    if (this.isReal) {
      const config: DTPConfig = {
        apiKey: import.meta.env.VITE_DTP_KEY,
      };
      if (import.meta.env.VITE_HOLON_API_URL) {
        config.holonApiUrl = import.meta.env.VITE_HOLON_API_URL;
      }
      if (import.meta.env.VITE_HOLON_KEY) {
        config.holonApiKey = import.meta.env.VITE_HOLON_KEY;
      }
      this.realDtp = new RealDTP(config);
      console.log('[Constellation] Using real @ontomorph/dtp-sdk');
    } else {
      console.log('[Constellation] No DTP API key found — using demo data');
    }
  }

  /** Whether the real SDK is active */
  get usingRealSDK(): boolean {
    return this.isReal;
  }

  twins = {
    /**
     * Connect to a twin.
     * - Real mode: pass a real grant token, get real twin data
     * - Demo mode: pass a patient ID (e.g. "patient-fabry"), get mock data
     */
    connect: async (tokenOrPatientId: string): Promise<Twin> => {
      if (tokenOrPatientId.startsWith('patient-') || tokenOrPatientId === 'demo-grant-token') {
        return this._connectDemo(tokenOrPatientId);
      }
      if (this.isReal && this.realDtp) {
        return this._connectReal(tokenOrPatientId);
      }
      return this._connectDemo(tokenOrPatientId);
    },
  };

  holon = {
    mappings: {
      /**
       * Translate a clinical code to HPO.
       * Real mode: calls dtp.holon.mappings.translate()
       * Demo mode: uses local lookup table
       */
      translate: async (code: string, sourceVocabulary: string, targetVocabulary: string): Promise<PhenotypeMapping | null> => {
        if (this.isReal && this.realDtp) {
          return this._translateReal(code, sourceVocabulary, targetVocabulary);
        }
        await sleep(50);
        return MOCK_HPO_MAP[code] || null;
      },
    },
    referenceRanges: {
      /**
       * Get reference ranges for a LOINC code.
       * Real mode: calls dtp.holon.referenceRanges.getByLoincCode()
       * Demo mode: uses local lookup table
       */
      getByLoincCode: async (loincCode: string, age?: number, sex?: string): Promise<ReferenceRange | null> => {
        if (this.isReal && this.realDtp) {
          return this._getReferenceRangeReal(loincCode, age, sex);
        }
        await sleep(50);
        return MOCK_REFERENCE_RANGES[loincCode] || null;
      },
    },
  };

  // ─── Real SDK implementations ──────────────────────────

  private async _connectReal(grantToken: string): Promise<Twin> {
    const realTwin = this.realDtp!.twins.connect(grantToken);
    const twinId = realTwin.id;

    return {
      id: twinId,
      name: `Patient ${twinId.slice(-6)}`,
      age: 0, // Not available from grant claims
      sex: 'male',
      events: {
        list: async (): Promise<TwinEvent[]> => {
          const realEvents = await realTwin.events.list();
          return realEvents.map(normalizeHealthEvent);
        },
        stream: (opts: Record<string, unknown>, callback: (event: TwinEvent) => void): StreamHandle => {
          const handle: RealStreamHandle = realTwin.events.stream(
            { system: opts.system as string | undefined, intervalMs: 5000 },
            (evt) => callback(normalizeHealthEvent(evt))
          );
          return { stop: () => handle.stop() };
        },
      },
      flag: async (system: string, data: Record<string, unknown>) => {
        await realTwin.flag(system, {
          code: data.code as string,
          value: data.value as number,
          title: data.title as string,
          description: data.description as string,
        });
      },
    };
  }

  private async _translateReal(code: string, sourceVocabulary: string, targetVocabulary: string): Promise<PhenotypeMapping | null> {
    try {
      const result = await this.realDtp!.holon.mappings.translate(code, sourceVocabulary, targetVocabulary);
      if (result.mappings.length === 0) return null;

      const best = result.mappings[0];
      return {
        sourceCode: code,
        sourceVocabulary,
        hpoId: best.targetConceptCode,
        hpoLabel: best.targetConceptName,
        confidence: 0.9, // SDK doesn't return confidence; use a sensible default
      };
    } catch {
      // Fall back to mock on HOLON errors (missing credentials, etc.)
      return MOCK_HPO_MAP[code] || null;
    }
  }

  private async _getReferenceRangeReal(loincCode: string, age?: number, sex?: string): Promise<ReferenceRange | null> {
    try {
      const result = await this.realDtp!.holon.referenceRanges.getByLoincCode(loincCode, age, sex);
      if (result.ranges.length === 0) return null;

      const range = result.ranges[0];
      return {
        loincCode,
        label: range.conceptName,
        low: parseFloat(range.lowValue || '0'),
        high: parseFloat(range.highValue || '0'),
        unit: range.unit,
        source: range.source || 'HOLON',
      };
    } catch {
      return MOCK_REFERENCE_RANGES[loincCode] || null;
    }
  }

  // ─── Demo mode implementation ──────────────────────────

  private async _connectDemo(patientId: string): Promise<Twin> {
    await sleep(800); // Simulate network

    const profile = DEMO_PATIENTS.find((p) => p.id === patientId) || DEMO_PATIENTS[0];
    const events = PATIENT_EVENTS[profile.id] || PATIENT_EVENTS['patient-fabry'];

    const streamEvents: TwinEvent[] = [
      { id: 'evt-demo-stream-1', timestamp: '', system: events[0]?.system || 'cardiovascular', data: { ...events[0]?.data, display: events[0]?.data.display + ' (follow-up)' } },
    ];

    return {
      id: profile.id,
      name: profile.name,
      age: profile.age,
      sex: profile.sex,
      events: {
        list: async () => {
          await sleep(400);
          return [...events];
        },
        stream: (_opts, callback) => {
          let idx = 0;
          const interval = setInterval(() => {
            if (idx < streamEvents.length) {
              callback({
                ...streamEvents[idx],
                id: `evt-stream-${Date.now()}`,
                timestamp: new Date().toISOString(),
              });
              idx++;
            }
          }, 5000);
          return { stop: () => clearInterval(interval) };
        },
      },
      flag: async (scope, data) => {
        console.log(`[Demo] Flag on ${scope}:`, data);
      },
    };
  }
}

// ─── Factory ───────────────────────────────────────────

/** Create the Constellation DTP client (real SDK or demo fallback) */
export function createDTP(): ConstellationDTP {
  return new ConstellationDTP();
}
