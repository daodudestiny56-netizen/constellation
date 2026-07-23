import { useState, useEffect, useRef } from 'react';
import { CLINICAL_CONCEPTS_DATABASE, type ClinicalConcept } from '../lib/ontomorph';
import { BODY_SYSTEM_META, type BodySystem, getBodySystem } from '../lib/bodySystem';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAddFinding: (finding: {
    display: string;
    code?: string;
    vocabulary?: string;
    system?: string;
    hpoId?: string;
    hpoLabel?: string;
    occurredAt?: string;
  }) => Promise<void>;
};

export function LogFindingModal({ isOpen, onClose, onAddFinding }: Props) {
  const [query, setQuery] = useState('');
  const [selectedConcept, setSelectedConcept] = useState<ClinicalConcept | null>(null);
  const [overrideSystem, setOverrideSystem] = useState<BodySystem | ''>('');
  const [onsetDate, setOnsetDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<ClinicalConcept[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedConcept(null);
      setOverrideSystem('');
      setIsSubmitting(false);
      setShowDropdown(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const q = query.toLowerCase();
    const matches = CLINICAL_CONCEPTS_DATABASE.filter(
      (c) =>
        c.conceptName.toLowerCase().includes(q) ||
        c.conceptCode.toLowerCase().includes(q) ||
        (c.hpoLabel && c.hpoLabel.toLowerCase().includes(q))
    ).slice(0, 6);

    setSuggestions(matches);
    setShowDropdown(true);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectConcept = (concept: ClinicalConcept) => {
    setSelectedConcept(concept);
    setQuery(concept.conceptName);
    setShowDropdown(false);
    if (concept.system) {
      setOverrideSystem(concept.system as BodySystem);
    }
  };

  const determinedSystem: BodySystem =
    (overrideSystem as BodySystem) ||
    (selectedConcept?.system as BodySystem) ||
    (selectedConcept?.hpoId ? getBodySystem(selectedConcept.hpoId) : 'nervous');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddFinding({
        display: selectedConcept ? selectedConcept.conceptName : query.trim(),
        code: selectedConcept?.conceptCode || 'OBS-USER',
        vocabulary: selectedConcept?.vocabularyId || 'CLINICAL',
        system: determinedSystem,
        hpoId: selectedConcept?.hpoId,
        hpoLabel: selectedConcept?.hpoLabel,
        occurredAt: onsetDate ? new Date(onsetDate).toISOString() : new Date().toISOString(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/80 backdrop-blur-sm animate-fade-in pb-[env(safe-area-inset-bottom)]">
      <div
        className="w-full max-w-lg max-h-[92dvh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 bg-surface border border-hairline shadow-2xl relative flex flex-col justify-between overflow-y-auto"
        style={{ animation: 'card-enter 0.25s ease-out' }}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-signal/10 flex items-center justify-center text-signal flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-semibold text-base sm:text-lg text-text-primary">Log Clinical Finding</h3>
                <p className="text-xs text-text-muted">Search symptom or observation to add to twin</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-raised active:scale-95"
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Observation or Symptom Name
              </label>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedConcept(null);
                }}
                placeholder="e.g. Hypertrophic cardiomyopathy, Proteinuria..."
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-raised border border-hairline text-text-primary font-mono text-xs sm:text-sm placeholder:text-text-muted/50 focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              />

              {/* Autocomplete Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-raised border border-hairline rounded-xl shadow-xl z-20 max-h-52 overflow-y-auto divide-y divide-hairline/30">
                  {suggestions.map((item) => (
                    <button
                      key={`${item.conceptCode}-${item.conceptName}`}
                      type="button"
                      onClick={() => handleSelectConcept(item)}
                      className="w-full text-left px-3.5 py-3 hover:bg-surface transition-colors flex items-center justify-between text-xs group min-h-[44px]"
                    >
                      <div>
                        <p className="font-medium text-text-primary group-hover:text-signal transition-colors">
                          {item.conceptName}
                        </p>
                        <p className="text-[10px] text-text-muted font-mono mt-0.5">
                          Code: {item.conceptCode} ({item.vocabularyId}) {item.hpoId ? `• ${item.hpoId}` : ''}
                        </p>
                      </div>
                      {item.system && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-surface text-text-muted border border-hairline flex-shrink-0 ml-2">
                          {BODY_SYSTEM_META[item.system as BodySystem]?.label || item.system}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Target Body System Lane & Onset Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-muted">
                  Assigned Body System Lane
                </label>
                <select
                  value={determinedSystem}
                  onChange={(e) => setOverrideSystem(e.target.value as BodySystem)}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-surface-raised border border-hairline text-text-primary text-xs font-medium focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                >
                  {(Object.keys(BODY_SYSTEM_META) as BodySystem[]).map((sys) => (
                    <option key={sys} value={sys}>
                      {BODY_SYSTEM_META[sys].label} Lane
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-muted">
                  Symptom Onset Date
                </label>
                <input
                  type="date"
                  value={onsetDate}
                  onChange={(e) => setOnsetDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-surface-raised border border-hairline text-text-primary font-mono text-xs focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 rounded-xl bg-surface-raised border border-hairline text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !query.trim()}
                className="min-h-[44px] px-5 rounded-xl bg-signal text-ink font-semibold text-xs hover:bg-signal/90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Logging...' : 'Add Finding to Twin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
