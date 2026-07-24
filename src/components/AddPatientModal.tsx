import { useState, useRef, useEffect } from 'react';
import { BODY_SYSTEM_META } from '../lib/bodySystem';
import type { DemoPatient } from '../lib/ontomorph';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: DemoPatient) => Promise<void>;
};

export function AddPatientModal({ isOpen, onClose, onAddPatient }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>(32);
  const [sex, setSex] = useState<'male' | 'female'>('female');
  const [summary, setSummary] = useState('');
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['Cardiovascular', 'Renal']);
  const [expectedMatch, setExpectedMatch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setAge(32);
      setSex('female');
      setSummary('');
      setSelectedSystems(['Cardiovascular', 'Renal']);
      setExpectedMatch('');
      setIsSubmitting(false);
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSystem = (sysLabel: string) => {
    setSelectedSystems((prev) =>
      prev.includes(sysLabel) ? prev.filter((s) => s !== sysLabel) : [...prev, sysLabel]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const patientId = `patient-custom-${Date.now()}`;
      const newPatient: DemoPatient = {
        id: patientId,
        name: name.trim(),
        age: typeof age === 'number' ? age : 30,
        sex,
        summary: summary.trim() || 'Patient digital twin registered for multi-system pattern analysis',
        primarySystems: selectedSystems.length > 0 ? selectedSystems : ['Cardiovascular'],
        expectedTopMatch: expectedMatch.trim() || 'Custom Patient Twin',
      };

      await onAddPatient(newPatient);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSystems = Object.values(BODY_SYSTEM_META).map((s) => s.label);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/80 backdrop-blur-sm animate-fade-in pb-[env(safe-area-inset-bottom)]">
      <div
        className="w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 bg-surface border border-hairline shadow-2xl relative flex flex-col justify-between overflow-y-auto"
        style={{ animation: 'card-enter 0.25s ease-out' }}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-signal/10 flex items-center justify-center text-signal flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="16" y1="11" x2="22" y2="11" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-semibold text-base sm:text-lg text-text-primary">
                  Register New Patient Twin
                </h3>
                <p className="text-xs text-text-muted">Create a clean patient twin dashboard to log findings live</p>
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
            {/* Patient Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-muted">
                Patient Full Name <span className="text-signal">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova, Marcus Vance..."
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-raised border border-hairline text-text-primary text-sm sm:text-base placeholder:text-text-muted/50 focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              />
            </div>

            {/* Age & Sex */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-muted">Age (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-surface-raised border border-hairline text-text-primary text-sm font-mono focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-muted">Biological Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-surface-raised border border-hairline text-text-primary text-sm font-medium focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>

            {/* Initial Intake Summary */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-muted">
                Initial Clinical Intake Summary / Notes
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief clinical description (e.g. Recurrent joint stiffness, butterfly skin rash, and elevated proteinuria)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-hairline text-text-primary text-sm placeholder:text-text-muted/50 focus:border-signal focus:ring-1 focus:ring-signal transition-colors resize-none"
              />
            </div>

            {/* Suspected / Tagged Condition (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-muted">
                Suspected Diagnostic Category (Optional)
              </label>
              <input
                type="text"
                value={expectedMatch}
                onChange={(e) => setExpectedMatch(e.target.value)}
                placeholder="e.g. Autoimmune, Storage Disorder, Connective Tissue..."
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-raised border border-hairline text-text-primary text-sm sm:text-base placeholder:text-text-muted/50 focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
              />
            </div>

            {/* Primary Affected Systems (Multi-select) */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-muted">
                Primary Body Systems Under Investigation
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border border-hairline/40 rounded-xl bg-surface-raised/40">
                {availableSystems.map((sys) => {
                  const isSelected = selectedSystems.includes(sys);
                  return (
                    <button
                      key={sys}
                      type="button"
                      onClick={() => toggleSystem(sys)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1.5 min-h-[32px] ${
                        isSelected
                          ? 'bg-signal/20 text-signal border border-signal/40 font-semibold'
                          : 'bg-surface text-text-muted border border-hairline/50 hover:text-text-primary'
                      }`}
                    >
                      <span>{sys}</span>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
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
                disabled={isSubmitting || !name.trim()}
                className="min-h-[44px] px-5 rounded-xl bg-signal text-ink font-semibold text-xs hover:bg-signal/90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-signal/20 active:scale-95"
              >
                {isSubmitting ? 'Creating Twin...' : 'Create & Open Patient Twin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
