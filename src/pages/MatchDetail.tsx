import { useTwin } from '../context/TwinContext';
import { ScoreGauge } from '../components/ScoreGauge';
import { ReasoningTrace } from '../components/ReasoningTrace';
import { MonitoringPlan } from '../components/MonitoringPlan';
import { PhenotypeRadar } from '../components/PhenotypeRadar';
import { SafetyShield } from '../components/SafetyShield';

type Props = {
  matchIndex: number;
  onNavigate: (route: string) => void;
};

export function MatchDetail({ matchIndex, onNavigate }: Props) {
  const { differentialResults, twin, events } = useTwin();

  const result = differentialResults[matchIndex];

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-text-muted text-sm">Match not found.</p>
          <button onClick={() => onNavigate('results')} className="min-h-[44px] px-4 text-signal text-sm hover:underline">
            ← Back to Results
          </button>
        </div>
      </div>
    );
  }

  const { condition, score, matchedFindings } = result;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-[env(safe-area-inset-bottom)]">
      {/* Back button */}
      <button
        onClick={() => onNavigate('results')}
        className="min-h-[44px] inline-flex items-center gap-1.5 text-xs sm:text-sm text-text-muted hover:text-signal transition-colors active:scale-95"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to results
      </button>

      {/* Header */}
      <div className="card p-4 sm:p-6" style={{ animation: 'card-enter 0.3s ease-out' }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
          <ScoreGauge score={score} size={76} strokeWidth={5} label="match" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-center sm:justify-start gap-2 mb-1 flex-wrap">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">{condition.name}</h2>
              <span className="font-mono text-xs text-text-muted">{condition.id}</span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-3">{condition.description}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-signal-dim text-signal font-medium">
                {condition.inheritance}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-surface-raised text-text-muted">
                {matchedFindings.length} of {condition.phenotypeProfile.length} symptoms found
              </span>
              <span className="px-2.5 py-1 rounded-full bg-surface-raised text-text-muted">
                Affects {condition.systems.length} systems
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Phenotype Fingerprint Radar */}
      <PhenotypeRadar result={result} />

      {/* Reasoning Trace */}
      <section>
        <h3 className="font-display text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-signal)" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Why This Match
        </h3>
        <ReasoningTrace result={result} />
      </section>

      {/* HOLON Safety Shield */}
      <SafetyShield patientEvents={events} />

      {/* Monitoring Plan */}
      <section className="card p-4 sm:p-6">
        <MonitoringPlan
          condition={condition}
          patientAge={twin?.age}
          patientSex={twin?.sex}
        />
      </section>

    </div>
  );
}
