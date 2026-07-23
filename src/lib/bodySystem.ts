/**
 * Maps HPO terms to body system lanes.
 * Uses known HPO hierarchy prefixes and explicit term → system mappings
 * for the conditions in our candidate list.
 */

export type BodySystem =
  | 'cardiovascular'
  | 'nervous'
  | 'renal'
  | 'hepatic'
  | 'ocular'
  | 'dermatological'
  | 'skeletal'
  | 'pulmonary'
  | 'endocrine'
  | 'hematological';

export const BODY_SYSTEM_META: Record<BodySystem, { label: string; color: string }> = {
  cardiovascular:  { label: 'Cardiovascular',  color: '#E8927C' },
  nervous:         { label: 'Nervous',         color: '#A78BFA' },
  renal:           { label: 'Renal',           color: '#60A5FA' },
  hepatic:         { label: 'Hepatic',         color: '#FBBF24' },
  ocular:          { label: 'Ocular',          color: '#34D399' },
  dermatological:  { label: 'Dermatological',  color: '#F472B6' },
  skeletal:        { label: 'Skeletal',        color: '#FB923C' },
  pulmonary:       { label: 'Pulmonary',       color: '#38BDF8' },
  endocrine:       { label: 'Endocrine',       color: '#C084FC' },
  hematological:   { label: 'Hematological',   color: '#F87171' },
};

/**
 * Explicit mapping of HPO term IDs used in our candidate conditions
 * to their body system. This is more reliable than parsing the HPO
 * hierarchy at runtime for our bounded set.
 */
const HPO_TO_SYSTEM: Record<string, BodySystem> = {
  // Cardiovascular
  'HP:0001714': 'cardiovascular',  // Left ventricular hypertrophy
  'HP:0002616': 'cardiovascular',  // Aortic root aneurysm
  'HP:0001638': 'cardiovascular',  // Cardiomyopathy
  'HP:0030843': 'cardiovascular',  // Cardiac amyloidosis
  'HP:0001695': 'cardiovascular',  // Pericardial effusion
  'HP:0030078': 'cardiovascular',  // Lung arteriovenous malformation

  // Nervous
  'HP:0002498': 'nervous',   // Acroparesthesia
  'HP:0001337': 'nervous',   // Tremor
  'HP:0001260': 'nervous',   // Dysarthria
  'HP:0001332': 'nervous',   // Dystonia
  'HP:0100292': 'nervous',   // Peripheral nerve amyloidosis
  'HP:0001250': 'nervous',   // Seizures
  'HP:0002354': 'nervous',   // Cognitive impairment

  // Renal
  'HP:0000083': 'renal',     // Renal insufficiency
  'HP:0000093': 'renal',     // Proteinuria
  'HP:0001917': 'renal',     // Renal amyloidosis
  'HP:0000099': 'renal',     // Glomerulonephritis

  // Hepatic
  'HP:0001394': 'hepatic',   // Liver cirrhosis
  'HP:0002240': 'hepatic',   // Hepatomegaly
  'HP:0012280': 'hepatic',   // Hepatic amyloidosis

  // Ocular
  'HP:0001019': 'ocular',    // Angiokeratoma (actually derm but Fabry overlap)
  'HP:0000632': 'ocular',    // Kayser-Fleischer rings
  'HP:0001083': 'ocular',    // Ectopia lentis
  'HP:0000554': 'ocular',    // Uveitis
  'HP:0000629': 'ocular',    // Cornea verticillata

  // Dermatological
  'HP:0000974': 'dermatological',  // Skin hyperextensibility
  'HP:0000953': 'dermatological',  // Hyperpigmentation
  'HP:0012219': 'dermatological',  // Erythema nodosum
  'HP:0001075': 'dermatological',  // Atrophic scars

  // Skeletal
  'HP:0001519': 'skeletal',  // Arachnodactyly
  'HP:0002650': 'skeletal',  // Scoliosis
  'HP:0001382': 'skeletal',  // Joint hypermobility
  'HP:0001369': 'skeletal',  // Arthropathy

  // Pulmonary
  'HP:0002094': 'pulmonary', // Dyspnea
  'HP:0002088': 'pulmonary', // Abnormal lung morphology
  'HP:0012735': 'pulmonary', // Cough

  // Endocrine
  'HP:0000819': 'endocrine', // Diabetes mellitus
  'HP:0000135': 'endocrine', // Hypogonadism
  'HP:0003072': 'endocrine', // Hypercalcemia

  // Hematological
  'HP:0001903': 'hematological', // Anemia
};

// Re-export for angiokeratoma — correctly dermatological
HPO_TO_SYSTEM['HP:0001019'] = 'dermatological';

export function getBodySystem(hpoId: string): BodySystem {
  return HPO_TO_SYSTEM[hpoId] ?? 'nervous'; // fallback
}

export function getSystemsForHpoIds(hpoIds: string[]): BodySystem[] {
  const systems = new Set(hpoIds.map(getBodySystem));
  return Array.from(systems);
}

export const ALL_SYSTEMS: BodySystem[] = Object.keys(BODY_SYSTEM_META) as BodySystem[];
