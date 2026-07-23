
import { useTwin } from '../context/TwinContext';
import { ScoreGauge } from '../components/ScoreGauge';
import { ReasoningTrace } from '../components/ReasoningTrace';
import { MonitoringPlan } from '../components/MonitoringPlan';
import { QRCode } from '../components/QRCode';

type Props = {
  matchIndex: number;
  onNavigate: (route: string) => void;
};

export function MatchDetail({ matchIndex, onNavigate }: Props) {
  const { differentialResults, twin } = useTwin();

  const result = differentialResults[matchIndex];

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-text-muted">Match not found.</p>
          <button onClick={() => onNavigate('results')} className="text-signal text-sm hover:underline">
            ← Back to Results
          </button>
        </div>
      </div>
    );
  }

  const { condition, score, matchedFindings } = result;
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('results')}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-signal transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to results
      </button>

      {/* Header */}
      <div className="card" style={{ animation: 'card-enter 0.3s ease-out' }}>
        <div className="flex items-start gap-5">
          <ScoreGauge score={score} size={80} strokeWidth={5} label="match" />
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <h2 className="font-display text-2xl font-bold text-text-primary">{condition.name}</h2>
              <span className="font-mono text-xs text-text-muted">{condition.id}</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed mb-3">{condition.description}</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-signal-dim text-signal">
                {condition.inheritance}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-raised text-text-muted">
                {matchedFindings.length} of {condition.phenotypeProfile.length} known symptoms found
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-raised text-text-muted">
                Affects {condition.systems.length} body systems
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning Trace */}
      <section>
        <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
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

      {/* Monitoring Plan */}
      <section className="card">
        <MonitoringPlan
          condition={condition}
          patientAge={twin?.age}
          patientSex={twin?.sex}
        />
      </section>

      {/* QR Code & Actions */}
      <section className="flex flex-col sm:flex-row items-center gap-6 py-4">
        <QRCode url={appUrl} size={140} />
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-sm text-text-muted">
            Scan to open on your phone
          </p>
          <button
            onClick={() => onNavigate('live')}
            className="px-4 py-2 rounded-lg bg-surface-raised border border-hairline text-sm text-signal hover:bg-signal/10 transition-colors"
          >
            Watch for New Results Live →
          </button>
        </div>
      </section>
    </div>
  );
}
