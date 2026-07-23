import { useState, useEffect } from 'react';
import { DRUG_CONCEPTS_DATABASE, createDTP, type DrugConcept, type InteractionListResponse, type InteractionEntry } from '../lib/ontomorph';
import type { SystemEvent } from '../context/TwinContext';

type Props = {
  patientEvents: SystemEvent[];
};

export function SafetyShield({ patientEvents }: Props) {
  const [query, setQuery] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState<DrugConcept[]>([]);
  const [suggestions, setSuggestions] = useState<DrugConcept[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [interactionResult, setInteractionResult] = useState<InteractionListResponse | null>(null);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  // Search autocomplete for medications
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const q = query.toLowerCase();
    const matches = DRUG_CONCEPTS_DATABASE.filter(
      (d) =>
        (d.conceptName.toLowerCase().includes(q) || (d.drugClass && d.drugClass.toLowerCase().includes(q))) &&
        !selectedDrugs.some((sd) => sd.conceptId === d.conceptId)
    );
    setSuggestions(matches);
    setShowDropdown(true);
  }, [query, selectedDrugs]);

  // Query HOLON checkList API when selected drugs change
  useEffect(() => {
    if (selectedDrugs.length < 2) {
      setInteractionResult(null);
      return;
    }

    const dtp = createDTP();
    const checkInteractions = async () => {
      setLoadingInteractions(true);
      try {
        const res = await dtp.holon.interactions.checkList(selectedDrugs.map((d) => d.conceptId));
        setInteractionResult(res);
      } finally {
        setLoadingInteractions(false);
      }
    };
    checkInteractions();
  }, [selectedDrugs]);

  const handleAddDrug = (drug: DrugConcept) => {
    setSelectedDrugs((prev) => [...prev, drug]);
    setQuery('');
    setShowDropdown(false);
  };

  const handleRemoveDrug = (conceptId: number) => {
    setSelectedDrugs((prev) => prev.filter((d) => d.conceptId !== conceptId));
  };

  // Cross-reference patient's active organ findings against selected drugs
  const hasRenalImpairment = patientEvents.some(
    (e) => e.system === 'renal' || e.data.display.toLowerCase().includes('kidney') || e.data.display.toLowerCase().includes('proteinuria')
  );
  const hasHepaticImpairment = patientEvents.some(
    (e) => e.system === 'hepatic' || e.data.display.toLowerCase().includes('liver') || e.data.display.toLowerCase().includes('ast')
  );

  const nephrotoxicDrugs = selectedDrugs.filter((d) => d.nephrotoxic);
  const hepatotoxicDrugs = selectedDrugs.filter((d) => d.hepatotoxic);

  return (
    <div className="card p-4 sm:p-6 space-y-5 border border-hairline">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-flag-dim text-flag flex items-center justify-center font-bold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-semibold text-base text-text-primary">
              Safety & Treatment Considerations
            </h3>
            <p className="text-xs text-text-muted">
              Drug interaction checks & organ impairment cross-references
            </p>
          </div>
        </div>
      </div>

      {/* Medication Search Input */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-text-muted">
          Add Patient Medications (Current or Proposed)
        </label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type medication name (e.g. Ibuprofen, Warfarin, Aspirin, Tacrolimus)..."
            className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-surface-raised border border-hairline text-text-primary text-xs font-mono placeholder:text-text-muted/50 focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
          />

          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface-raised border border-hairline rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-hairline/30">
              {suggestions.map((drug) => (
                <button
                  key={drug.conceptId}
                  type="button"
                  onClick={() => handleAddDrug(drug)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-surface transition-colors flex items-center justify-between text-xs min-h-[44px]"
                >
                  <span className="font-medium text-text-primary">{drug.conceptName}</span>
                  {drug.drugClass && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-surface text-text-muted border border-hairline font-mono">
                      {drug.drugClass}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Drugs Chips */}
        {selectedDrugs.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedDrugs.map((drug) => (
              <span
                key={drug.conceptId}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-raised border border-signal/30 text-xs font-medium text-text-primary"
              >
                <span>{drug.conceptName}</span>
                <button
                  onClick={() => handleRemoveDrug(drug.conceptId)}
                  className="text-text-muted hover:text-flag transition-colors ml-1 font-bold text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {selectedDrugs.length === 0 && (
        <div className="p-4 rounded-xl bg-surface-raised/40 border border-dashed border-hairline text-center space-y-1">
          <p className="text-xs font-medium text-text-primary">No medications added yet</p>
          <p className="text-[11px] text-text-muted">
            Add patient medications above to query the HOLON Drug Interaction API & run organ impairment safety checks.
          </p>
        </div>
      )}

      {/* ─── HOLON Interaction API Results (Platform Data) ─── */}
      {selectedDrugs.length >= 2 && (
        <div className="space-y-3 pt-2 border-t border-hairline/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-signal uppercase tracking-wider">
              HOLON API Interaction Check ({interactionResult?.totalInteractions || 0} found)
            </span>
            <span className="text-[10px] text-text-muted font-mono">Verified API</span>
          </div>

          {loadingInteractions ? (
            <p className="text-xs text-text-muted animate-pulse">Querying HOLON Drug Interaction API...</p>
          ) : interactionResult && interactionResult.pairs.length > 0 ? (
            <div className="space-y-2.5">
              {interactionResult.pairs.map((pair: { drugA: number; drugB: number; interactions: InteractionEntry[] }, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-flag-dim/30 border border-flag/40 space-y-2 text-xs">
                  {pair.interactions.map((item: InteractionEntry) => (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary text-xs">
                          {item.drugAName} + {item.drugBName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-flag text-ink uppercase">
                          {item.severity} SEVERITY
                        </span>
                      </div>
                      <p className="text-text-muted leading-relaxed">
                        <strong className="text-text-primary">Mechanism:</strong> {item.mechanism}
                      </p>
                      <p className="text-text-muted leading-relaxed">
                        <strong className="text-text-primary">Clinical Effect:</strong> {item.clinicalEffect}
                      </p>
                      <p className="text-signal leading-relaxed font-medium">
                        <strong className="text-text-primary">Management:</strong> {item.management}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">No known pairwise drug interactions reported by HOLON API.</p>
          )}
        </div>
      )}

      {/* ─── Clinical Considerations based on Patient's Findings (Custom Clinical Layer) ─── */}
      {selectedDrugs.length > 0 && (hasRenalImpairment || hasHepaticImpairment) && (
        <div className="p-4 rounded-xl bg-surface-raised border border-amber-500/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-400 font-display">
              Clinical considerations based on this patient's findings
            </span>
            <span className="text-[10px] text-text-muted font-mono">Organ Impairment Cross-Reference</span>
          </div>

          {hasRenalImpairment && nephrotoxicDrugs.length > 0 && (
            <div className="space-y-1">
              <p className="text-text-primary font-medium">
                Renal Safety Alert:
              </p>
              <p className="text-text-muted leading-relaxed">
                Patient has active <strong className="text-text-primary">Renal System findings</strong> (kidney impairment / proteinuria). Use caution with nephrotoxic drug(s):{' '}
                <strong className="text-signal">{nephrotoxicDrugs.map((d) => d.conceptName).join(', ')}</strong>.
              </p>
            </div>
          )}

          {hasHepaticImpairment && hepatotoxicDrugs.length > 0 && (
            <div className="space-y-1 pt-1">
              <p className="text-text-primary font-medium">
                Hepatic Safety Alert:
              </p>
              <p className="text-text-muted leading-relaxed">
                Patient has active <strong className="text-text-primary">Hepatic System findings</strong> (elevated liver enzymes / cirrhosis). Use caution with hepatotoxic drug(s):{' '}
                <strong className="text-signal">{hepatotoxicDrugs.map((d) => d.conceptName).join(', ')}</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
